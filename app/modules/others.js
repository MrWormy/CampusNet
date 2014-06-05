/**
  Module autres
  @module others
*/

App.Models.OtherPlayer = Backbone.Model.extend( /** @lends module:others.Models/OtherPlayer.prototype */ {

  defaults:{
    "curFrame": [0,0,0,0]
  },

  /**
  * @augments Backbone.Model
  * @constructs
  */
  initialize: function ( ) {
    this.pop( );
    this.on( 'change', this.move );
  },

  pop: function ( ) {
    var perso = new createjs.Sprite( App.perso ),
      tw = App.tw,
      that = this;
    perso.gotoAndStop( Math.floor( 4 * Math.random( ) ) );
    perso.name = "joueur " + this.id;
    perso.x = this.get( "pos" ).j * tw;
    perso.y = this.get( "pos" ).i * tw;
    perso.addEventListener( "mouseover", function ( ) {
      App.views.drawings.showName( that.get( "pos" ), that.get( "pName" ), that.get( "id" ) );
    } )
    perso.addEventListener( "mouseout", function ( ) {
      App.views.drawings.removeName( that.get( "id" ) );
    } )
    this.set( "perso", perso );
    App.Stages.characterStage.getChildByName( "others" ).addChild( perso );
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

  move: function ( e ) {
    var prevPos = e.previousAttributes( ).pos,
      curPos = e.get( "pos" ),
      tw = App.tw;

    if ( prevPos.i == curPos.i ) {
      ( prevPos.j + 1 ) == curPos.j && e.moveAnim(1);
      ( prevPos.j - 1 ) == curPos.j && e.moveAnim(0);
      e.get( "perso" ).x = curPos.j * tw;
    } else {
      ( prevPos.i + 1 ) == curPos.i && e.moveAnim(3);
      ( prevPos.i - 1 ) == curPos.i && e.moveAnim(2);
      e.get( "perso" ).y = curPos.i * tw;
    }

    App.views.drawings.moveAndText( e.get( "id" ), curPos.i - prevPos.i, curPos.j - prevPos.j );
  }
} );

/**
  * @class Collections/OtherPlayers
  * @augments Backbone.Collection
*/
App.Collections.OtherPlayers = Backbone.Collection.extend( /** @lends module:others~Collections/OtherPlayers.prototype */ {

  pop: function ( data ) {
    var player = new this.model( data );
    this.add( player );
  },

  kill: function ( id ) {
    var mapOthers = App.Stages.characterStage.getChildByName( "others" );
    mapOthers.removeChild( mapOthers.getChildByName( "joueur " + id ) );
  },

  model: App.Models.OtherPlayer,

  move: function ( data ) {
    var id = data.id,
      nextPos = data.pos,
      perso = this.get( id );
    if(typeof(perso) != "undefined")
      perso.set( "pos", nextPos );

  },

  message: function ( data ) {
    var pos = this.get( data.expediteur ).get( "pos" ),
      id = this.get( data.expediteur ).get( "id" );
    App.views.drawings.drawText( data.msg, pos, id, data.destinataire );
  }

} );

App.Views.OtherPlayers = Backbone.View.extend( /** @lends module:others.Views/OtherPlayers.prototype */ {

  /**
  * @augments Backbone.View
  * @constructs
  */
  initialize: function ( ) {
    this.newCont( );
  },

  newCont: function ( ) {
    var cont = new createjs.Container( );

    cont.name = "others";
    cont.x = App.Stages.mapStage.getChildAt( 0 ).x;
    cont.y = App.Stages.mapStage.getChildAt( 0 ).y;
    cont.regX = App.Stages.mapStage.getChildAt( 0 ).regX;
    cont.regY = App.Stages.mapStage.getChildAt( 0 ).regY;
    App.Stages.characterStage.addChild( cont );
  }

} );
