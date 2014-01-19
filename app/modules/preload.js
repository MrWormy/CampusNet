App.Views.preload = Backbone.View.extend( {

  el: "#myCanvas",

  initialize: function ( ) {
    this.loadTileSheet( );
    this.loadMap( );
  },

  loadTileSheet: function ( ) {
    var that = this,
      tileset = new Image( );
    tileset.src = "assets/resources/img/tilesheet.png"
    tileset.onload = function ( ) {
      app.trigger( 'tileset:loaded', tileset );
    };
  },

  loadTiles: function ( tileset, model ) {
    var data = {
      images: [ tileset ],
      frames: {
        width: model.get( "tilewidth" ),
        height: model.get( "tileheight" ),
        regX: 0,
        regY: 0
      }
    },
      spriteSheet = new createjs.SpriteSheet( data );

    this.loadFrames( spriteSheet, model );

  },

  loadFrames: function ( spriteSheet, map ) {
    var length = spriteSheet._frames.length,
      framesLoaded = 0;

    for ( var i = 0; i < length; i++ ) {
      var tempsFrame = createjs.SpriteSheetUtils.extractFrame( spriteSheet, i );
      App.Frames.push( tempsFrame );
      tempsFrame.onload = function ( ) {
        framesLoaded++;
        if ( framesLoaded == length )
          app.trigger( 'load:ended', map );
      }
    }
  },

  loadMap: function ( ) {
    var maps = new App.Collections.Maps( ),
      firstMap = new App.Models.Map( {
        id: 1
      } );

    maps.add( firstMap );
    maps.fetch( {

      success: function ( coll, resp, opt ) {
        app.trigger( 'map:loaded', firstMap );
      },

      error: function ( coll, resp, opt ) {
        console.log( 'Une erreur c\' est dûr' );
        $( 'body' ).html( 'Une erreur est survenue lors du chargement des données !' )
      }

    } );
  }

} );
