var App = {
  Models: {},
  Collections: {},
  Views: {},
  Frames: [],
  socket: {},

  template: function ( id ) {
    return _.template( $( '#template' + id ).html( ) );
  }
};

var app = {}
_.extend( app, Backbone.Events );

$( function ( ) {

  var eventHandler = new App.Views.eventHandler( );

} );
