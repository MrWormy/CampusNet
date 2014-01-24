App.Views.Socket = Backbone.View.extend( {

  initialize: function ( ) {
    App.socket = io.connect( 'http://localhost:19872' );
    App.socket.emit('init', {"init": "bonjour"});
    // App.socket.on( 'message', function ( data ) {
    //   app.trigger( 'message:recieved', data );
    // } );
  }

} );
