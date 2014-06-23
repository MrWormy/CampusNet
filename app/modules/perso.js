/**
  Module personnage
  @module perso
*/


App.Models.Perso = Backbone.Model.extend( /** @lends module:perso.Models/Perso.prototype */ {
  defaults: {
    "moving": false,
    "curFrame": [0,0,0,0]
  },

  /**
  Function de changement de chemin
  */
  changeWay: function ( way ) {
    this.set( 'way', way );
  },

  /**
  * @augments Backbone.Model
  * @constructs
  */
  initialize: function ( ) {
    this.pop( );
    this.on( 'change:way', this.newMove );
  },

  parseData: function ( message ) {
    var header, dest, msg, parsedMsg = this.trimMsg( message ),
      cmd = parsedMsg[ 0 ];

    switch ( cmd ) {
    case '/w':
    case '/whisper':
      if ( App.oNames[ parsedMsg[ 1 ] ] != null ) {
        dest = parsedMsg[ 1 ];
        msg = this.msgRes( parsedMsg, 2 );
      } else {
        dest = "me";
        msg = "Ce destinataire n'est pas connecté"
      }
      break;
    case '/a':
    case '/all':
      dest = "all";
      msg = this.msgRes( parsedMsg, 1 );
      break;
    default:
      if ( cmd.charAt( 0 ) == '/' ) {
        dest = "me";
        msg = "Cette commande n'est pas prise en charge, les commandes correctes sont /w + destinataire et /all";
      } else {
        dest = "classic";
        msg = this.msgRes( parsedMsg, 0 );
        break;
      }
    }
    return {
      msg: msg,
      destinataire: dest
    };
  },

  trimMsg: function ( msg ) {
    var tab = msg.split( ' ' ),
      trimT = [ ],
      tabLength = tab.length,
      currI = 0;
    for ( var i = 0; i < tabLength; i++ ) {
      if ( tab[ i ] != "" ) {
        trimT[ currI ] = tab[ i ];
        currI++;
      }
    };
    return trimT;
  },

  msgRes: function ( tab, pos ) {
    var msg = tab.slice( pos, tab.length ).join( ' ' ) || "";

    return msg;
  },

  pop: function ( ) {
    var perso = new createjs.Sprite( App.persos[this.get("skin")] );
    console.log(perso);
    perso.gotoAndStop( 28 ),
    tw = App.tw;
    perso.x = this.get( "currentPos" ).j * tw;
    perso.y = this.get( "currentPos" ).i * tw;
    this.set( "perso", perso );
  },

  newMove: function ( ) {
    var that = this;
    clearInterval( this.moving );
    this.moving = setInterval( function ( ) {
      var nextPos = that.get( "way" ).shift( );
      that.doMove( nextPos );
    }, 120 );
  },

  doMove: function ( nextPos ) {
    that = this;
    if ( nextPos ) {
      this.set( "currentPos", nextPos );
      App.socket.emit( 'iMove', nextPos );
      if ( this.get( "way" ).length == 0 )
        app.trigger('way:end', nextPos);
    } else
      clearInterval( this.moving );
  },

  sendMessage: function ( form ) {
    var info, message = form[ 'texte' ].value.trim( ),
      data = {};
    form[ 'texte' ].value = "";
    if ( message != "" ) {
      data = this.parseData( message );
      if ( data.msg ) {
        if ( data.destinataire != "me" )
          app.trigger( "send:message", data );
        App.views.drawings.drawText( data.msg, this.get( "currentPos" ), this.get( "id" ), data.destinataire );
      }
    }
  },

 moveAnim: function (dir) {
    var curFrame = this.get("curFrame"),
      that = this;
    curFrame[dir] = (curFrame[dir] + 1) % 4;
    setTimeout(function () {
      that.get("perso").gotoAndStop(dir*8 + curFrame[dir]);
      curFrame[dir] = (curFrame[dir] + 1) % 4;
      setTimeout(function () {
        that.get("perso").gotoAndStop(dir*8 + curFrame[dir]);
        that.set("curFrame", curFrame);
      }, 60);
    }, 60);
  },

  sendMessageMobile: function(sentMessage){
    var info, message = sentMessage,
     data = {};
    if ( message != "" ) {
      data = this.parseData( message );
      if ( data.msg ) {
        if ( data.destinataire != "me" )
          app.trigger( "send:message", data );
        App.views.drawings.drawText( data.msg, this.get( "currentPos" ), this.get( "id" ), data.destinataire );
      }
    }
  },

  moving: {}
} );

App.Views.Perso = Backbone.View.extend( /** @lends module:perso.Views/Perso.prototype */ {

  /**
  * @augments Backbone.View
  * @constructs
  */
  initialize: function ( ) {
    this.createCont( );
    this.model.on( 'change:currentPos', this.move );
  },

  move: function ( e ) {
    var prevPos = e.previousAttributes( ).currentPos,
      curPos = e.get( "currentPos" );

    if ( prevPos.i == curPos.i ) {
      ( prevPos.j + 1 ) == curPos.j && e.moveAnim(1);
      ( prevPos.j - 1 ) == curPos.j && e.moveAnim(0);
    } else {
      ( prevPos.i + 1 ) == curPos.i && e.moveAnim(3);
      ( prevPos.i - 1 ) == curPos.i && e.moveAnim(2);
    }

    App.views.drawings.moveAndText( e.get( "id" ), curPos.i - prevPos.i, curPos.j - prevPos.j );
    app.trigger( 'move:container', curPos.i - prevPos.i, curPos.j - prevPos.j );
  },

  createCont: function ( ) {
    var cont = new createjs.Container( ), perso = this.model.get( "perso" )

    cont.name = "player";
    cont.x = App.Stages.mapStage.getChildAt( 0 ).x;
    cont.y = App.Stages.mapStage.getChildAt( 0 ).y;
    cont.regX = App.Stages.mapStage.getChildAt( 0 ).regX;
    cont.regY = App.Stages.mapStage.getChildAt( 0 ).regY;
    perso.x = this.model.get( "currentPos" ).j * tw;
    perso.y = this.model.get( "currentPos" ).i * tw;
    cont.addChild( perso );
    App.Stages.mapStage.addChild( cont );
  }

} );
