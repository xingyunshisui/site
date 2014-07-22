var clientWidth = document.documentElement.clientWidth
var clientHeight = document.documentElement.clientHeight
var canvas = document.createElement('canvas')
byId('pages').appendChild(canvas)
document.body.style.height = clientHeight + 'px'
var canvasWidth = canvas.width = clientWidth
var canvasHeight = canvas.height = clientHeight
var ctx = canvas.getContext('2d')
globalCompositeOperation = 'source-over' // 解决部分手机白屏问题

var image = new Image();
image.onload = function() {
  var ratio = image.height / canvas.height
  var drawImageWidth = image.width / ratio
  ctx.drawImage(image, -(drawImageWidth - canvas.width) / 2, 0, drawImageWidth, canvas.height);
  initPen();
  // for (var i = 0; i < 10; i++) {
  // ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
  //   ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height)
  // }
  // ctx.stroke();
  forceRepaint(canvas);
}
image.src = './mask.png';

function byId(id) {
  return document.getElementById(id);
}

function initPen() {
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineWidth = '30'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath();
}

canvas.addEventListener('touchstart', function(e) {
  e.stopPropagation();
  var touch = e.changedTouches[0]
  ctx.moveTo(touch.clientX, touch.clientY);
}, false);

canvas.addEventListener('touchmove', function(e) {
  e.preventDefault();
  e.stopPropagation();
  var touch = e.changedTouches[0]
  ctx.lineTo(touch.clientX, touch.clientY);
  ctx.stroke();
  // forceRepaint(canvas);
}, false);

canvas.addEventListener('touchend', function(e) {
  e.stopPropagation();
  if (checkScrapeFinished()) {
    endScrape();
  }
}, false);

function forceRepaint(elem) {
  if (!elem.style.opacity) {
    elem.style.opacity = 0.999;
  } else {
    elem.style.opacity = '';
  }

  elem.style.display='none';
  elem.offsetHeight;
  elem.style.display='block';
}

function checkScrapeFinished() {
  var pixels = 0
  var clearedPixels = 0

  var left1 = canvasWidth * 0.156
  var top1 = left1 * 1.16
  var width1 = canvasWidth * 0.412
  var height1 = width1 * 1.234

  var left2 = canvasWidth * 0.696
  var top2 = left2 * 0.354
  var width2 = canvasWidth * 0.271
  var height2 = width2 * 1.747

  calcPixels(left1, top1, width1, height1);
  calcPixels(left2, top2, width2, height2);

  function calcPixels(left, top, width, height) {
    var data = ctx.getImageData(left, top, width, height).data;

    for (var i = 0; i < data.length; i += 4) {
      pixels++;
      if (data[i + 3] == 0) clearedPixels++;
    }
  }

  return clearedPixels / pixels > 0.7
}

function checkRegion(touch) {
  // 检查是否在刮的区域内
  return (touch.clientX > region.left && touch.clientX < region.right &&
    touch.clientY > region.top && touch.clientY < region.bottom);
}

function checkElements() {
  var elements = wrap.querySelectorAll('.active-el'),
    pixels = 0,
    clearedPixels = 0,
    rect, left, top, width, height;

  if (elements.length === 0) {
    elements = wrap.querySelectorAll('*');
  }

  for (var j = 0; j < elements.length; j++) {
    rect = elements[j].getClientRects()[0];
    if (!rect) continue;
    left = rect.left - region.left;
    top = rect.top - region.top;
    width = rect.right - rect.left;
    height = rect.bottom - rect.top;
    data = context.getImageData(left, top, width, height).data;

    for (var i = 0; i < data.length; i += 4) {
      pixels++;
      if (data[i + 3] == 0) clearedPixels++;
    }
  }

  return clearedPixels / pixels;
}

function endScrape() {
  canvas.style.webkitTransition = 'opacity 0.6s ease';
  canvas.style.opacity = 0;
  setTimeout(function() {
    canvas.style.display = 'none';
    // opt.onfinish && opt.onfinish();
  }, 600);

  touchme.style.display = 'none';
  tryagain.style.display = 'block';
}

