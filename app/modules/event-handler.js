App.Views.eventHandler = Backbone.View.extend( {

  initialize: function ( ) {
    this.preload( );
    this.afterLoad( );
  },

  preload: function ( ) {
    var preload = new App.Models.preload( ),
      that = this,
      preloadView = new App.Views.preload( {
        model: preload
      } );

    preloadView.listenToOnce( app, 'preload:ended', function ( map ) {
      preloadView.loadPersos( );
      that.drawMap( map );
    } );

  },

  afterLoad: function ( ) {
    this.listenToOnce( app, 'load:ended', this.move );
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

    drawingView.listenTo( app, 'move:container', drawingView.moveCont );
    drawingView.listenToOnce( app, 'resized:ok', drawingView.render );
  },


  intialPos: {
    "i": 17,
    "j": 38
  },

  move: function ( ) {
    var myMove = new App.Models.Move( ),
      socket = io.connect( 'http://localhost:19872' ),
      others = new App.Collections.OtherPlayers( ),
      othersView = new App.Views.OtherPlayers( {
        collection: others
      } ),
      hashMove = -1,
      myPerso, myView, way;

    App.socket = socket;
    socket.on( 'popGuy', function ( data ) {
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
        others.pop( data );
      }

    } );

    socket.on('iMove', function(data){
      others.move(data);
    });
    socket.emit( 'ready', this.intialPos );
  }

} );
