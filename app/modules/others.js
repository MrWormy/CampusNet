App.Models.OtherPlayer = Backbone.Model.extend({

	initialize: function () {
		this.pop();
		this.on('change', this.update);
	},

	pop:function (argument) {
		var.perso = new createjs.Bitmap(App.character);
		perso.name = "joueur " + this.name;
		perso.x = this.posX;
		perso.y = this.posY;
		this.set("perso": perso);
		App.stage.getChildAt(1).addChild(this.perso);
	},

	update: function () {
		// socket de mise a jour de la pos 
	}

});

App.Collections.OtherPlayers = Backbone.Collection.extend( {

  model: App.Models.OtherPlayer,

  move: function(way, id){
		var perso = this.pero,
      that = this,
      model = this.get(id);
      tileW = App.models.map.get( "tilewidth" ),
      tileH = App.models.app.get( "tileheight" );
    clearInterval( this.moving );
    this.moving = setInterval( function ( ) {
      var currentTarget = way.shift( );
      if ( !currentTarget )
        clearInterval( that.animating ) 
      else
        that.moveIt( perso, model, currentTarget, tileW, tileH );
    }, 90 );

	},  

	moveIt: function ( perso, model, currentTarget, tw, th ) {
    var x = currentTarget.j * tw,
      y = currentTarget.i * th,
      currentX = model.get( "posX" ),
      currentY = model.get( "posY" );
    perso.x += currentX + x;
    perso.y += currentY + y;
    model.set( {
      "currentX": x,
      "currentY": y
    });
  },

	moving: {}

} );
