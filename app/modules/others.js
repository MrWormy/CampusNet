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
    var perso = new createjs.Sprite( App.persos[this.get("skin")] ),
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
    this.add( player, {merge: true} );
  },

  kill: function ( id ) {
    var mapOthers = App.Stages.characterStage.getChildByName( "others" );
    mapOthers.removeChild( mapOthers.getChildByName( "joueur " + id ) );
    this.remove(this.get(id));
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
  initialize: function ( opts ) {
    this.newCont( opts.curMap );
  },

  newCont: function ( idMap ) {
    var cont = new createjs.Container( ),
      textCont = new createjs.Container( );

    cont.name = "others";
    textCont.name = "textDisplay";
    textCont.x = cont.x = App.Stages.mapStage.getChildAt( 0 ).x;
    textCont.y = cont.y = App.Stages.mapStage.getChildAt( 0 ).y;
    textCont.regX = cont.regX = App.Stages.mapStage.getChildAt( 0 ).regX;
    textCont.regY = cont.regY = App.Stages.mapStage.getChildAt( 0 ).regY;
    App.Stages.characterStage.addChild( textCont );
    this.initListener(cont, idMap);
    App.Stages.characterStage.addChildAt( cont, 0 );
  },

  initListener: function( cont, idMap ){
    var changeMapTiles = new createjs.Container(),
      exits = App.models.transitions.get("transitions")[idMap],
      nameExitsName = App.models.transitions.get("mapsName"),
      tw = App.tw;

    for (var i = exits.length - 1; i >= 0; i--) {
      var sprite = new createjs.Sprite(App.spriteSheet),
        exit = exits[i];

      sprite.gotoAndStop(212);

      sprite.name = ("direction : " + nameExitsName[exit[2]]) || "default";
      sprite.x = exit[1]*App.tw;
      sprite.y = exit[0]*App.tw;
      sprite.addEventListener("mouseover", function(e){
        App.views.drawings.drawText(e.target.name, {i: e.target.y / App.tw + 0.2, j: e.target.x / App.tw}, 10001, "all");
      });
      sprite.addEventListener("mouseout", function(e){
        App.views.drawings.removeText(10001);
      });
      changeMapTiles.addChild(sprite);
    };
    cont.addChild(changeMapTiles);
  }

} );
