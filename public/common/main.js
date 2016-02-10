var socket;
var windowHeight;
var pagesVisited = [];
// var isTouch;

$(document).ready(function() {

  var handleResize = function() {
    windowHeight = $(window).height();
    var distanceFromTop = $('#content').offset().top;
    var footerHeight = ($(window).width()>=768) ? 50 : 23;
    $('#content').css('height', (windowHeight-distanceFromTop-footerHeight) + 'px');
  };

  $( window ).resize(function() {
    handleResize();
  });

  handleResize();

  function is_touch_device() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
  };

  isTouch = is_touch_device();

  if (isTouch) {
    $('body').on('click', 'nav a', function() {
      // fixes sticky hovers on touch devices
      console.log('touchasda');
      var $btn = $(this);
      $btn.clone(true).insertAfter($(this));
      $btn.remove();
      setTimeout(function() {
        // maybe?
        $btn.blur();
      }, 700);
    });
  } else {
    console.log('ok')
    // $('#container').css('top', windowHeight + 'px');
    // $('#container').css('position', 'relative');
    $('#container').hide();
    $('nav div').css('left', '-1000px');
    $('nav div').css('position', 'relative');
    // setTimeout(function() {
    //   $('#container').animate({'top': '0px'}, 1500);
    // }, 500);
    $('#container').fadeIn(1000);
    setTimeout(function() {
      $('nav div').animate({'left': '0px'}, 2500, 'easeOutCubic');
    }, 2300);
  }

  $(".bgImg").each(function() {
    var attr = $(this).attr('data-image-src');

    if (typeof attr !== typeof undefined && attr !== false) {
      $(this).css('background', 'url('+attr+')');
    }

  });

  $('body').on('click', 'nav a', function(evt) {
    evt.preventDefault();
    socket.emit('getPage', {page: $(this).attr('href')});
    $(this).blur();
  });

  // $('body').on('mouseover', 'nav span', function() {
  //   $(this).find('a').animate({'borderRadius': '25px'}, 200, 'easeOutCubic');
  // });
  //
  // $('body').on('mouseout', 'nav span', function() {
  //   $(this).find('a').stop().animate({'borderRadius': '0px'}, 300, 'linear');
  // });

  socket = io();

  socket.on('pageData', function(data) {
    window.history.pushState(data.html,data.title,data.title)
    $('#content > div').html(data.html);
    eval(data.js);
  });


});