var scrapeEnd = false;
var index = byId('index')
var touchme = byId('touchme')
var tryagain = byId('tryagain')
var page2 = document.querySelector('.page2')
setTransform(page2, 'translate3d(0, ' + clientHeight + 'px, 0)')
page2.style.zIndex = 2;

byId('tryagain').addEventListener('touchstart', function() {
  // index.style.display = 'none'
  // tryagain.style.display = 'none'
  setTransitionDuratoin(index, 0.3)
  setTransitionDuratoin(page2, 0.3)
  setTransform(index, 'translate3d(0, ' + -MIN_TRANSLATION_Y + 'px, 0) scale(' + MIN_SCALE + ')')
  setTransform(page2, 'translate3d(0, 0, 0)')
  setTimeout(function() {
    scrapeEnd = true
    setTransitionDuratoin(index, 0)
    setTransitionDuratoin(page2, 0)
    index.style.display = 'none'
    tryagain.style.display = 'none'
  }, 300)
}, false)

// var page2 = byId('index')
// page2.addEventListener('touchstart', function(e) {

// }, false);

// page2.addEventListener('touchmove', function(e) {

// }, false);

// page2.addEventListener('touchend', function(e) {

// }, false);

var MAX_ANIMATION_TOUCH_MOVE_TIME = 200;
var MIN_SCALE = 0.8
var MIN_TRANSLATION_Y = 107
var touchStartTime;
var startY;
var startYInMove
var currentPage = document.querySelector('.page2')
var nextPage = currentPage.previousElementSibling
var prevPage = document.querySelector('.page13')
currentPage.style.display = 'block'
nextPage.style.display = 'block'
setStyle(prevPage, 'display', 'block')

function initPage() {
  setTransform(nextPage, 'translate3d(0, ' + clientHeight + 'px, 0)')
  setTransform(prevPage, 'translate3d(0, ' + -clientHeight + 'px, 0)')
}

initPage()

var initScale = 1
var animating = false

document.addEventListener('touchstart', function(e) {
  if (!scrapeEnd) {
    return
  }
  var changedTouch = e.changedTouches[0];
      // self._setTransitionDuratoin(0);
      touchStartTime = +new Date();
  startY = startYInMove = changedTouch.clientY;
  initScale = 1;
  // currentPage.style.zIndex = 1;
  // nextPage.style.zIndex = 2;

  currentPage.style.zIndex = 1
      nextPage.style.zIndex = 2
      nextPage.style.display = 'block'
      prevPage.style.zIndex = 2
      prevPage.style.display = 'block'
}, false);

document.addEventListener('touchmove', function(e) {
  if (!scrapeEnd || animating) {
    return
  }

  // animating = true
  e.preventDefault();
  var changedTouch = e.changedTouches[0];
  // var now = +new Date();
  var clientY = changedTouch.clientY;
  var offsetY = clientY - startYInMove;
  var showNextPage = clientY -startY < 0
  var nextVisiblePage;
  // var nextVisiblePageTransitionY

  var nextPageTransitionY = getCurrentTransition(nextPage, 1)
  var prevPageTransitionY = getCurrentTransition(prevPage, 1)
  var currentPageTransitionY = getCurrentTransition(currentPage, 1)
  var scale = initScale + (offsetY / clientHeight) / 5

  // if (offsetY < 0 && currentPageTransitionY > 0) {
  //   currentPageTransitionY = 0
  // }

  // if (scale > 1) {
  //   scale = 1 - (scale - 1) / clientHeight / 5
  // }

  // 向上拖动
  if (offsetY < 0) {
    if (!showNextPage) {
      scale = initScale + (-offsetY / clientHeight) / 5

    }
    nextVisiblePage = nextPage
    // nextPage.style.zIndex = 2;
    // setTransform(nextPage, 'translate3d(0,' + (nextPageTransitionY + offsetY) + 'px, 0)')
    // setTransform(currentPage, 'translate3d(0, ' + (currentPageTransitionY + offsetY / 6) + 'px,' +
    //   (0) + 'px) scale(' + scale + ')')
  } else {
    if (!showNextPage) {
    scale = initScale + (-offsetY / clientHeight) / 5

    }
    nextVisiblePage = prevPage
    // scale = initScale + (-offsetY / clientHeight) / 5
  }

  var nextVisiblePageTransitionY = getCurrentTransition(nextVisiblePage, 1)
  // nextVisiblePage.style.zIndex = 2;
  // setTransform(nextVisiblePage, 'translate3d(0,' + (nextVisiblePageTransitionY + offsetY) + 'px, 0)')
  // setTransform(currentPage, 'translate3d(0, ' + (currentPageTransitionY + offsetY / 6) + 'px,' +
  //   (0) + 'px) scale(' + scale + ')')

  setTransform(currentPage, 'translate3d(0, ' + (currentPageTransitionY + offsetY / 6) + 'px,' +
    (0) + 'px) scale(' + scale + ')')
  if (showNextPage) {
setTransform(nextPage, 'translate3d(0,' + (nextPageTransitionY + offsetY) + 'px, 0)')
setTransform(prevPage, 'translate3d(0,' + -clientHeight + 'px, 0)')

  } else {
setTransform(prevPage, 'translate3d(0,' + (prevPageTransitionY + offsetY) + 'px, 0)')
setTransform(nextPage, 'translate3d(0,' + clientHeight + 'px, 0)')
    
  }


  initScale = scale
  startYInMove = clientY;
}, false);

