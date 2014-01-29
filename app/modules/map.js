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
  url: 'assets/resources/map/forum.json',
  model: App.Models.Map
} );

App.Views.DrawMap = Backbone.View.extend( {

  el: '#mapCanvas',

  events: {
    "mousedown": "mapClicked"
  },

  initialize: function ( ) {
    this.stage = App.Stages.mapStage;
    this.refresh( );
    this.model.on( 'change', this.moveContainer );
  },

  stage: {},

  refresh: function ( ) {
    var that = this;
    setInterval( function ( ) {
      that.stage.update( );
    }, 30 );
  },

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
    this.addFrames( container );
    container.cache( 0, 0, this.model.get( "mapWidth" ), this.model.get( "mapHeight" ) );
    this.drawContainer( container, width, height );
    this.stage.addChild( container );
    app.trigger( 'load:ended' );
  },

  drawContainer: function ( container, width, height ) {
    container.x = -this.model.get( "currentX" );
    container.y = -this.model.get( "currentY" );
    container.regX = -width / 2;
    container.regY = -height / 2;
    var charac = App.Stages.mapStage.getChildAt( 1 );
    if ( charac ) {
      charac.regX = container.regX;
      charac.regY = container.regY;
    }
  },

  moveCont: function ( i, j ) {
    var tw = this.model.get("tilewidth");
    this.model.set( {
      "currentX": this.model.get( "currentX" ) + j * tw,
      "currentY": this.model.get( "currentY" ) + i * tw
    } );
  },

  moveContainer: function ( e ) {
    var cont = App.Stages.mapStage.getChildAt( 0 ),
      contOthers = App.Stages.mapStage.getChildByName("others");
    cont.x = -e.get( "currentX" );
    cont.y = -e.get( "currentY" );
    contOthers.x = -e.get( "currentX" );
    contOthers.y = -e.get( "currentY" );
  },

  addFrames: function ( container ) {
    var layers = this.model.get( "layers" ),
      tileWidth = this.model.get( "tilewidth" ),
      tileHeight = this.model.get( "tileheight" ),
      layerWidth = this.model.get( "width" ),
      tileSet = this.model.get( "tilesets" )[ 0 ],
      tsW = Math.floor( tileSet.imagewidth / tileWidth ),
      ll = layers.length,
      dl;

    for ( var i = 1; i <= ll; i++ ) {
      var type, layer = this.model.get( "layers" )[ i - 1 ],
        data = layer.data,
        name = layer.name.split( " " )[ 0 ];
      dl = data.length;
      ( name == "floor" && !( type = 0 ) ) || ( name == "map-transition" && ( type = 1 ) ) || ( type = 2 );
      for ( var j = 0; j < dl; j++ ) {
        var frame = data[ j ] - 1,
          col = j % layerWidth,
          line = Math.floor( j / layerWidth );
        if ( frame >= 0 ) {
          App.map[ j ] = type;
          this.addFrame( container, frame, col * tileWidth, line * tileHeight, tileWidth, tileHeight, tsW );
        }
      }
    }
  },

  addFrame: function ( container, frame, posX, posY, tw, th, tsW ) {
    var sourceRect = new createjs.Rectangle( ( frame % tsW ) * tw, ( Math.floor( frame / tsW ) ) * th, tw, th ),
      tempsFrame = new createjs.Bitmap( App.tileset );

    tempsFrame.sourceRect = sourceRect;
    tempsFrame.x = posX;
    tempsFrame.y = posY;
    container.addChild( tempsFrame );
  },

  mapClicked: function ( e ) {
    var tileWidth = this.model.get( "tilewidth" ),
      tileHeight = this.model.get( "tileheight" ),
      layerWidth = this.model.get( "width" ),
      currentJ = this.model.get( "currentX" ) / tileWidth,
      currentI = this.model.get( "currentY" ) / tileHeight,
      toJ = Math.floor( ( this.stage.mouseX + this.stage.getChildAt( 0 ).regX ) / tileWidth ) + currentJ,
      toI = Math.floor( ( this.stage.mouseY + this.stage.getChildAt( 0 ).regY ) / tileHeight ) + currentI;
    app.trigger( 'move', currentI, currentJ, toI, toJ, layerWidth );
  }

} );
