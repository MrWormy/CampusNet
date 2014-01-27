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
    this.set( "perso", new createjs.Bitmap( App.Persos[ 2 ] ) );

  },

  newMove: function ( ) {
    var that = this;
    clearInterval( this.moving );
    this.moving = setInterval( function ( ) {
      var nextPos = that.get( "way" ).shift( );
      that.doMove( nextPos );
    }, 30 );
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

  },

  pop: function ( currentPos ) {
    this.model.get( "perso" ).x = this.model.get( "currentPos" ).i * 48;
    this.model.get( "perso" ).y = this.model.get( "currentPos" ).j * 48;
    App.Stages.mapStage.getChildAt( 0 ).addChild( this.model.get( "perso" ) );
  }

} );
