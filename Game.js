/**
Game
*/
exports.Game = function() {
	this.maps = [];
	this.maps.push(new Map());
	this.maps.push(new Map());

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
		socket.broadcast.emit("iMove", {id: that.id, pos: data});
	});

	socket.on("disconnect", function() {
		Map.deletePlayer(that.id);
	});

	socket.on("quitMap", function() {
		Map.deletePlayer(that.id);
	});

	socket.on("message", function(data) {
		var info = {};
		info.expediteur = that.id;
		info.msg = data.msg;
		info.destinataire = data.destinataire;
		if (!data.private) {
			info.prive = false;
			Map.emit("message", info, that.id);
		} else {
			info.prive = true;
			Map.guys[Map.guys.length - data.destinataire - 1].socket.emit("message", info);
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
		if (this.idnew == this.guys.length) {
			this.guys.unshift(new Guy(socket, this.guys.length, pName, initPos, this));
		} else {
			this.guys[this.guys.length - 1 - this.idnew] = new Guy(socket, this.guys.length, pName, initPos, this);
		}
		this.calculeridnew();
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
		for (var i=this.idnew ; i<this.guys.length-1 ; i++) {
			if (this.guys[this.guys.length - 1 - i] == undefined) {
				this.idnew = i;
				return 0;
			}
		}
		this.idnew = this.guys.length;
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
		delete this.guys[this.guys.length - 1 - id];
		this.emit("aurevoir", id, id);
	}
}
