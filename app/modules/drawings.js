App.Views.Drawings = Backbone.View.extend( {

  el: '#mapCanvas',

  initialize: function ( ) {

  },

  drawText: function ( text, pos, id ) {
    var former, tName = "texte" + id,
      h = Math.ceil( text.length / 15 ),
      textContainer = new createjs.Container( ),
      others = App.Stages.characterStage.getChildByName( "others" ),
      dText = new createjs.Text( text, "17px Arial" );
    dText.lineWidth = 250;
    dText.maxWidth = 250;
    textContainer.name = tName;
    textContainer.addChild( dText );
    textContainer.x = pos.j * App.tw + App.tw / 2;
    textContainer.y = pos.i * App.tw - dText.getMeasuredHeight( );
    if ( former = others.getChildByName( tName ) )
      others.removeChild( former );
    App.Stages.characterStage.getChildByName( "others" ).addChild( textContainer );
    setTimeout( function ( ) {
      if ( textContainer )
        others.removeChild( textContainer );
    }, 5000 );
  },

  removeText: function ( id ) {
    var others = App.Stages.characterStage.getChildByName( "others" ),
      text = others.getChildByName( "texte" + id );
    if ( text )
      others.removeChild( text );
  }

} );
