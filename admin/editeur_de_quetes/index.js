var App = {
	Models: {},
	Views: {},
	Collections: {},
	models: {},
	collections: {},
	views: {}
};

App.Models.Quete = Backbone.Model.extend({

	initialize: function () {
		this.on("invalid", function(model, err){
			alert(err);
		});
	},

	validate: function (attrs, options) {
		var err = "";
		if(attrs.nameQ == "")
			err += "veuillez rentrer un nom de quête, ";
		if(bool = (typeof(App.collections.pnjs.get(attrs.idPnj)) === "undefined")){
			err += "veuillez sélectionner un pnj déclencheur valide, ";
		}
		if(typeof(App.collections.pnjs.get(attrs.speaker)) === "undefined"){
			err += "veuillez sélectionner un speaker valide, ";
		}
		if(err != ""){
			err += "merci !"
			return err;
		}
	}

});

App.Collections.Quetes = Backbone.Collection.extend({

	model: App.Models.Quete,
	url: "./quetes.json",

	initialize: function () {

	},

	getSelectedIndex: function (id) {
	  for(var i = 0; i<this.length; i++){
	  	if(this.at(i).id == id)
	  		return i;
	  }
	  return -1;
	},

	newId: function () {
		return this.at(this.length-1).id + 1;
	}

});

App.Collections.QuetesForExport = Backbone.Collection.extend({
	model: App.Models.Quete,
	url: "./quetes.json",

	initialize: function () {
	  this.fetch();
	}
});

App.Views.Quetes = Backbone.View.extend({

	el: '#listeQ',

	events: {
		"change": "questSelected"
	},

	initialize: function () {
		this.collection.on('add', function(quest){
			this.listenTo(quest, "change:nameQ", this.updateTitle);
			this.listenTo(quest, "change", this.saveQforExport);
			this.displayNewQ(quest);
		}, this);
		this.collection.on('remove', function(quest, options){
			this.stopListening(quest);
			this.removeQ(quest, options);
		}, this)
	  this.collection.fetch({
	  	error: function (coll, resp, opt) {
	  	  alert("une erreur est survenue lors du chargement des donées");
	  	}
	  });
	},

	questSelected: function (e) {
		var id = e.target.options[e.target.selectedIndex].id.split("quete")[1],
			formQ = document.getElementById("detailQ"),
			quest = this.collection.get(id);

		document.getElementById("id").innerHTML = id;
		formQ.nameQ.value = quest.get("nameQ");
		formQ.idPnj.selectedIndex = App.collections.pnjs.getSelectedIndex(quest.get("idPnj"));
		formQ.speaker.selectedIndex = App.collections.pnjs.getSelectedIndex(quest.get("speaker"));
		formQ.dialInit.value = quest.get("dialInit");
		formQ.dialQ.value = quest.get("dialQ");
		formQ.dialEnd.value = quest.get("dialEnd");
		formQ.dialEnded.value = quest.get("dialEnded");
		formQ.QEforDispo.value = quest.get("QEforDispo").toString();
		formQ.QCforDispo.value = quest.get("QCforDispo").toString();
		formQ.QneededToEnd.value = quest.get("QneededToEnd").toString();
	},

	displayNewQ: function (quest) {
		this.$el.append("<option class=\"questItem\" id=\"quete"+quest.id+"\" >"+quest.get("nameQ")+"</otion>");
		document.getElementById("listeQ").selectedIndex = this.collection.getSelectedIndex(quest.id);
		this.$el.focus();
		this.$el.change();
	},

	updateTitle: function (quest, nameQ) {
	  this.$el[0].options[this.collection.getSelectedIndex(quest.id)].innerHTML = nameQ;
	},

	removeQ: function (quest, options) {
		var el = document.getElementById("quete"+quest.id), list = document.getElementById("listeQ");
		list.remove(list.selectedIndex);
	},

	saveQforExport: function(quest, options) {
		if(options.validate){
			App.collections.quetesForExport.add(quest, {merge: true})
		}
	}

});

