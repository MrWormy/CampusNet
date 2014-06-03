App.Models.Pnj = Backbone.Model.extend( {
	initialize: function() {

    //  App.map[ pos ] = 2; ligne 169, event-handler
		var perso = new createjs.Sprite( App.perso ),
			tw = App.tw,
			that = this;
		perso.gotoAndStop( Math.floor( 4 * Math.random( ) ) );
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
		this.afficher();
	},

	afficher: function(id_map) {
		console.log(this.get("map"), id_map);
		if (this.get("map") == id_map) {
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

	initialize: function(id_map) {
		console.log("id_map = ", id_map);
		this.fetch();
		for (var i=0 ; i<this.length ; i++) {
			console.log(id_map);
			this.get(i).afficher(id_map);
		}
	},

	message: function(data) {
		this.get(data.id).parler(data.texte);
	}
});

/*
App.Views.handlePnj = Backbone.View.extend({
	el: "#charactersCanvas",

	initialize: function ( ) {
		this.newCont( );
	},

	newCont: function ( ) {
		var cont = new createjs.Container( );
		cont.name = "pnjs";
		cont.x = App.Stages.mapStage.getChildAt( 0 ).x;
		cont.y = App.Stages.mapStage.getChildAt( 0 ).y;
		cont.regX = App.Stages.mapStage.getChildAt( 0 ).regX;
		cont.regY = App.Stages.mapStage.getChildAt( 0 ).regY;
		App.Stages.characterStage.addChild( cont );
	},

});
*/
