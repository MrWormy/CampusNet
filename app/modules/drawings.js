App.Views.Drawings = Backbone.View.extend( {

  el: '#mapCanvas',

  initialize: function ( ) {

  },

  drawText: function ( text, pos, id, dest ) {
    var former, tName = "texte" + id,
      h = Math.ceil( text.length / 15 ),
      textContainer = new createjs.Container( ),
      others = App.Stages.characterStage.getChildByName( "others" ),
      dText = new createjs.Text( text, "17px Arial" );
    dText.lineWidth = 250;
    dText.maxWidth = 250;
    dText.color = this.selectColor( dest );
    textContainer.name = tName;
    textContainer.addChild( dText );
    textContainer.x = pos.j * App.tw + App.tw / 2;
    textContainer.y = pos.i * App.tw - dText.getMeasuredHeight( );
    if ( former = others.getChildByName( tName ) )
      others.removeChild( former );
    App.Stages.characterStage.getChildByName( "others" ).addChild( textContainer );
    if ( dest != "all" ) {
      setTimeout( function ( ) {
        if ( textContainer )
          others.removeChild( textContainer );
      }, 5000 );
    }
  },

  selectColor: function ( dest ) {
    return ( ( dest == "me" && "red" ) || ( dest == "classic" && "black" ) || ( dest == "all" && "brown" ) || "blue" );
  },

  removeText: function ( id ) {
    var others = App.Stages.characterStage.getChildByName( "others" ),
      text = others.getChildByName( "texte" + id );
    if ( text )
      others.removeChild( text );
  },

  moveAndText: function ( id, diffI, diffJ ) {

    var others = App.Stages.characterStage.getChildByName( "others" ),
      text = others.getChildByName( "texte" + id );
    if ( text && text.getChildAt( 0 ).color != "brown" )
      others.removeChild( text );
    else if ( text ) {
      text.x = text.x + diffJ * App.tw;
      text.y = text.y + diffI * App.tw;
    }
  },

  showName: function ( pos, name, id ) {
    var former, tName = "name" + id,
      h = Math.ceil( name.length / 15 ),
      textContainer = new createjs.Container( ),
      others = App.Stages.characterStage.getChildByName( "others" ),
      dText = new createjs.Text( name, "17px Arial" );
    dText.lineWidth = 250;
    dText.maxWidth = 250;
    textContainer.name = tName;
    textContainer.addChild( dText );
    textContainer.x = pos.j * App.tw + App.tw / 2;
    textContainer.y = pos.i * App.tw - dText.getMeasuredHeight( );
    if ( former = others.getChildByName( tName ) )
      others.removeChild( former );
    App.Stages.characterStage.getChildByName( "others" ).addChild( textContainer );
  },

  removeName: function ( id ) {
    var others = App.Stages.characterStage.getChildByName( "others" ),
      text = others.getChildByName( "name" + id );
    if ( text )
      others.removeChild( text );
  }

} );