App.Views.Gestion = Backbone.View.extend({
	el: '#menu-left',

	events: {
		"click #saveQ": "saveQuest",
		"click #newQ": "newQuest",
		"click #removeQ": "removeQuest",
		"click #sendAllQ": "sendToServ"
	},

	initialize: function () {

	},

	saveQuest: function () {
		var quest, id, nameQ, idPnj = -1, speaker = -1, dialInit, dialEnd, dialEnded, temp,
			QEforDispo = [],
			QCforDispo = [],
			QneededToEnd = [],
			formQ = document.getElementById("detailQ"),
			obj = {};

		this.splitInAnArray(formQ.QEforDispo.value, QEforDispo);
		this.splitInAnArray(formQ.QCforDispo.value, QCforDispo);
		this.splitInAnArray(formQ.QneededToEnd.value, QneededToEnd);
		id = parseInt(document.getElementById("id").innerHTML);
		nameQ = formQ.nameQ.value.trim();
		if(temp = formQ.idPnj.options[formQ.idPnj.selectedIndex])
			idPnj = parseInt(temp.id.split("pnj")[1]);
		if(temp = formQ.speaker.options[formQ.speaker.selectedIndex])
			speaker = parseInt(temp.id.split("pnj")[1]);
		dialInit = formQ.dialInit.value.trim();
		dialQ = formQ.dialQ.value.trim();
		dialEnd = formQ.dialEnd.value.trim();
		dialEnded = formQ.dialEnded.value.trim();

		obj = {
			"nameQ": nameQ,
			"idPnj": idPnj,
			"speaker": speaker,
			"dialInit": dialInit,
			"dialQ": dialQ,
			"dialEnd": dialEnd,
			"dialEnded": dialEnded,
			"QEforDispo": QEforDispo,
			"QCforDispo": QCforDispo,
			"QneededToEnd": QneededToEnd
		};

		if(typeof(quest = this.collection.get(id)) !== "undefined"){
			quest.set(obj, {validate: true});
			formQ.QEforDispo.value = QEforDispo;
			formQ.QCforDispo.value = QCforDispo;
			formQ.QneededToEnd.value = QneededToEnd;
		}
	},

	splitInAnArray: function (str, arr) {
	  var spl = str.split(",");
	  for (var i = 0; i < spl.length; i++) {
	  	var temp = parseInt(spl[i].trim());
	  	if(!isNaN(temp) && !(typeof(this.collection.get(temp)) === "undefined"))
	  		arr.push(temp);
	  };
	},

	newQuest: function () {
	  var newQ = new App.Models.Quete({
	  	"id": this.collection.newId(),
	  	"nameQ": "nouvelle quête",
	  	"idPnj": -1,
	  	"speaker": -1,
	  	"dialInit": "",
	  	"dialQ": "",
	  	"dialEnd": "",
	  	"dialEnded": "",
	  	"QEforDispo": [],
	  	"QCforDispo": [],
	  	"QneededToEnd": []
	  });

		this.collection.push(newQ);
	},

	removeQuest: function () {
		var id = parseInt(document.getElementById("id").innerHTML),
			quest = this.collection.get(id),
			questFE = App.collections.quetesForExport.get(id);

		if(quest){
			var form = document.getElementById("detailQ");
			this.collection.remove(quest);
			if(questFE){
				App.collections.quetesForExport.remove(questFE);
			}
			form.reset();
			document.getElementById("id").innerHTML = "";
			form.idPnj.selectedIndex = -1;
			form.speaker.selectedIndex = -1;
		}
	},

	sendToServ: function () {
	  var data = JSON.stringify(App.collections.quetesForExport.toJSON());
	  $.ajax({
		  type: "POST",
		  url: "modifQuetes",
		  data: data,
		  success: function(data, status){
		  	alert("les modifications ont bien été enregistrées");
		  }
		});
		}

});

App.Models.Pnj = Backbone.Model.extend({
	initialize: function() {
		//ListePNJs.afficher_pnj(this.get("id"), this.get("pName"));
	},

});

App.Collections.Pnjs = Backbone.Collection.extend({
	url: "/assets/resources/pnj.json",
	model: App.Models.Pnj,

	initialize: function() {
	},

	getSelectedIndex: function (id) {
	  for(var i = 0; i<this.length; i++){
	  	if(this.at(i).id == id)
	  		return i;
	  }
	  return -1;
	}
});

App.Views.Pnjs = Backbone.View.extend({
	el: '.pnjsListe',

	initialize: function () {
		var that = this;
	  this.collection.fetch({
			success: function(coll, resp, opt) {
				for(var i = 0; i<that.collection.length; i++){
					var tempMod = that.collection.at(i);
					that.$el.append("<option class=\"pnjItem\" id=\"pnj"+tempMod.id+"\">"+tempMod.get("pName")+"</otion>");
				}
			}
		});
	}
});


App.collections.pnjs = new App.Collections.Pnjs();
App.views.pnjs = new App.Views.Pnjs({collection: App.collections.pnjs});
App.collections.quetes = new App.Collections.Quetes();
App.collections.quetesForExport = new App.Collections.QuetesForExport();
App.views.quetes = new App.Views.Quetes({collection: App.collections.quetes});
App.views.gestion = new App.Views.Gestion({collection: App.collections.quetes});
