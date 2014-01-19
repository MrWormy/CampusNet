App.Views.eventHandler = Backbone.View.extend( {

  initialize: function ( ) {
    this.preload( );
    this.afterLoad( );
  },

  preload: function ( ) {
    var preload = new App.Views.preload( ),
      tileset,
      map;
    this.listenToOnce( app, 'tileset:loaded', function ( ts ) {
      tileset = ts;
      this.testLoadMap( );
    } );
    this.listenToOnce( app, 'map:loaded', function ( mp ) {
      map = mp;
      this.testLoadTilesSet( );
    } );
    this.listenToOnce( app, 'preload:ended', function ( ) {
      preload.loadTiles( tileset, map );
    } );

  },

  testLoadMap: function ( ) {
    this.tileSetLoaded = true;
    if ( this.mapLoaded ) {
      app.trigger( 'preload:ended' );
    }
  },

  testLoadTilesSet: function ( ) {
    this.mapLoaded = true;
    if ( this.tileSetLoaded ) {
      app.trigger( 'preload:ended' );
    }
  },

  afterLoad: function ( ) {
    this.listenTo( app, 'load:ended', this.drawMap );
  },

  drawMap: function ( firstMap ) {
    firstMap.initMap( );
    console.log( 'Données chargées' );
    var myCanvas = new App.Models.Canvas( );
    var screenView = new App.Views.Screen( {
      model: myCanvas
    } );
    var drawingView = new App.Views.DrawMap( {
      model: firstMap
    } );
  }

} );
