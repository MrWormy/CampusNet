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

    this.loadFrames( spriteSheet );

  },

  loadFrames: function ( spriteSheet ) {
    var length = spriteSheet._frames.length,
      framesLoaded = 0;

    for ( var i = 0; i < length; i++ ) {
      var tempsFrame = createjs.SpriteSheetUtils.extractFrame( spriteSheet, i );
      tempsFrame.onload = function ( ) {
        framesLoaded++;
        App.Frames.push( tempsFrame );
        if ( framesLoaded == length )
          app.trigger( 'load:ended' );
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
        // firstMap.initMap( );
        // console.log( 'Données chargées' );
        // var myCanvas = new App.Models.Canvas( );
        // var screenView = new App.Views.Screen( {
        //   model: myCanvas
        // } );
        // var drawingView = new App.Views.DrawMap( {
        //   model: firstMap
        // } );
      },

      error: function ( coll, resp, opt ) {
        console.log( 'Une erreur c\' est dûr' );
        $( 'body' ).html( 'Une erreur est survenue lors du chargement des données !' )
      }

    } );
  }

} );
