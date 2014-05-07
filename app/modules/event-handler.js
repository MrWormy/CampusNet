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
      that.intialPos = {
        "i": map.get( "height" ) / 2,
        "j": map.get( "width" ) / 2
      };
      preloadView.loadPersos( );
      that.drawMap( map );
    } );

  },

  afterLoad: function ( ) {
    this.listenToOnce( app, 'load:ended', this.move );
  },

  drawMap: function ( firstMap ) {
    firstMap.initMap( );
    var myCanvas = new App.Models.Canvas( {
      registering: true
    } ),
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
    "i": 0,
    "j": 0
  },

  curMap: 0,

  oNames: {},

  oId: [ ],

  move: function ( ) {
    var myMove = new App.Models.Move( ),
      socket = io.connect( 'http://localhost:19872' ),
      others = new App.Collections.OtherPlayers( ),
      pnjs = new App.Collections.Pnjs( ),
      othersView = new App.Views.OtherPlayers( {
        collection: others
      } ),
      /*pnjsView = new App.Views.handlePnj(
        {collection: pnjs}
        ),*/
      hashMove = -1,
      that = this,
      myPerso, myView, way;

    $( "#register" ).css( "display", "block" );
    App.socket = socket;
    socket.on( 'popGuy', function ( data ) {
      if ( !myPerso ) {
        that.destroyReg( );
        myPerso = new App.Models.Perso( {
          'id': data.id,
          'currentPos': data.pos,
          'pName': data.pName
        } );

        myView = new App.Views.Perso( {
          model: myPerso
        } );

        myMove.listenTo( app, 'move', myMove.move );
        myPerso.listenTo( app, 'move:ok', myPerso.changeWay );
        myMove.listenTo( app, 'move:bg', function ( data ) {
          console.log( data );
        } );
        myPerso.listenTo( app, 'message', myPerso.sendMessage );
        App.map[ 2143 ] = 2;
        others.pop( {
          "id": 1000,
          "pos": {
            "i": 21,
            "j": 43
          },
          "pName": "pnj"
        } );
        others.get( 1000 ).get( "perso" ).gotoAndStop( 1 );
        others.get( 1000 ).get( "perso" ).addEventListener( "click", function ( ) {
          App.views.drawings.drawText( "Bravo tu as réussi à me parler !", {
            "i": 21,
            "j": 43
          }, 1000, "all" );
        } );
      } else {
        others.pop( data );
        App.oNames[ data.pName ] = data.id;
        that.oId[ data.id ] = data.pName;
        console.log( App.oNames );
      }

    } );

    socket.on( 'iMove', function ( data ) {
      others.move( data );
    } );
    socket.on( "aurevoir", function ( id ) {
      others.kill( id );
      App.oNames[ that.oId[ id ] ] = null;
      that.oId[ id ] = null;
    } );
    socket.on( "message", function ( data ) {
      others.message( data );
    } );
    socket.on("reponse_pnj", function(data) {
      pnjs.message(data);
    })

    this.listenTo( app, 'register', this.registerPlayer );
    this.listenTo( app, 'send:message', this.sendMessage );
    this.listenTo( app, 'way:end', this.checkChange );

  },

  checkChange: function ( pos ) {
    var m = App.models.transitions.get( "transitions" )[ this.curMap ],
      l = ( m && m.length ) || 0;

    for ( var i = 0; i < l; i++ ) {
      if ( m[ i ][ 0 ] == pos.i ) {
        if ( m[ i ][ 1 ] == pos.j )
          console.log( m[ i ] );
      }
    }
  },

  registerPlayer: function ( form ) {
    var pName = form.playerName.value.trim( );

    if ( pName && pName.length > 5 ) {
      App.socket.emit( 'ready', {
        initPos: this.intialPos,
        pName: pName,
        map: 0
      } );
    }
  },

  destroyReg: function ( ) {
    var regCont = $( "#regCont" );

    regCont.remove( );
  },

  sendMessage: function ( data ) {
    var dest = data.destinataire,
      priv = false;

    if ( App.oNames[ dest ] ) {
      priv = true;
      data.destinataire = App.oNames[ dest ];
    }

    App.socket.emit( 'message', {
      "msg": data.msg,
      "destinataire": data.destinataire,
      "private": priv
    } );
  }

} );
