exports.Game = function() {
	this.maps = [];
	this.maps.push(new Map());
	this.maps.push(new Map());

	this.appendGuy = function(socket, data) {
		this.maps[data.map].appendGuy(socket, data.initPos);
	}
}

var Guy = function(socket, id, initPos, Map) {
	this.socket = socket;
	var that = this;
	this.pos = initPos;
	this.id = id;

	Map.emit("popGuy", {id: this.id, pos: this.pos}, this.id);

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
		// if (data.destinataire == 'none') {
			info.prive = false;
			Map.emit("message", info, that.id);
		// } else {
		// 	info.prive = true;
		// 	Map.guys[data.destinataire].emit("message", info);
		// }
	});

}

var Map = function() {
	this.guys = [];
	this.idnew = 0;

	this.appendGuy = function(socket, initPos) {
		if (this.idnew == this.guys.length) {
			this.guys.unshift(new Guy(socket, this.guys.length, initPos, this));
		} else {
			this.guy[this.guys.length - 1 - this.idnew] = new Guy(socket, this.guys.length, initPos, this);
		}
		this.calculeridnew();
		for (var i=0 ; i<this.guys.length ; i++) {
			var guy = this.guys[i];
			if (guy != undefined) {
				socket.emit("popGuy", {id: guy.id, pos: guy.pos});
			}
		}
	}

	this.calculeridnew = function() {
		for (var i=this.idnew ; i<this.guys.length-1 ; i++) {
			if (this.guys[this.guys.length - 1 - i] == undefined) {
				this.idnew = i;
				return 0;
			}
		}
		this.idnew = this.guys.length;
	}

	this.emit = function(nom, data, exception) {
		for (var i=0 ; i<this.guys.length ; i++) {
			if (this.guys[i] != undefined && this.guys[i].id != exception) {
				this.guys[i].socket.emit(nom, data);
			}
		}
	}

	this.deletePlayer = function(id) {
		delete this.guys[this.guys.length - 1 - id];
		this.emit("aurevoir", id, id);
	}
}
