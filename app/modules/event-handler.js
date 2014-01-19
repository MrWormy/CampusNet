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
    var myCanvas = new App.Models.Canvas( );
    var screenView = new App.Views.Screen( {
      model: myCanvas
    } );
    var drawingView = new App.Views.DrawMap( {
      model: firstMap
    } );

    drawingView.listenToOnce(app, 'resized:ok', drawingView.render);
  }

} );
