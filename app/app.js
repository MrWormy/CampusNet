$( function ( ) {

  window.App = {
    Models: {},
    Collections: {},
    Views: {},
    Images: {},
    Frames: [ ],
    socket: {}
  };

  window.template = function ( id ) {
    return _.template( $( '#template' + id ).html( ) );
  };

  var app = {}
  _.extend( app, Backbone.Events );

  App.Models.Canvas = Backbone.Model.extend( {
    defaults: {
      'height': window.innerHeight,
      'width': window.innerWidth,
      'ratio': 1.6
    },

    initialize: function ( ) {
      this.resize( this.toJSON( ) );
    },

    resize: function ( ) {
      var height = this.get( 'height' ),
        width = this.get( 'width' );
      var ratio = this.get( 'ratio' );
      var myCan = $( "#myCanvas" );
      var myCanProp = myCan[ 0 ];
      if ( width >= ratio * height ) {
        var canWidth = ratio * height;
        this.set( {
          'height': height,
          'width': canWidth
        }, {
          silent: true
        } );
        myCan.css( {
          'margin-top': 0 + 'px'
        } );
        myCanProp.width = canWidth;
        myCanProp.height = height;
      } else {
        var canHeight = width / ratio
        this.set( {
          'height': canHeight,
          'width': width
        }, {
          silent: true
        } );
        myCan.css( {
          'margin-top': ( height - canHeight ) / 2 + 'px'
        } );
        myCanProp.width = width;
        myCanProp.height = canHeight;
      }
      app.trigger( 'resized:ok', this.get( "width" ), this.get( "height" ) );
    }
  } );

  App.Models.Map = Backbone.Model.extend( {
    initMap: function ( ) {
      var tileWidth = this.get( "tilewidth" ),
        tileHeight = this.get( "tileheight" ),
        layerHeight = this.get( "height" ),
        layerWidth = this.get( "width" );
      var mapWidth = tileWidth * layerWidth,
        mapHeight = tileHeight * layerHeight;
      this.set( {
        'mapWidth': mapWidth,
        'mapHeight': mapHeight,
        'currentX': mapWidth / 2,
        'currentY': mapHeight / 2
      } );
    }
  } );

  App.Collections.Maps = Backbone.Collection.extend( {
    url: 'assets/map/testMap.json',
    model: App.Models.Map
  } );

  App.Views.Screen = Backbone.View.extend( {
    el: '#myCanvas',

    initialize: function ( ) {
      var win = $( window );
      win.on( 'resize', {
        that: this
      }, this.resize );
      this.model.on( 'change', this.resizeWin, this );
      this.model.set( {
        'height': window.innerHeight,
        'width': window.innerWidth
      } );
      this.listenTo( app, 'resize:on', this.resizeCan );
    },

    resize: function ( e ) {
      var that = e.data.that;
      that.model.set( {
        'height': window.innerHeight,
        'width': window.innerWidth
      } );
    },

    resizing: {},

    resizeCan: function ( ) {
      this.model.resize( );
    },

    resizeWin: function ( ) {
      clearTimeout( this.resizing );
      var that = this;
      this.resizing = setTimeout( function ( ) {
        app.trigger( 'resize:on', that.model.toJSON( ) );
      }, 100 );
    },
  } );

  App.Views.Perso = Backbone.View.extend( {
    el: '#myCanvas',

    initialize: function ( ) {
      this.listenTo( app, 'movement', this.movement );
    },

    movement: function ( diffX, diffY, stage ) {

    }
  } );

  App.Views.DrawMap = Backbone.View.extend( {
    el: '#myCanvas',

    initialize: function ( ) {
      var movement = new App.Views.Perso( );
      var data = this.loadTiles( );
      var spriteSheet = new createjs.SpriteSheet( data );
      this.loadFrames( spriteSheet );
      this.listenToOnce( app, 'resized:ok', this.render );
    },

    loadTiles: function ( ) {
      var that = this;
      setInterval( function ( ) {
        that.stage.update( );
      }, 30 );

      var data = {
        images: [ App.Images.tyleset ],
        frames: {
          width: this.model.get( "tilewidth" ),
          height: this.model.get( "tileheight" ),
          regX: 0,
          regY: 0
        }
      };
      return data;
    },

    loadFrames: function ( spriteSheet ) {
      var length = spriteSheet._frames.length;
      for ( var i = 0; i < length; i++ ) {
        App.Frames.push( createjs.SpriteSheetUtils.extractFrame( spriteSheet, i ) );
      }
    },

    stage: new createjs.Stage( "myCanvas" ),

    render: function ( width, height ) {
      var that = this;
      this.stage.removeAllChildren( );
      var container = new createjs.Container( );
      this.initContainer( container, width, height );
      this.listenTo( app, 'resized:ok', function ( width, height ) {
        this.drawContainer( container, width, height );
      } );
    },

    initContainer: function ( container, width, height ) {
      var that = this;
      this.stage.addChild( container );
      this.addFrames( container );
      container.addEventListener( "mousedown", function ( e ) {
        that.mapClicked( e, width / 2, height / 2 );
      } );
      this.drawContainer( container, width, height );
    },

    drawContainer: function ( container, width, height ) {
      container.x = -this.model.get( "currentX" );
      container.y = -this.model.get( "currentY" );
      container.regX = -width / 2;
      container.regY = -height / 2;
    },

    addFrames: function ( container ) {
      var layer = this.model.get( "layers" )[ 0 ].data;
      var tileWidth = this.model.get( "tilewidth" ),
        tileHeight = this.model.get( "tileheight" ),
        layerWidth = this.model.get( "width" );
      for ( var i = 0; i < layer.length; i++ ) {
        this.addFrame( container, layer[ i ] - 1, ( i % layerWidth ) * tileWidth, ( Math.floor( i / layerWidth ) ) * tileHeight );
      }
    },

    addFrame: function ( container, frame, posX, posY ) {
      var tempsFrame = new createjs.Bitmap( App.Frames[ frame ] );
      tempsFrame.x = posX;
      tempsFrame.y = posY;
      container.addChild( tempsFrame );
    },

    mapClicked: function ( e, width, height ) {
      console.log( e.target.x - this.model.get( "currentX" ) );
    }
  } );

  App.Views.Socket = Backbone.View.extend( {
    initialize: function ( ) {
      App.socket = io.connect( 'http://localhost:19872' );
      App.socket.on( 'message', function ( data ) {
        app.trigger( 'message:recieved', data );
      } );
    }
  } );

  App.Views.CanvasView = Backbone.View.extend( {
    el: '#myCanvas',

    initialize: function ( ) {
      var that = this;
      App.Images.tyleset = new Image( );
      App.Images.tyleset.src = "assets/img/tilesheet.png"
      App.Images.tyleset.onload = function ( ) {
        that.afterLoad( );
      };
    },

    afterLoad: function ( ) {
      var maps = new App.Collections.Maps( );
      var firstMap = new App.Models.Map( {
        id: 1
      } );
      maps.add( firstMap );
      maps.fetch( {
        success: function ( coll, resp, opt ) {
          firstMap.initMap( );
          console.log( 'Données chargées' );
          var myCanvas = new App.Models.Canvas( );
          var screenView = new App.Views.Screen( {
            model: myCanvas
          } );
          var drawingView = new App.Views.DrawMap( {
            model: firstMap
          } );
        },
        error: function ( coll, resp, opt ) {
          console.log( 'Une erreur c\' est dûr' );
          $( 'body' ).html( 'Une erreur est survenue lors du chargement des données !' )
        }
      } );
    }
  } );

  var canvasView = new App.Views.CanvasView( );

} );
