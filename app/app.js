var App = {
  Models: {},
  Collections: {},
  Views: {},
  Stages: {},
  models: {},
  collections: {},
  views: {},
  socket: {},
  tileset: {},
  map: [ ],
  perso: {},

  template: function ( id ) {
    return _.template( $( '#template' + id ).html( ) );
  }
};

var app = {}
_.extend( app, Backbone.Events );

$( function ( ) {

  new App.Views.Socket( );
  App.Stages.mapStage = new createjs.Stage( "mapCanvas" );
  App.Stages.characterStage = new createjs.Stage( "charactersCanvas" )
  var eventHandler = new App.Views.eventHandler( );
} );
