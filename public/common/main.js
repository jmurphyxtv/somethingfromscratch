var socket;

$(document).ready(function() {

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
    $(this).animate({'borderRadius': '25px'}, 300, 'linear');
  });

  $('body').on('mouseout', 'nav a', function() {
    $(this).stop().animate({'borderRadius': '0px'}, 250, 'linear');
  });

  $('body').on('click', 'nav a', function() {
    $(this).clone(true).insertAfter($(this));
    $(this).remove();
    console.log('asd')
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
    console.log(height, distanceFromTop);
    $('#content').css('height', (height-distanceFromTop-23) + 'px');
  };

  $( window ).resize(function() {
    handleResize();
  });

  handleResize();

});
