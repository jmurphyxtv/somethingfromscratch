var socket;
var windowHeight;
var pagesVisited = [];
// var isTouch;

var getPageFromUrl = function(mage, pageReq) {
  var pages = mage.pages;
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    if (page.name.toUpperCase() === pageReq.toUpperCase()) {
      return page;
    }
  }
  return null;
}

$(document).ready(function() {

  function is_touch_device() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
  };

  isTouch = is_touch_device();

  if (isTouch) {
    $('body').on('click', 'nav a', function() {
      // fixes sticky hovers on touch devices
      console.log('touchasda');
      $(this).clone(true).insertAfter($(this));
      $(this).remove();
    });
  } else {
    console.log('ok')
    // $('#container').css('top', windowHeight + 'px');
    // $('#container').css('position', 'relative');
    // $('#container').hide();
    // $('#container').fadeIn(1000);
    // $('nav div').css('left', '-1000px');
    // $('nav div').css('position', 'relative');
    // setTimeout(function() {
    //   $('#container').animate({'top': '0px'}, 1500);
    // }, 500);
    // setTimeout(function() {
    //   $('nav div').animate({'left': '0px'}, 1500, 'easeOutCubic');
    // }, 300);
  }

  $(".bgImg").each(function() {
    var attr = $(this).attr('data-image-src');

    if (typeof attr !== typeof undefined && attr !== false) {
      $(this).css('background', 'url('+attr+')');
    }

  });

  $('body').on('mousedown', 'nav a', function(evt) {
    evt.preventDefault();
    var pageClicked = $(this).attr('href').slice(1);
    var clickedPage = getPageFromUrl(currentMage, pageClicked);
    $('#content div').html(clickedPage.content);
    document.title = currentMage.name + ' | ' + clickedPage.name;
    var pathsplit = window.location.pathname.split('/');
    var prepend = (pathsplit.length === 2) ? pathsplit[1]+'/' : '';
    window.history.pushState(clickedPage.content,clickedPage.name,prepend+clickedPage.name.toLowerCase());
    $(this).blur();
    setSelectedNav($(this));
  });

  $('body').on('click', 'nav a', function(evt) {
    evt.preventDefault();
  });

  // $('body').on('mouseover', 'nav a', function() {
  //   $(this).animate({'borderRadius': '25px'}, 200, 'easeOutCubic');
  // });
  //
  // $('body').on('mouseout', 'nav a', function() {
  //   $(this).stop().animate({'borderRadius': '0px'}, 300, 'linear');
  // });

  var $header = $('#container > h1');
  if ($header.text().length > 13) {
    $header.css('font-size', parseInt($header.css('font-size'))/2);
  }

  socket = io();

  socket.on('pageData', function(data) {

    $('#content > div').html(data.html);
    eval(data.js);
  });
  var handleResize = function() {
    windowHeight = $(window).height();
    var distanceFromTop = $('#content').offset().top;
    var footerHeight = ($(window).width()>=768) ? 50 : 35;
    console.log(windowHeight,distanceFromTop,footerHeight);
    $('#content').css('height', (windowHeight-distanceFromTop-footerHeight) + 'px');
  };

  $( window ).resize(function() {
    handleResize();
  });

  handleResize();

  var curPage = window.location.pathname.split('/')[2];
  if (curPage) {
    setSelectedNav($('nav a[href="/' + curPage + '"]'));
  } else {
    setSelectedNav($('nav a').first());
  }

  function setSelectedNav($navEl) {
    $('nav a').removeClass('selected-nav');
    $navEl.addClass('selected-nav');
  };

  if (currentMage.headerColor) {
    $('#container > h1').css('background-color', currentMage.headerColor);
  }

  if (currentMage.backgroundImage) {
    $('.bgImg').css('background-image', 'url("' + currentMage.backgroundImage + '")');
  }

  document.ontouchmove = function(event){
    // disable ipad stretch effect
    event.preventDefault();
  }

});

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
