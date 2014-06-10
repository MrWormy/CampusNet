/**
Game
*/
exports.Game = function() {

	var listeDesMaps = require("./assets/resources/map/transitions.json");
	this.maps = [];
	for ( var i=0 ; i<listeDesMaps.maps.length ; i++ ) {
		this.maps.push(new Map());
	}

	this.appendGuy = function(socket, data) {
		this.maps[data.map].appendGuy(socket, data.pName, data.initPos);
	}
}

/**
Variable Guy
@param {} socket
@param {} id
@param {} pName
@param {} initPos
@param {} Map
*/
var Guy = function(socket, id, pName, initPos, Map) {
	this.socket = socket;
	var that = this;
	this.pos = initPos;
	this.pName = pName;
	this.id = id;
	this.quetes = require("./quete.js").liste;

	Map.emit("popGuy", {id: this.id, pName: pName, pos: this.pos}, this.id);

	socket.on("iMove", function(data) {
		that.pos = data;
		Map.emit("iMove", {id: that.id, pos: data});
	});

	socket.on("disconnect", function() {
		Map.deletePlayer(that.id);
	});

	socket.on("quitMap", function() {
		Map.deletePlayer(that.id);
	});

	socket.on("message", function(data) {
		var info = {}, tempGuy;
		info.expediteur = that.id;
		info.msg = data.msg;
		info.destinataire = data.destinataire;
		if (!data.private) {
			info.prive = false;
			Map.emit("message", info, that.id);
		} else {
			info.prive = true;
			if(tempGuy = Map.findGuy(data.destinataire))
				tempGuy.socket.emit("message", info);
		}
	});

	socket.on("parler_pnj", function(id) {
		var hesaidit = false;
		for (var i=0 ; i<that.quetes.length ; i++) {
			if (that.quetes[i].status=="unlocked") {
				if (that.quetes[i].objet.type=="parler_pnj" && that.quetes[i].objet.id_pnj==id) {
					socket.emit("reponse_pnj", {id: id, texte: that.quetes[i].objet.dialogue});
					that.valider_quete(i);
					hesaidit = true;
				}
			}
		}
		if (!hesaidit) {
			socket.emit("reponse_pnj", {id: id, texte: undefined});; // Si aucune quete ne corresond, on affichera le texte de base
		}
	});

	this.valider_quete = function(id) {
		this.quetes[id].status = "locked";
		for (var i=0 ; i<this.quetes[id].finish.length ; i++) {
			this.quetes[this.quetes[id].finish[i]].status = "unlocked";
		}
	}

	this.removeMap = function() {
		socket.removeAllListeners("message");
		socket.removeAllListeners("iMove");
		socket.removeAllListeners("disconnect");
		socket.removeAllListeners("quitMap");
		socket.removeAllListeners("parler_pnj");
	}

}

/**
Variable Map
*/
var Map = function() {
	this.guys = [];
	this.idnew = 0;

	/**
		@param {} socket
		@param {} pName
		@param {} initPos
	*/
	this.appendGuy = function(socket, pName, initPos) {
		for (var i=0 ; i<this.guys.length ; i++) {
			if (this.guys[i]!=undefined && this.guys[i].pName==pName) {
				socket.emit("pb_pseudo");
				return null;
			}
		}
		this.calculeridnew();
		this.guys.unshift(new Guy(socket, this.idnew, pName, initPos, this))
		for (var i=0 ; i<this.guys.length ; i++) {
			var guy = this.guys[i];
			if (guy != undefined) {
				socket.emit("popGuy", {id: guy.id, pos: guy.pos, pName: guy.pName});
			}
		}
	}

	/**
	*/
	this.calculeridnew = function() {
		var tempId = 0, tempGuy;
		for (var i=0 ; i<this.guys.length ; i++) {
			tempGuy = this.guys[i];
			if (tempGuy && tempGuy.id >= tempId) {
				tempId = tempGuy.id + 1;
			}
		}
		this.idnew = tempId;
	}

	this.findGuy = function(id){
		var l = this.guys.length, tempGuy = null;
		for(var i = 0; i<l; i++){
			tempGuy = this.guys[i];
			if(tempGuy.id == id)
				break;
		}
		return tempGuy;
	}

	/**
		@param {} nom
		@param {} data
		@param {} exception
	*/
	this.emit = function(nom, data, exception) {
		for (var i=0 ; i<this.guys.length ; i++) {
			if (this.guys[i] != undefined && this.guys[i].id != exception) {
				this.guys[i].socket.emit(nom, data);
			}
		}
	}

	/**
		@param {} id
	*/
	this.deletePlayer = function(id) {
		console.log(id, this.guys);
		for (var i = 0; i < this.guys.length; i++){
			if(this.guys[i].id == id){
				this.guys[i].removeMap();
				delete this.guys[i];
				this.guys.splice(i, 1);
				break;
			}
		}
		this.emit("aurevoir", id, id);
	}
}
