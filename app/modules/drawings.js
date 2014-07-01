/**
  @fileOverview Fonctions de dessin
  @module drawings
*/


App.Views.Drawings = Backbone.View.extend( /** @lends module:drawings.Drawings.prototype */ {
  /**
  * @type string
  */
  el: '#mapCanvas',

  /**
  * @augments Backbone.View
  * @constructs
  */
  initialize: function ( ) {

  },

  /**
    Dessine du texte
    @param {string} text Texte transmis
    @param {object} pos Position
    @param {number} id Emetteur
    @param {number} dest Destinataire
  */
  drawText: function ( text, pos, id, dest ) {
    var former, s, tName = "texte" + id,
      h = Math.ceil( text.length / 15 ),
      textContainer = new createjs.Container( ),
      others = App.Stages.characterStage.getChildByName( "others" ),
      dText = new createjs.Text( text, "17px Arial" ),
      g = new createjs.Graphics( );
    g.beginStroke( "#000000" );
    g.beginFill( "#FFFFFF" );
    s = new createjs.Shape(g);
    dText.lineWidth = 250;
    dText.maxWidth = 250;
    dText.x = 5;
    dText.y = 3;
    dText.color = this.selectColor( dest );
    textContainer.name = tName;
    textContainer.addChild( s );
    textContainer.addChild( dText );
    g.drawRoundRect ( 0, 0, Math.min(250, dText.getMeasuredWidth( )) + 10 , dText.getMeasuredHeight( ) + 10, 5 );
    g.endFill();
    g.endStroke();
    textContainer.x = pos.j * App.tw + App.tw / 2;
    textContainer.y = pos.i * App.tw - dText.getMeasuredHeight( ) - 10;
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

  /**
    Selection de la couleur à utiliser
    @param {String} dest Destinataire
    @returns {String} Couleur à utiliser
  */
  selectColor: function ( dest ) {
    return ( ( dest == "me" && "red" ) || ( dest == "classic" && "black" ) || ( dest == "all" && "brown" ) || "blue" );
  },

  /**
    Effacement de texte
    @param {number} id Id du joueur
  */
  removeText: function ( id ) {
    var others = App.Stages.characterStage.getChildByName( "others" ),
      text = others.getChildByName( "texte" + id );
    if ( text )
      others.removeChild( text );
  },

  /**
    Déplacement du texte
    @param {number} id Id du joueur
    @param {number} diffI Différence en abscisse
    @param {number} diffJ Différence en ordonnée
  */
  moveAndText: function ( id, diffI, diffJ ) {

    var others = App.Stages.characterStage.getChildByName( "others" ),
      text = others.getChildByName( "texte" + id );
    if ( text && text.getChildAt( 1 ).color != "brown" )
      others.removeChild( text );
    else if ( text ) {
      text.x = text.x + diffJ * App.tw;
      text.y = text.y + diffI * App.tw;
    }
  },

  /**
    Apparition du nom de personnage
    @param {name} name Nom du personnage
    @param {number} id Id du personnage
  */
  showName: function ( pos, name, id, bool ) {
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
    if(bool){
      textContainer.x -= dText.getMeasuredWidth()/2;
    }
    textContainer.y = (pos.i + 1)* App.tw;
    if ( former = others.getChildByName( tName ) )
      others.removeChild( former );
    App.Stages.characterStage.getChildByName( "others" ).addChild( textContainer );
  },

  /**
    Effacement du nom d'un personnage
    @param {number} id Id du joueur
  */
  removeName: function ( id ) {
    var others = App.Stages.characterStage.getChildByName( "others" ),
      text = others.getChildByName( "name" + id );
    if ( text )
      others.removeChild( text );
  },

  displayQ: function (bool, name) {
    var player = App.Stages.mapStage.getChildByName( "player" ),
      display = (bool && ("Nouvelle quête : " + name)) || ("Quête achevée : " + name);
      console.log(player, display);
      var text = player.getChildByName("quest") || player.addChild(new createjs.Text(" ", "40px Arial", "#000000"));
      text.text = display;
      text.x = 15 - player.x + player.regX;
      text.y = 15 - player.y + player.regY;
      setTimeout(function(){
        if(text)
          text.text = "";
      }, 4000);
  }

} );
