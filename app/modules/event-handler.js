App.Views.eventHandler = Backbone.View.extend( {

  initialize: function ( ) {
    this.preload( );
    this.afterLoad( );
  },

  preload: function ( ) {
    var preload = new App.Models.preload( ),
      preloadView = new App.Views.preload( {
        model: preload
      } );

    preloadView.listenToOnce( app, 'preload:ended', preloadView.loadTiles );

  },

  afterLoad: function ( ) {
    this.listenToOnce( app, 'load:ended', this.drawMap );
  },

  drawMap: function ( firstMap ) {
    firstMap.initMap( );
    var myCanvas = new App.Models.Canvas( ),
      screenView = new App.Views.Screen( {
        model: myCanvas
      } ),
      drawingView = new App.Views.DrawMap( {
        model: firstMap
      } );

    drawingView.listenToOnce( app, 'resized:ok', drawingView.render );
    this.move( drawingView );
  },

  move: function ( scope ) {
    var myMove = new App.Models.move( ),
      hashMove = -1,
      way;

    myMove.listenTo( app, 'move', function ( fromI, fromJ, toI, toJ, lw ) {
      hashMove = toI * lw + toJ;
      way = this.findAway( fromI, fromJ, toI, toJ, lw );
      if ( hashMove == way[0] ) {
        var tempWay = way[1].slice(0);
        way = [];
        hashMove = -1;
        this.handleMove(scope, tempWay);
      }
    } );
  }

} );
