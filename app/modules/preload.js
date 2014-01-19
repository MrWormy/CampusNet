App.Models.preload = Backbone.Model.extend( {
  defaults: {
    "loadTileSet": false,
    "loadMap": false
  },

  initialize: function ( ) {
    this.on( 'change', this.checkLoad );
  },

  checkLoad: function ( ) {
    if ( this.get( "loadTileSet" ) && this.get( "loadMap" ) ) {
      app.trigger( 'preload:ended' );
    }
  }
} );

App.Views.preload = Backbone.View.extend( {

  el: "#myCanvas",

  initialize: function ( ) {
    this.loadTileSet( );
    this.loadMap( );
  },

  loadTileSet: function ( ) {
    var that = this,
      tileset = new Image( );
    tileset.src = "assets/resources/img/tilesheet.png"
    tileset.onload = function ( ) {
      that.model.set( {
        "tileset": tileset,
        "loadTileSet": true
      } );
    };
  },

  loadTiles: function ( ) {
    var tileset = this.model.get( "tileset" ),
      map = this.model.get( "map" );
    var data = {
      images: [ tileset ],
      frames: {
        width: map.get( "tilewidth" ),
        height: map.get( "tileheight" ),
        regX: 0,
        regY: 0
      }
    },
      spriteSheet = new createjs.SpriteSheet( data );

    this.loadFrames( spriteSheet, map );

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
    var that = this;
    var maps = new App.Collections.Maps( ),
      firstMap = new App.Models.Map( {
        id: 1
      } );

    maps.add( firstMap );
    maps.fetch( {

      success: function ( coll, resp, opt ) {
        that.model.set( {
          "map": firstMap,
          "loadMap": true
        } );
        return firstMap;
      },

      error: function ( coll, resp, opt ) {
        console.log( 'Une erreur c\' est dûr' );
        $( 'body' ).html( 'Une erreur est survenue lors du chargement des données !' )
      }

    } );
  }

} );
