App.Models.Perso = Backbone.Model.extend( {
  defaults: {
    "moving": false
  },

  changeWay: function ( way ) {
    this.set( 'way', way );
  },

  initialize: function ( ) {
    this.pop( );
    this.on( 'change:way', this.newMove );
  },

  pop: function ( ) {
    var perso = new createjs.Sprite( App.perso );
    perso.gotoAndStop( 2 ),
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
    if ( nextPos ) {
      this.set( "currentPos", nextPos );
      App.socket.emit( 'iMove', nextPos );
    } else
      clearInterval( this.moving );
  },

  sendMessage: function ( form ) {
    var message = form[ 0 ].value.trim( );
    form[ 0 ].value = "";
    if ( message != "" ) {
      App.socket.emit( "message", {
        "msg": message
      } );
    }
  },

  moving: {}
} );

App.Views.Perso = Backbone.View.extend( {

  initialize: function ( ) {
    this.createCont( );
    this.model.on( 'change:currentPos', this.move );
  },

  move: function ( e ) {
    var prevPos = e.previousAttributes( ).currentPos,
      curPos = e.get( "currentPos" );

    if ( prevPos.i == curPos.i ) {
      ( prevPos.j + 1 ) == curPos.j && e.get( "perso" ).gotoAndStop( 1 );
      ( prevPos.j - 1 ) == curPos.j && e.get( "perso" ).gotoAndStop( 3 );
    } else {
      ( prevPos.i + 1 ) == curPos.i && e.get( "perso" ).gotoAndStop( 2 );
      ( prevPos.i - 1 ) == curPos.i && e.get( "perso" ).gotoAndStop( 0 );
    }

    app.trigger( 'move:container', curPos.i - prevPos.i, curPos.j - prevPos.j );
  },

  createCont: function ( ) {
    var cont = new createjs.Container( );

    cont.name = "player";
    cont.x = App.Stages.mapStage.getChildAt( 0 ).x;
    cont.y = App.Stages.mapStage.getChildAt( 0 ).y;
    cont.regX = App.Stages.mapStage.getChildAt( 0 ).regX;
    cont.regY = App.Stages.mapStage.getChildAt( 0 ).regY;
    cont.addChild( this.model.get( "perso" ) );
    App.Stages.mapStage.addChild( cont );
  }

} );
