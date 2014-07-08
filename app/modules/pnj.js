App.Models.Pnj = Backbone.Model.extend( {
	initialize: function() {

    //  App.map[ pos ] = 2; ligne 169, event-handler
    	if (this.id!=undefined) { // C'est dégueu mais ça marche
			var perso,
				skin = this.get("skin"),
				object = this.get("object"),
				tw = App.tw,
				that = this;

			if (object){
				var cont = new createjs.Container();
				for(var i = 0, l = object.length; i < l; i+=3){
					var temp = new createjs.Sprite(App.spriteSheet);
					temp.gotoAndStop(object[i]);
					temp.x = object[i+1] ? object[i+1] * App.tw : 0;
					temp.y = object[i+2] ? object[i+2] * App.tw : 0;
					cont.addChild(temp);
				}
				perso = cont;
			} else {
				perso = new createjs.Sprite( App.persos[skin || "etu-m-brown-blue.png"] || App.persos["etu-m-brown-blue.png"] );
				perso.gotoAndStop( this.get("orientation") || 0 );
			}
			perso.x = this.get( "pos" ).j * tw;
			perso.y = this.get( "pos" ).i * tw;
			perso.name = "pnj " + this.id;
			perso.addEventListener("click", function ( ) {
				App.socket.emit("parler_pnj", that.id);
			});
			this.set( "perso", perso );
		}
	},

	afficher: function(id_map) {
		if (this.get("map") == id_map) {
			if(this.get("height") && this.get("width")){
				for (var k = 0; k<this.get("height"); k++){
					App.map[(this.get("pos").i+k) * App.layerWidth + this.get("pos").j] = 2;
				}
				for (var l = 0; l<this.get("width"); l++){
					App.map[this.get("pos").i * App.layerWidth + this.get("pos").j + l] = 2;
				}
				if(this.get("showName")){
					App.views.drawings.showName( {i: this.get("pos").i + k - 1, j: this.get("pos").j + (l - 1)/2}, this.get( "pName" ), - this.get( "id" ) - 1, true );
				}
			} else {
				App.map[this.get("pos").i * App.layerWidth + this.get("pos").j] = 2;
				App.views.drawings.showName( this.get( "pos" ), this.get( "pName" ), - this.get( "id" ) - 1, true );
			}
			App.Stages.characterStage.getChildByName( "others" ).addChildAt( this.get("perso"), 0 );
		}
	},

	parler: function(texte) {
		if (texte=="default") {
			texte = this.get("text");
		}
		var that = this;
		if(texte != "none"){
			App.views.drawings.drawText( texte, {
				"i": parseInt(that.get("pos").i),
				"j": parseInt(that.get("pos").j)
			}, 10000, "pnj" );
		}
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
