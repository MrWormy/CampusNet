App.Models.OtherPlayer = Backbone.Model.extend( {

  initialize: function ( ) {
    this.pop( );
    this.on( 'change', this.move );
  },

  pop: function ( argument ) {
    var.perso = new createjs.Bitmap( App.character );
    perso.name = "joueur " + this.name;
    perso.x = this.posX;
    perso.y = this.posY;
    this.set( "perso": perso );
    App.stages.getChildAt( 1 ).addChild( this.perso );
  },

  handleMove: function ( data ) {
    if ( data.i == this.get( "nextPos" ).i && data.j == this.get( "nextPos" ).j ) {
      var nextPos = this.get( "way" ).shift( );
      this.set( "currentPos", data );
      this.tellMove( nextPos );
      app.trigger( 'move:bg', data );
    } else {
      $( 'body' ).html( 'stop cheat pleas or you\'ll be BANNED' )
    }
  },

} );

App.Collections.OtherPlayers = Backbone.Collection.extend( {

  model: App.Models.OtherPlayer,

  move: function ( id, pos ) {
    var perso = this.get( id );
    perso.set( pos );
  }

} );
