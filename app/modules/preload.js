/**
  Module préchargement
  @module preload
*/

App.Models.preload = Backbone.Model.extend( /** @lends module:preload.Models/preload.prototype */ {
  defaults: {
    "loadTileSet": false,
    "loadMap": false,
    "loadPerso": false
  },

  /**
  * @property {} defaults
  * @augments Backbone.Model
  * @constructs
  */
  initialize: function ( ) {
    this.on( 'change', this.checkLoad );
  },

  checkLoad: function ( ) {
    if ( this.get( "loadTileSet" ) && this.get( "loadMap" ) && this.get( "loadPerso" ) ) {
      app.trigger( 'preload:ended', this.get( "map" ) );
    }
  }
} );

App.Views.preload = Backbone.View.extend( /** @lends module:preload.Views/preload.prototype */ {

  el: "#mapCanvas",

  /**
  * @augments Backbone.View
  * @constructs
  */
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
      compt = 0,
      baseurl = "assets/resources/img/skins",
      names = ["adm-f-blond-blue.png", "adm-f-blond-green.png", "adm-f-blond-red.png", "adm-f-brown-blue.png", "adm-f-brown-green.png",
        "adm-f-brown-red.png", "adm-f-red-blue.png", "adm-f-red-green.png", "adm-f-red-red.png", "adm-m-blond-black.png", "adm-m-blond-blue.png",
        "adm-m-blond-green.png", "adm-m-brown-black.png", "adm-m-brown-blue.png", "adm-m-brown-green.png", "adm-m-red-black.png",
        "adm-m-red-blue.png", "adm-m-red-green.png", "etu-f-blond-blue.png", "etu-f-blond-green.png", "etu-f-blond-red.png",
        "etu-f-brown-blue.png", "etu-f-brown-green.png", "etu-f-brown-red.png", "etu-f-red-blue.png",
        "etu-f-red-green.png", "etu-f-red-red.png", "etu-m-blond-blue.png", "etu-m-blond-green.png",
        "etu-m-blond-red.png", "etu-m-brown-blue.png", "etu-m-brown-green.png", "etu-m-brown-red.png",
        "etu-m-red-blue.png", "etu-m-red-green.png", "etu-m-red-red.png"
      ],
      persos = [];

    for(var i = 0; i < 36; i++){
      var perso = new Image(),
        name = names[i],
        uri = baseurl;
      uri += (i < 18) ? "/adm/" : "/etu/";
      perso.src = uri + name;
      perso.name = name;
      persos.push(perso);
      perso.onload = function(e){
        compt ++;
        if(compt == 36){
          that.loadPersos(persos);
        }
      }
    }
  },

  loadPersos: function ( persos ) {
    var map = this.model.get("map"),
      spriteSheets = {};
    for (var i = persos.length - 1; i >= 0; i--) {
      var data = {
        images: [ persos[i] ],
        frames: {
          width: map.get( "tilewidth" )*2,
          height: map.get( "tileheight" )*2,
          regX: 24,
          regY: 34
        }
      };
      var spriteSheet = new createjs.SpriteSheet( data );
      spriteSheets[persos[i].name] = spriteSheet;
    };

    App.persos = spriteSheets;
    this.model.set("loadPerso", true);
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
