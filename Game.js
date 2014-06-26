var useBDD = true;

var mysql = require("mysql");

var openConnectionBDD = function() {
	var connection = mysql.createConnection({
		host: "localhost",
		user: "root"/*,
		password: "root"*/
	});
	connection.connect();
	return connection;
}

exports.openConnectionBDD = openConnectionBDD;
/**
Game
*/
exports.Game = function() {

	var listeDesMaps = require("./assets/resources/map/transitions.json"),
		listeDesAvatars = require("./assets/resources/avatars.json");
	this.maps = [];
	for ( var i=0 ; i<listeDesMaps.maps.length ; i++ ) {
		this.maps.push(new Map());
	}

	this.testAvatar = function (ava) {
		if(ava){
			for (var i = listeDesAvatars.avatars.length - 1; i >= 0; i--) {
				if(listeDesAvatars.avatars[i] == ava){
					console.log("\n client choice : " + ava);
					return ava;
				}
			}
		}
		console.log("\n client's avatar choice doesn't exist, default has been asigned : " + ava);
		return "etu-m-brown-blue.png";
	};

	this.appendGuy = function(socket, data) {
		this.maps[data.map].appendGuy(socket, data.initPos, data.login);
	};
}

/**
Variable Guy
@param {} socket
@param {} id
@param {} pName
@param {} initPos
@param {} Map
*/
var Guy = function(socket, id, initPos, Map, login, idBdd, skin) {
	this.socket = socket;
	var that = this;
	this.pos = initPos;
	this.pName = login;
	this.id = id;
	this.login = login;
	this.idBDD = idBdd;
	this.skin = skin;

	Map.emit("popGuy", {id: this.id, pName: that.pName, pos: this.pos, skin: this.skin}, this.id);

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

	/*socket.on("setAvatar", function(avatar) {
		if (that.idBDD != null) {
			var requete = "UPDATE `campusnet`.`users` SET `avatar`="+avatar+" WHERE `id`="+idBDD+";";
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
			});
		}
	});*/

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

	this.removeMap = function() {
		socket.removeAllListeners("message");
		socket.removeAllListeners("iMove");
		socket.removeAllListeners("quitMap");
	}

	this.loadBDD = function() {
		var requete = "SELECT `id` FROM `campusnet`.`users` WHERE `login`='"+that.login+"';";
		var connection = openConnectionBDD();
		connection.query(requete, function(err, rows, fields) {
			if (err) throw err;
			if (rows[0] != undefined && parseInt(rows[0].id) >= 0) {
				that.idBDD = parseInt(rows[0].id);
			} else { // Creer un nouveau
				//that.signin();
			}
		})
		connection.end();
	}

	/* this.signin = function() {
		var requete = "INSERT INTO `campusnet`.`users` (`login`, `nom`) VALUES ('"+that.login+"', '"+that.login+"');";
		var connection = openConnectionBDD();
		connection.query(requete, function(err, rows, fields) {
			if (err) throw err;
			if (rows[0] != undefined && parseInt(rows[0].id) >= 0) {
				that.idBDD = parseInt(rows[0].id);
			}
		});
		connection.end();
	} */

	this.getSkin = function() {
		if (that.idBDD != null) {
			var requete = "SELECT `avatar` FROM `campusnet`.`users` WHERE `id`="+that.idBDD+";";
			var connection = openConnectionBDD();
			connection.query(requete, function(err, rows, fields) {
				if (err) throw err;
				return rows[0];
			});
			connection.end();
		} else {
			return null;
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
	this.appendGuy = function(socket, initPos, login) {
		var requete = "SELECT `id`, `avatar`  FROM `campusnet`.`users` WHERE `login`='"+login+"';",
		 connection = openConnectionBDD(),
		 that = this;
		connection.query(requete, function(err, rows, fields) {
			if (err) throw err;
			if (rows[0] != undefined && parseInt(rows[0].id) >= 0 && rows[0].avatar) {
				that.calculeridnew();
				that.guys.unshift(new Guy(socket, that.idnew, initPos, that, login, rows[0].id, rows[0].avatar));
				for (var i=0 ; i<that.guys.length ; i++) {
					var guy = that.guys[i];
					if (guy != undefined) {
						socket.emit("popGuy", {id: guy.id, pos: guy.pos, pName: guy.pName, skin: guy.skin});
					}
				}
			} else { // Un erreur dans le processus de connection est survenue, il faut recommencer
				socket.disconnect();
			}
		})
		connection.end();
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

function isIn (el, list) {
	var bool = false;
	for (var i = list.length - 1; i >= 0; i--) {
		if(list[i] == el){
			bool = true;
			break;
		}
	};
	return bool;
}

exports.isAdmin = function(login) {
	var listeAdmins = ['admin', 'benning', 'kimyonok', 'laurence', 'koenig_b', 'nouveau'];
	return (listeAdmins.indexOf(login) >= 0);
}

exports.quests = function(login, socket){
	var that = this;
	this.quetes = require("./admin/editeur_de_quetes/quetes.json");
	this.nbPnj = require("./assets/resources/pnj.json").length;
	this.QenCours = [];
	this.Qterminees = [];
	// var requete = "SELECT `avatar` FROM `campusnet`.`users` WHERE `id`="+that.idBDD+";",
	// 	connection = openConnectionBDD();
	// connection.query(requete, function(err, rows, fields) {
	// 	if (err) throw err;
	// 	return rows[0];
	// });
	// connection.end();

	socket.on("parler_pnj", function(idPnj) {
		var dial = "default",
			idSpeaker = idPnj;
		if(typeof(idPnj) == "number" && (0 <= idPnj) && (idPnj < that.nbPnj)){
			for(var i = 0; i < that.quetes.length; i++){
				var curQ = that.quetes[i];
				if(idPnj == curQ.idPnj){
					if(isIn(curQ.id, that.QenCours)){
						var bool = that.checkEndQ(curQ);
						idSpeaker = curQ.speaker;
						if(bool){
							that.endQ(curQ.id);
							that.Qterminees.push(curQ.id);
							dial = curQ.dialEnd;
							break;
						}
						else {
							dial = curQ.dialQ;
							break;
						}
					}
					else if(isIn(curQ.id, that.Qterminees)) {
						idSpeaker = curQ.speaker;
						dial = curQ.dialEnded;
					}
					else {
						var bool = true;
						for(var j = 0; j < curQ.QEforDispo.length; j++){
							if(!isIn(curQ.QEforDispo[j], that.Qterminees)){
								bool = false;
								break;
							}
						}
						if(bool){
							for(var j = 0; j < curQ.QCforDispo.length; j++){
								if(!isIn(curQ.QCforDispo[j], that.QenCours)){
									bool = false;
									break;
								}
							}
						}
						if(bool){
							var bool2 = that.checkEndQ(curQ);
							idSpeaker = curQ.speaker;
							if(bool2) {
								that.Qterminees.push(curQ.id);
								dial = curQ.dialEnd;
								break;
							}
							else {
								that.QenCours.push(curQ.id);
								dial = curQ.dialInit;
								break;
							}
						}
					}
				}
			}
			socket.emit("reponse_pnj", {"id":idSpeaker, "texte":dial});
		}
	});

	this.checkEndQ = function(Quest){
		var bool = true
		for(var i = 0; i<Quest.QneededToEnd.length; i++){
			if(!isIn(Quest.QneededToEnd[i], this.Qterminees)){
				bool = false;
				break;
			}
		}
		return bool;
	}

	this.endQ = function(qId){
		for(var i = 0; i<this.QenCours.length; i++){
			if(this.QenCours[i] == qId){
				this.QenCours.splice(i, 1);
			}
		}
	}

}
