var socket;

$(document).ready(function() {

  $('body').on('click', 'nav a', function(evt) {
    socket.emit('getPage', {page: $(this).text().toLowerCase()});
  });

  socket = io();

  socket.on('pageData', function(data) {
    window.history.pushState(data.html,data.title,data.title)
    $('#content').html(data.html);
    $('#pageJS').html(data.js);
  });

});
