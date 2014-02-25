App.Views.Drawings = Backbone.View.extend( {

  el: '#mapCanvas',

  initialize: function ( ) {

  },

  drawText: function ( text, pos ) {
    var h = Math.ceil( text.length / 15 ),
      textContainer = new createjs.Container( ),
      dText = new createjs.Text( text );
    dText.lineWidth = 150;
    textContainer.addChild( dText );
    textContainer.x = pos.j * App.tw + App.tw/2;
    textContainer.y = pos.i * App.tw - dText.getMeasuredHeight( );
    App.Stages.mapStage.getChildByName( "others" ).addChild( textContainer );
    setTimeout(function(){
      App.Stages.mapStage.getChildByName( "others" ).removeChild( textContainer );
    }, 5000);
  }

} );
