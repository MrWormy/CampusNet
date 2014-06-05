/**
  @fileOverview Description du gestionnaire d'évènements.
  @module event_handler
*/

App.Views.eventHandler = Backbone.View.extend( /** @lends module:event_handler.eventHandler.prototype */ {

  /**
  * @augments Backbone.View
  * @constructs
  */
  initialize: function ( ) {
    this.preload( );
    this.afterLoad( );
    this.mobileEvents();
  },

  /**
  Avant chargement
  */
  preload: function ( ) {
    var preload = new App.Models.preload( ),
      that = this,
      preloadView = new App.Views.preload( {
        model: preload
      } );

    preloadView.listenToOnce( app, 'preload:ended', function ( map ) {
      that.initialPos = {
        "i": map.get( "height" ) / 2,
        "j": map.get( "width" ) / 2
      };
      map.set( {
        currentX: that.initialPos.j * App.tw,
        currentY: that.initialPos.i * App.tw
      } );
      preloadView.loadPersos( );
      that.drawMap( map );
    } )
  },

  /**
  Après chargement
  */
  afterLoad: function ( ) {
    this.listenToOnce( app, 'load:ended', this.move );
  },

  mobileEvents: function(){
    var isMobile = App.mobilecheck();
    if(isMobile){
      $("#register").click(function (e){
        e.preventDefault();
        playName = prompt("Entrez un pseudo de 6 lettres ou plus", "Ex: Michel");
        app.trigger( "register", playName );
      });
      $("#messaging").click(function (e){
        e.preventDefault();
        sentMessage = prompt("Saisir un message");
        app.trigger( "message", sentMessage );
      });
    }
  },

  /**
  Dessin de la carte
  @param firstmap première carte à dessiner
  */
  drawMap: function ( map ) {
    map.initMap( false );
    var myCanvas = new App.Models.Canvas( {
      registering: true
    } ),
      screenView = new App.Views.Screen( {
        model: myCanvas
      } ),
      drawingView = new App.Views.DrawMap( {
        model: map
      } ),
      that = this;

    drawingView.listenTo( app, 'move:container', drawingView.moveCont );
    drawingView.listenToOnce( app, 'resized:ok', drawingView.render );
    that.listenTo( app, 'change:map', function ( ) {
      map.collection.url = 'assets/resources/map/' + App.models.transitions.get( "maps" )[ that.curMap ];
      map.collection.fetch( {
        success: function ( coll, resp, opt ) {
          map.set( {
            currentX: that.initialPos.j * App.tw,
            currentY: that.initialPos.i * App.tw
          } );
          that.listenToOnce( app, 'load:ended', function ( ) {
            app.trigger( 'changed:map' );
          } )
          map.initMap( true );
          drawingView.render( myCanvas.get( "width" ), myCanvas.get( "height" ) );
        },

        error: function ( coll, resp, opt ) {
          console.log( 'Une erreur c\' est dûr' );
          $( 'body' ).html( 'Une erreur est survenue lors du chargement des données !' )
        }
      } )
    } );
  },

  /**
    position initiale
    @enum {entier}
  */
  intialPos: {
    /** abscisse
      @type {entier} */

    "i": 0,
    /** ordonnée
     @type {entier} */
    "j": 0
  },

  /**
    carte courante
    @type {entier}
  */
  curMap: 0,

  /**
    @enum
  */
  oNames: {},

  /**
    @type {table}
  */
  oId: [ ],


  /**
    Mouvement
  */
  changeMap: function ( ) {
    App.Stages.mapStage.removeAllChildren( );
    App.Stages.characterStage.removeAllChildren( );
    app.trigger( 'change:map' );
  },

  move: function ( ) {
    var myMove = new App.Models.Move( ),
      socket = io.connect( 'http://localhost:19872' ),
      others = new App.Collections.OtherPlayers( ),
      //pnjs = new App.Collections.Pnjs( ),
      /*othersView = new App.Views.OtherPlayers( {
        collection: others
      } ),
      pnjsView = new App.Views.handlePnj(
        {collection: pnjs}
        ),*/
      othersView = null,
      hashMove = -1,
      that = this,
      myPerso = null,
      myView, way,
      isMobile = App.mobilecheck(),
      navbarView = new App.Views.Navbar();

    $( "#register" ).css( "display", "block" );
    App.socket = socket;
    socket.on( 'popGuy', function ( data ) {
      if ( !myPerso ) {
        if ( !othersView )
          othersView = new App.Views.OtherPlayers( {
            collection: others
          } )
        pnjs = new App.Collections.Pnjs( 0 ), //Hum hum
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

        if(isMobile){
          myPerso.listenTo( app, 'message', myPerso.sendMessageMobile );
        }else{
          myPerso.listenTo( app, 'message', myPerso.sendMessage );
        }
        myMove.listenTo( app, 'change:map', function ( ) {
          // myPerso.set( {
          //   "currentPos": that.initialPos
          // }, {
          //   silent: true
          // } );
          App.socket.emit( 'quitMap' );
        } );
        myMove.listenTo( app, 'changed:map', function ( ) {
          othersView.stopListening();
          myPerso.stopListening();
          myMove.stopListening();
          myView.stopListening();
          others.reset();
          myPerso = null;
          othersView = null;

          App.socket.emit( 'ready', {
            initPos: that.initialPos,
            pName: that.pName,
            map: that.curMap
          } );
          // myView.createCont( );
          // othersView.newCont( );
        } );
      } else {
        others.pop( data );
        App.oNames[ data.pName ] = data.id;
        that.oId[ data.id ] = data.pName;
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
    if(isMobile){
      this.listenTo( app, 'register', this.registerPlayerMobile );
    }else{
      this.listenTo( app, 'register', this.registerPlayer );
    }
    this.listenTo( app, 'send:message', this.sendMessage );
    this.listenTo( app, 'way:end', this.checkChange );

  },

  /**
    Vérification des mouvements
  */
  checkChange: function ( pos ) {
    var m = App.models.transitions.get( "transitions" )[ this.curMap ],
      l = ( m && m.length ) || 0,
      tempChange = [ ],
      nextPos = null;

    for ( var i = 0; i < l; i++ ) {
      tempChange = m[ i ];
      if ( tempChange[ 0 ] == pos.i ) {
        if ( tempChange[ 1 ] == pos.j ) {
          this.curMap = tempChange[ 2 ];
          nextPos = App.models.transitions.get( "transitions" )[ tempChange[ 2 ] ][ tempChange[ 3 ] ];
          this.initialPos.i = nextPos[ 0 ];
          this.initialPos.j = nextPos[ 1 ];
          this.changeMap( );
        }
      }
    }
  },

  /**
    Enregistrement d'un joueur
    @param {object} form Formulaire
  */
  registerPlayer: function ( form ) {
    var pName = form.playerName.value.trim( );

    this.pName = pName;

    if ( pName && pName.length > 5 ) {
      App.socket.emit( 'ready', {
        initPos: this.initialPos,
        pName: pName,
        map: this.curMap
      } );
    }
  },

  registerPlayerMobile: function (playName){
    var pName = playName;

    this.pName = pName;

    if ( pName && pName.length > 5 ) {
      App.socket.emit( 'ready', {
        initPos: this.initialPos,
        pName: pName,
        map: this.curMap
      } );
    }
  },

  /**
    Destruction de la fenâtre d'enregistrement
  */
  destroyReg: function ( ) {
    var regCont = $( "#regCont" );

    regCont.remove( );
  },

  /**
    Envoi de message
    @param {object} data Données à transmettre
  */
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
