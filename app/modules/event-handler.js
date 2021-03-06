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
    this.listenWin();
    this.listenDeco();
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

      App.spriteSheet = new createjs.SpriteSheet({
        images: [App.tileset],
        frames: {
          width : App.tw,
          height : App.tw
        }
      });

      that.initialPos = {
        "i": Math.round(map.get( "height" ) / 2),
        "j": Math.round(map.get( "width" ) / 2)
      };
      map.set( {
        currentX: that.initialPos.j * App.tw,
        currentY: that.initialPos.i * App.tw
      } );
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

  initNavBar: function ( ) {
    $("#navbar").css("display","block");
    App.views.navbar = new App.Views.Navbar({model: new App.Models.Navbar});
  },

  move: function ( ) {
    var myMove = new App.Models.Move( ),
      socket = App.socket,
      others = new App.Collections.OtherPlayers( ),
      othersView = null,
      hashMove = -1,
      that = this,
      myPerso = null,
      myView, way,
      isMobile = App.mobilecheck(),
      pnjs = new App.Collections.Pnjs();

    this.initNavBar();

    socket.on( 'popGuy', function ( data ) {
      if ( !myPerso ) {
        if ( !othersView )
          othersView = new App.Views.OtherPlayers( {
            collection: others,
            curMap: that.curMap
          } )
        pnjs.newMap( that.curMap );
        that.pName = data.pName;
        that.destroyReg( );
        myPerso = App.models.myself = new App.Models.Perso( {
          'id': data.id,
          'currentPos': data.pos,
          'pName': data.pName,
          'skin': data.skin
        } );
        myView = new App.Views.Perso( {
          model: myPerso
        } );

        App.views.navbar.loadPerso(data.pName, data.skin);
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
      App.views.drawings.removeText(id);
      others.kill( id );
      App.oNames[ that.oId[ id ] ] = null;
      that.oId[ id ] = null;
    } );
    socket.on( "message", function ( data ) {
      others.message( data );
    } );
    socket.on("reponse_pnj", function ( data ) {
      pnjs.message(data);
    });
    this.listenTo( app, 'send:message', this.sendMessage );
    this.listenTo( app, 'way:end', this.checkChange );
    this.registerPlayer();

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
          app.trigger("numMap", this.curMap);
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
  registerPlayer: function ( ) {

    App.socket.emit( 'ready', {
      initPos: this.initialPos,
      map: this.curMap
    } );
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
  },

  listenWin: function (){
    var that = this,
      konamiCode = [1,38,38,40,40,37,39,37,39,66,65],
      tsp = [1, 84, 83, 80],
      tem = [1, 84, 69, 77];
    if(window.addEventListener){
      window.addEventListener("keydown", function(e){
        that.keyBoardEvent(e, konamiCode, that.onKonami);
        that.keyBoardEvent(e, tsp, that.onTsp);
        that.keyBoardEvent(e, tem, that.onTem);
      });
    }
  },

  listenDeco: function () {
    this.listenTo(app, "deco", function (el) {
      App.socket.disconnect();
      window.location.replace("logout.html");
    });
  },

  keyBoardEvent: function (e, code, callback) {
    if(e.keyCode == code[code[0]]){
      code[0]++;
      if(code[0] == code.length){
        code[0] = 1;
        callback();
      }
    } else{
      code[0] = 1;
    }
  },

  /* à implémenter */

  onKonami: function () {
    console.log("konami !");
  },

  onTsp: function () {
    console.log("Vive TSP !");
  },

  onTem: function () {
    console.log("Vive TEM !");
  },

  onGeneralTexting: function (argument) {
    if(argument)
      console.log(argument);
  }

} );


