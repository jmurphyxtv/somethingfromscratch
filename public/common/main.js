var socket;

$(document).ready(function() {

  $( "#bgImg" ).each(function() {
    var attr = $( "#bgImg" ).attr('data-image-src');

    if (typeof attr !== typeof undefined && attr !== false) {
        $(this).css('background', 'url('+attr+')');
    }

  });

  $('body').on('click', 'nav a', function(evt) {
    evt.preventDefault();
    socket.emit('getPage', {page: $(this).attr('href')});
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
    $('#content').css('height', (height-distanceFromTop-63) + 'px');
  };

  $( window ).resize(function() {
    handleResize();
  });

  handleResize();

});
