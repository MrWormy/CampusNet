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

  el: '#mapCanvas',

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
    //container.cache(0, 0, this.model.get("mapWidth"), this.model.get("mapHeight"));
    this.stage.addChild( container );
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

  moveCont: function ( i, j ) {
    this.model.set( {
      "currentX": this.model.get( "currentX" ) + j * 48,
      "currentY": this.model.get( "currentY" ) + i * 48
    } );
  },

  moveContainer: function ( e ) {
    var cont = App.Stages.mapStage.getChildAt( 0 );
    cont.x = -e.get( "currentX" );
    cont.y = -e.get( "currentY" );
  },

  addFrames: function ( container ) {
    var layers = this.model.get( "layers" ),
      tileWidth = this.model.get( "tilewidth" ),
      tileHeight = this.model.get( "tileheight" ),
      layerWidth = this.model.get( "width" );
    for ( var i = 1; i <= layers.length; i++ ) {
      var type, layer = this.model.get( "layers" )[ i - 1 ],
        data = layer.data,
        name = layer.name.split( " " )[ 0 ];
      ( name == "floor" && !( type = 0 ) ) || ( name == "map-transition" && ( type = 1 ) ) || ( type = 2 );
      for ( var j = 0; j < data.length; j++ ) {
        var frame = data[ j ] - 1,
          col = j % layerWidth,
          line = Math.floor( j / layerWidth );
        if ( frame >= 0 ) {
          App.map[ j ] = type;
          this.addFrame( container, frame, col * tileWidth, line * tileHeight );
        }
      }
    }
  },

  addFrame: function ( container, frame, posX, posY ) {
    var tempsFrame = new createjs.Bitmap( App.Frames[ frame ] );
    tempsFrame.x = posX;
    tempsFrame.y = posY;
    container.addChild( tempsFrame );
  },

  mapClicked: function ( e, width, height ) {
    var tileWidth = this.model.get( "tilewidth" ),
      tileHeight = this.model.get( "tileheight" ),
      layerWidth = this.model.get( "width" ),
      currentJ = this.model.get( "currentX" ) / tileWidth,
      currentI = this.model.get( "currentY" ) / tileHeight,
      toJ = e.target.x / tileWidth,
      toI = e.target.y / tileHeight;
    app.trigger( 'move', currentI, currentJ, toI, toJ, layerWidth );
  }

} );
