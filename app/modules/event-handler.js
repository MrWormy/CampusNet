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
    "i": 16,
    "j": 40
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

/*
Barnabelemagicien
Salut Mr. Wormy ! Tu vas bien ? En gros c'était pour te dire que j'ai avancé du côté serveur et je te dis ce qui change.
Avant tout, je voulais savoir si tout ce qui est en rapport avec socket se trouve ici. Si oui, c'est très bien, tout est centralisé : comme ça pour communiquer on se rejoindra ici et ce sera plus clair.
Mais dans ce cas, à quoi sert le module socket ?
Sinon, j'ai implementé la déconnexion : je te laisse te charger d'effacer les bonhommes (cf plus loin : socket.emit("aurevoir") )
Pour le changement de map, regarde ton socket.emit("ready"), tu comprendras comment ça marche.
Pour l'instant il n'y a qe deux maps, dis moi combien t'en veux !
Du coup, l'apparition sur une carte se gère comme une connexion. Pour quitter une map sans se déconnecter,
fait simplement un socket.emit("quitMap") (aucun paramètre n'est demandé).
Bisous bisous !
PS : vu que tu t'es tapé tout ce pavé, je t'offre un goodie cadeau : http://www.youtube.com/watch?v=oHg5SJYRHA0
*/

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
    socket.on("aurevoir", function(id) {
      alert("Oh lala, le joueur numero " + id + " vient de quitter la map ! Il faut vite l'effacer !");
    });
    socket.emit( 'ready', {initPos: this.intialPos, map: 0} );
  }

} );
