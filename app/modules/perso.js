App.Models.Perso = Backbone.Model.extend( {
  defaults: {
    "moving": false
  },

  changeWay: function ( way ) {
    this.set( 'way', way );
  },

  initialize: function ( ) {
    var that = this;
    this.on( 'change:way', this.newMove );

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

  moving: {}
} );

App.Views.Perso = Backbone.View.extend( {

  initialize: function ( ) {
    this.pop( );
    this.model.on( 'change:currentPos', this.move );
  },

  move: function ( e ) {
    var prevPos = e.previousAttributes( ).currentPos,
      curPos = e.get( "currentPos" );

    if ( prevPos.i == curPos.i ) {
      ( prevPos.j + 1 ) == curPos.j && App.perso.gotoAndStop( 1 );
      ( prevPos.j - 1 ) == curPos.j && App.perso.gotoAndStop( 3 );
    } else {
      ( prevPos.i + 1 ) == curPos.i && App.perso.gotoAndStop( 2 );
      ( prevPos.i - 1 ) == curPos.i && App.perso.gotoAndStop( 0 );
    }

    app.trigger( 'move:container', curPos.i - prevPos.i, curPos.j - prevPos.j );
  },

  pop: function ( currentPos ) {
    var cont = new createjs.Container( ),
      perso = App.perso;
    perso.x = this.model.get( "currentPos" ).j * 48;
    perso.y = this.model.get( "currentPos" ).i * 48;
    cont.x = App.Stages.mapStage.getChildAt( 0 ).x;
    cont.y = App.Stages.mapStage.getChildAt( 0 ).y;
    cont.regX = App.Stages.mapStage.getChildAt( 0 ).regX;
    cont.regY = App.Stages.mapStage.getChildAt( 0 ).regY;
    cont.addChild( perso );
    App.Stages.mapStage.addChild( cont );
  }

} );