var prevVisiblePage;
document.addEventListener('touchend', function(e) {
  if (!scrapeEnd || animating) {
    return 
  }

  var changedTouch = e.changedTouches[0];
  var now = +new Date();
  var offsetY = changedTouch.clientY - startY
  var nextVisiblePage
  // var prevVisiblePage
  var resetTransitionY = clientHeight
  var targetTransitionY = -MIN_TRANSLATION_Y

  // 向上拖动
  if (offsetY < 0) {
    nextVisiblePage = nextPage
  } else {
    nextVisiblePage = prevPage
    resetTransitionY = -clientHeight
    targetTransitionY = MIN_TRANSLATION_Y
  }

  var nextVisiblePageTransitionY = getCurrentTransition(nextVisiblePage, 1)

  // var nextPageTransitionY = getCurrentTransition(nextPage, 1)
  setTransitionDuratoin(currentPage, 0.3)
  setTransitionDuratoin(nextVisiblePage, 0.3)
  
  if ((now - touchStartTime < MAX_ANIMATION_TOUCH_MOVE_TIME && Math.abs(offsetY) > 50) ||
      Math.abs(offsetY) / clientHeight > 0.2) {
    animating = true
    setTransform(currentPage, 'translate3d(0, ' + targetTransitionY + 'px, 0) scale(' + MIN_SCALE + ')')
    setTransform(nextVisiblePage, 'translate3d(0, 0, 0)')
    prevVisiblePage = currentPage;
    prevVisiblePage.style.zIndex = ''
    currentPage = nextVisiblePage
    nextPage = currentPage.previousElementSibling
    prevPage = currentPage.nextElementSibling
    if (!nextPage) {
      nextPage = document.querySelector('.page2')
    }

    if (!prevPage || prevPage.id == 'index') {
      prevPage = document.querySelector('.page13')
    }

    
    setTimeout(function() {
      setTransitionDuratoin(currentPage, 0)
      setTransitionDuratoin(nextPage, 0)
      setTransitionDuratoin(prevPage, 0)
      setTransform(nextPage, 'translate3d(0, ' + clientHeight + 'px, 0)')
      setTransform(prevPage, 'translate3d(0, ' + -clientHeight + 'px, 0)')
      prevVisiblePage.style.display = 'none';
      animating = false
    }, 300)
  } else {
    setTransform(currentPage, 'translate3d(0, 0, 0) scale(1)')
    setTransform(nextVisiblePage, 'translate3d(0, ' + resetTransitionY + 'px, 0)')
  }
}, false);

function setTransform(elem, value) {
  elem.style.webkitTransform = value;
}

function getCurrentTransition(elem, index) {
  var transform = elem.style.getPropertyCSSValue('-webkit-transform');
  return transform ? parseFloat(transform[0][index].cssText) : 0;
}

function setTransitionDuratoin(elem, s) {
  var value = 'all ' + s + 's ease-out';
  elem.style.webkitTransition = value;
  elem.style.transition = value;
}

function setStyle(elem, property, value) {
  if (elem) {
    elem.style[property] = value;
  }
}