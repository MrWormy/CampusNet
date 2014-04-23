App.Models.preload = Backbone.Model.extend( {
  defaults: {
    "loadTileSet": false,
    "loadMap": false,
    "loadPerso": false
  },

  initialize: function ( ) {
    this.on( 'change', this.checkLoad );
  },

  checkLoad: function ( ) {
    if ( this.get( "loadTileSet" ) && this.get( "loadMap" ) && this.get( "loadPerso" ) ) {
      app.trigger( 'preload:ended', this.get( "map" ) );
    }
  }
} );

App.Views.preload = Backbone.View.extend( {

  el: "#mapCanvas",

  initialize: function ( ) {
    this.loadTransitions( );
    this.loadTileSet( );
    this.loadMap( );
    this.loadPerso( );
  },

  loadTransitions: function ( ) {
    var transitions = new App.Collections.Transitions( ),
      transition = new App.Models.Transitions( );

    transitions.add( transition );
    transitions.fetch( {

      success: function ( coll, resp, opt ) {
        App.models.transitions = transition;
      },

      error: function ( coll, resp, opt ) {
        console.log( 'Une erreur c\' est dûr' );
        $( 'body' ).html( 'Une erreur est survenue lors du chargement des données !' )
      }

    } );

  },

  loadPerso: function ( ) {
    var that = this,
      perso = new Image( );
    perso.src = "assets/resources/img/simple-me.png";
    perso.onload = function ( ) {
      that.model.set( {
        "perso": perso,
        "loadPerso": true
      } );
    }
  },

  loadPersos: function ( ) {
    var perso = this.model.get( "perso" ),
      map = this.model.get( "map" );
    var data = {
      images: [ perso ],
      frames: {
        width: map.get( "tilewidth" ),
        height: map.get( "tileheight" ),
        regX: 0,
        regY: 0
      }
    },
      spriteSheet = new createjs.SpriteSheet( data );

    App.perso = spriteSheet;
  },

  loadTileSet: function ( ) {
    var that = this,
      tileset = new Image( );
    tileset.src = "assets/resources/img/tilesheet.png"
    tileset.onload = function ( ) {
      App.tileset = tileset;
      that.model.set( {
        "loadTileSet": true
      } );
    };
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
        App.tw = firstMap.get( "tilewidth" );
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
