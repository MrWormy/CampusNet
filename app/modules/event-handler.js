App.Views.eventHandler = Backbone.View.extend( {

  initialize: function ( ) {
    this.preload( );
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
  }

} );
