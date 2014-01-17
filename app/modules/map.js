App.Models.Map = Backbone.Model.extend( {

  initMap: function ( ) {

    var tileWidth = this.get( "tilewidth" ),
      tileHeight = this.get( "tileheight" ),
      layerHeight = this.get( "height" ),
      layerWidth = this.get( "width" ),
      mapWidth = tileWidth * layerWidth,
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
  url: 'assets/resources/map/testMap.json',
  model: App.Models.Map
} );

App.Views.DrawMap = Backbone.View.extend( {

  el: '#myCanvas',

  initialize: function ( ) {
    var movement = new App.Views.Perso( ),
      data = this.loadTiles( ),
      spriteSheet = new createjs.SpriteSheet( data );

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
