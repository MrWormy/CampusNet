App.Models.Pnj = Backbone.Model.extend( {
	initialize: function() {

    //  App.map[ pos ] = 2; ligne 169, event-handler
    	if (this.id!=undefined) { // C'est dégueu mais ça marche
			var perso = new createjs.Sprite( App.persos[this.get("skin") || "etu-m-brown-blue.png"] || App.persos["etu-m-brown-blue.png"] ),
				tw = App.tw,
				that = this;
			perso.gotoAndStop( this.get("orientation") || 0 );
			perso.name = "pnj " + this.id;
			perso.x = this.get( "pos" ).j * tw;
			perso.y = this.get( "pos" ).i * tw;
			perso.addEventListener( "mouseover", function ( ) {
				App.views.drawings.showName( that.get( "pos" ), that.get( "pName" ), that.get( "id" ) );
			} );
			perso.addEventListener( "mouseout", function ( ) {
				App.views.drawings.removeName( that.get( "id" ) );
			} );
			perso.addEventListener("click", function ( ) {
				App.socket.emit("parler_pnj", that.id);
			});
			this.set( "perso", perso );
		}
	},

	afficher: function(id_map) {
		if (this.get("map") == id_map) {
			App.map[this.get("pos").i * App.layerWidth + this.get("pos").j] = 2;
			App.Stages.characterStage.getChildByName( "others" ).addChild( this.get("perso") );
		}
	},

	parler: function(texte) {
		if (texte==undefined) {
			texte = this.get("text");
		}
		var that = this;
		App.views.drawings.drawText( texte, {
			"i": parseInt(that.get("pos").i),
			"j": parseInt(that.get("pos").j)
		}, 1000, "all" );
	}

} );

App.Collections.Pnjs = Backbone.Collection.extend({
	url: "assets/resources/pnj.json",
	model: App.Models.Pnj,

	initialize: function() {
	},

	newMap: function (id_map) {
		var that = this;
	  if(this.models.length > 0){
			for (var i=0 ; i<that.models.length ; i++) {
				that.models[i].afficher(id_map);
			}
	  } else {
			this.fetch().done(function() {
				for (var i=0 ; i<that.models.length ; i++) {
					that.models[i].afficher(id_map);
				}
			});
	  }
	},

	message: function(data) {
		this.get(data.id).parler(data.texte);
	}
});
