var App = {
	Models: {},
	Views: {},
	Collections: {}
};

App.Models.Pnj = Backbone.Model.extend({
	initialize: function() {
		ListePNJs.afficher_pnj(this.get("id"), this.get("pName"));
	}
});

App.Collections.Pnjs = Backbone.Collection.extend({
	url: "../assets/resources/pnj.json",
	model: App.Models.Pnj,

	initialize: function() {
		var that = this;
		this.fetch({
			success: function() {
				for (var i=0 ; i<exports.liste.length ; i++) {
					var el = exports.liste[i];
					that.get(el.objet.id_pnj).set("status", el.status);
					that.get(el.objet.id_pnj).set("dialogue", el.objet.dialogue);
					that.get(el.objet.id_pnj).set("finish", el.finish);
					that.get(el.objet.id_pnj).set("id_quete", el.id);
				}
			}
		});
	}
});



App.Views.ListePNJs = Backbone.View.extend({
	el: "#liste_persos",

	events: {
		"click .pnj": "select_pnj"
	},

	initialize: function() {
		this.id = 0;
	},

	afficher_pnj: function(id, nom) {
		var element = "<div class='pnj'>" + id + " - " + nom + "</div>";
		this.el.innerHTML += element;
	},

	select_pnj: function(ev) {
		this.id = parseInt(ev.target.innerHTML.split(" ")[0]);
		Coordonnees.afficher_donnees(this.id, Pnjs.get(this.id).get("pName"), Pnjs.get(this.id).get("dialogue"), Pnjs.get(this.id).get("status"), Pnjs.get(this.id).get("finish"), Pnjs.get(this.id).get("text"));
	}
});

App.Views.Coordonnees = Backbone.View.extend({
	el: "#main_menu",

	events: {
		"click #immediat": "toggle_disponibilite",
		"click #dialogue_button": "modifier_dialogue",
		"click #texte_button": "modifier_texte",
		"click #ajouter_suite": "ajouter_suite",
		"click #retirer_suite": "retirer_suite",
		"click #exporter": "exporter"
	},

	afficher_donnees: function(id, nom, dialogue, status, finish, texte) {
		document.getElementById("id").innerHTML = id;
		document.getElementById("pseudo").innerHTML = nom;
		document.getElementById("dialogue").value = dialogue;
		document.getElementById("texte").value = texte;
		if (status=="unlocked") {
			document.getElementById("immediat").checked = true;
		} else {
			document.getElementById("immediat").checked = false;
		}
		this.afficher_suite(finish);
	},

	afficher_suite: function(finish) {
		document.getElementById("quetes_debloquees").innerHTML = "";
		for (var i=0 ; i<finish.length ; i++) {
			document.getElementById("quetes_debloquees").innerHTML += Pnjs.get(finish[i]).get("pName") + " ";
		}
	},

	toggle_disponibilite: function() {
		if (Pnjs.get(ListePNJs.id).get("status")=="locked") {
			Pnjs.get(ListePNJs.id).set("status", "unlocked" );
		} else {
			Pnjs.get(ListePNJs.id).set("status", "locked" );
		}
	},

	modifier_dialogue: function() {
		Pnjs.get(ListePNJs.id).set("dialogue", document.getElementById("dialogue").value );
	},

	modifier_texte: function() {
		Pnjs.get(ListePNJs.id).set("text", document.getElementById("texte").value );
	},

	ajouter_suite: function() {
		var liste = Pnjs.get(ListePNJs.id).get("finish");
		liste.push(document.getElementById("numero_quete").value);
		Pnjs.get(ListePNJs.id).set("finish", liste );
		this.afficher_suite(liste);
	},

	retirer_suite: function() {
		var liste = Pnjs.get(ListePNJs.id).get("finish");
		var value = document.getElementById("numero_quete").value;
		var i=0;
		while (i<liste.length) {
			if (liste[i]==value) {
				liste.splice(i, 1)
			} else {
				i++;
			}
		}
		Pnjs.get(ListePNJs.id).set("finish", liste );
		this.afficher_suite(liste);
	},

	exporter: function() {
		alert("Cette fonctionnalité de marche pas encore ! C'est bête hein ?");
	}
});

var Pnjs = new App.Collections.Pnjs();
var ListePNJs = new App.Views.ListePNJs();
var Coordonnees = new App.Views.Coordonnees();