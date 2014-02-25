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
  tw: 0,

  template: function ( id ) {
    return _.template( $( '#template' + id ).html( ) );
  }
};

var app = {}
_.extend( app, Backbone.Events );

$( function ( ) {
  App.Stages.mapStage = new createjs.Stage( "mapCanvas" );
  App.Stages.characterStage = new createjs.Stage( "charactersCanvas" );
  App.views.drawings = new App.Views.Drawings();
  var eventHandler = new App.Views.eventHandler( );
} );
