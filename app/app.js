var App = {
  Models: {},
  Collections: {},
  Views: {},
  Images: {},
  Frames: [ ],
  socket: {},

  template: function ( id ) {
    return _.template( $( '#template' + id ).html( ) );
  }
};

var app = {}
_.extend( app, Backbone.Events );

$( function ( ) {
//test commit
  var canvasView = new App.Views.CanvasView( );

} );
