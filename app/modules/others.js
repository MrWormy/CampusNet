App.Models.OtherPlayer = Backbone.Model.extend( {

  initialize: function ( ) {
    this.pop( );
    this.on( 'change', this.move );
  },

  pop: function ( ) {
    var perso = new createjs.Sprite( App.perso ),
      tw = App.tw;
    perso.gotoAndStop( Math.floor( 4 * Math.random( ) ) );
    perso.name = "joueur " + this.id;
    perso.x = this.get( "pos" ).j * tw;
    perso.y = this.get( "pos" ).i * tw;
    this.set( "perso", perso );
    App.Stages.mapStage.getChildByName( "others" ).addChild( perso );
  },

  move: function ( e ) {
    var prevPos = e.previousAttributes( ).pos,
      curPos = e.get( "pos" ),
      tw = App.tw;

    if ( prevPos.i == curPos.i ) {
      ( prevPos.j + 1 ) == curPos.j && e.get( "perso" ).gotoAndStop( 1 );
      ( prevPos.j - 1 ) == curPos.j && e.get( "perso" ).gotoAndStop( 3 );
      e.get("perso").x = curPos.j * tw;
    } else {
      ( prevPos.i + 1 ) == curPos.i && e.get( "perso" ).gotoAndStop( 2 );
      ( prevPos.i - 1 ) == curPos.i && e.get( "perso" ).gotoAndStop( 0 );
      e.get("perso").y = curPos.i * tw;
    }
  }

} );

App.Collections.OtherPlayers = Backbone.Collection.extend( {

  pop: function ( data ) {
    var player = new this.model( data );
    this.add( player );
  },

  kill: function(id){
    var mapOthers = App.Stages.mapStage.getChildByName( "others" );
    console.log(mapOthers.getChildByName("joueur " + id));
    mapOthers.removeChild(mapOthers.getChildByName("joueur " + id));
  },

  model: App.Models.OtherPlayer,

  move: function ( data ) {
    var id = data.id,
      nextPos = data.pos,
      perso = this.get( id );
    perso.set( "pos", nextPos );

  }

} );

App.Views.OtherPlayers = Backbone.View.extend( {

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
    App.Stages.mapStage.addChild( cont );
  }

} );
