App.Views.eventHandler = Backbone.View.extend( {

  initialize: function ( ) {
    this.preload( );
    this.afterLoad( );
    new App.Views.Socket( );
    this.move( );
  },

  preload: function ( ) {
    var preload = new App.Models.preload( ),
      preloadView = new App.Views.preload( {
        model: preload
      } );

    preloadView.listenToOnce( app, 'preload:ended', function ( ) {
      preloadView.loadPersos( );
      preloadView.loadTiles( );
    } );

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
  },

  move: function ( ) {
    var myMove = new App.Models.Move( ),
      myPerso,
      myView,
      hashMove = -1,
      way;

    App.socket.on( 'popGuy', function ( data ) {
      if ( !myPerso ) {
        myPerso = new App.Models.Perso( {
          'id': data.id,
          'currentPos': data.pos
        } );
        myView = new App.Views.Perso( {
          model: myPerso
        } );

        myMove.listenTo( app, 'move', myMove.move );
        myPerso.listenTo( app, 'move:ok', myPerso.changeWay );
        myMove.listenTo( app, 'move:bg', function ( data ) {
          console.log( data );
        } );
      } else {
        //gestion autres persos
      }
    } );
  }

} );
