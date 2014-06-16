useBDD = false;

if (useBDD) {
	var mysql = require("mysql");
	var connection = mysql.createConnection({
		host: "localhost",
		user: "root",
		password: "root"
	});
	connection.connect();
}


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
		this.maps[data.map].appendGuy(socket, data.initPos, data.login);
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
var Guy = function(socket, id, initPos, Map, login) {
	this.socket = socket;
	var that = this;
	this.pos = initPos;
	this.pName = login;
	this.id = id;
	this.quetes = require("./quete.js").liste;
	this.login = login;
	this.idBDD = null;

	Map.emit("popGuy", {id: this.id, pName: that.pName, pos: this.pos}, this.id);

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
			socket.emit("reponse_pnj", {id: id, texte: undefined}); // Si aucune quete ne corresond, on affichera le texte de base
		}
	});

	socket.on("setAvatar", function(avatar) {
		if (that.idBDD != null) {
			var requete = "UPDATE `campusnet`.`users` SET `avatar`="+avatar+" WHERE `id`="+idBDD+";";
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
			});
		}
	});

	socket.on("getAvatar", function(avatar) {
		if (that.idBDD != null) {
			var requete = "SELECT `avatar` FROM `campusnet`.`users` WHERE `id`="+that.idBDD+";";
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
				socket.emit("avatar", parseInt(rows[0].avatar));
			});
		} else {
			socket.emit("avatar", 0);
		}
	});

	/*
	socket.on("setNom", function(nom) {
		if (that.idBDD != null) {
			var requete = "UPDATE `campusnet`.`users` SET `nom`="+nom+" WHERE `id`="+idBDD+";";
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
			});
		}
	});

	socket.on("getNom", function(nom) {
		if (that.idBDD != null) {
			var requete = "SELECT `nom` FROM `campusnet`.`users` WHERE `id`="+that.idBDD+";";
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
				socket.emit("nom", rows[0].nom);
			});
		} else {
			socket.emit("nom", "anonyme " + that.id);
		}
	});
	*/

	socket.on("setBio", function(bio) {
		if (that.idBDD != null) {
			var requete = "UPDATE `campusnet`.`users` SET `bio`="+bio+" WHERE `id`="+idBDD+";";
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
			});
		}
	});

	socket.on("getBio", function(bio) {
		if (that.idBDD != null) {
			var requete = "SELECT `bio` FROM `campusnet`.`users` WHERE `id`="+that.idBDD+";";
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
				socket.emit("bio", rows[0].bio);
			});
		} else {
			socket.emit("bio", "Inconnue");
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

	this.loadBDD = function() {
		var requete = "SELECT `id` FROM `campusnet`.`users` WHERE `login`='"+that.login+"';";
		connection.query(requete, function(err, rows, fields) {
			if (err) throw err;
			if (rows[0] != undefined && parseInt(rows[0].id) >= 0) {
				that.idBDD = parseInt(rows[0].id);
			} else { // Creer un nouveau
				that.signin();
			}
		});
	}

	this.signin = function() {
		var requete = "INSERT INTO `campusnet`.`users` (`login`, `nom`) VALUES ('"+that.login+"', '"+that.login+"');";
		connection.query(requete, function(err, rows, fields) {
			if (err) throw err;
			if (rows[0] != undefined && parseInt(rows[0].id) >= 0) {
				that.idBDD = parseInt(rows[0].id);
			}
		});
	}

	if (useBDD) {this.loadBDD(); }

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
	this.appendGuy = function(socket, initPos, login) {
		this.calculeridnew();
		this.guys.unshift(new Guy(socket, this.idnew, initPos, this, login));
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

exports.isAdmin = function(login) {
	var listeAdmins = ['admin', 'benning', 'kimyonok', 'laurence', 'koenig_b'];
	return (listeAdmins.indexOf(login) >= 0);
}