var socket;
var isTouch;

$(document).ready(function() {

  function is_touch_device() {
    return 'ontouchstart' in window        // works on most browsers
        || navigator.maxTouchPoints;       // works on IE10/11 and Surface
  };

  isTouch = is_touch_device();

  $(".bgImg").each(function() {
    var attr = $(this).attr('data-image-src');

    if (typeof attr !== typeof undefined && attr !== false) {
      $(this).css('background', 'url('+attr+')');
    }

  });

  $('body').on('click', 'nav a', function(evt) {
    evt.preventDefault();
    socket.emit('getPage', {page: $(this).attr('href')});
  });

  $('body').on('mouseover', 'nav a', function() {
    $(this).animate({'borderRadius': '25px'}, 200, 'easeOutCubic');
  });

  $('body').on('mouseout', 'nav a', function() {
    $(this).stop().animate({'borderRadius': '0px'}, 300, 'linear');
  });

  $('body').on('click', 'nav a', function() {
    // fixes sticky hovers on touch devices
    $(this).clone(true).insertAfter($(this));
    $(this).remove();
  });

  socket = io();

  socket.on('pageData', function(data) {
    window.history.pushState(data.html,data.title,data.title)
    $('#content > div').html(data.html);
    $('#pageJS').html(data.js);
  });

  var handleResize = function() {
    var height = $(window).height();
    var distanceFromTop = $('#content').offset().top;
    var footerHeight = ($(window).width()>=768) ? 63 : 23;
    $('#content').css('height', (height-distanceFromTop-footerHeight) + 'px');
  };

  $( window ).resize(function() {
    handleResize();
  });

  handleResize();

});
