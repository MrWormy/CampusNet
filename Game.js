exports.Game = function() {
	this.guys = [];

	this.appendGuy = function(socket, initPos) {
		this.guys.unshift(new Guy(socket, this.guys.length, initPos));
		for (var i=0 ; i<this.guys.length ; i++) {
			var guy = this.guys[i];
			socket.emit("popGuy", {id: guy.id, pos: guy.pos});
		}
		//socket.broadcast.emit("popGuy", {x: this.x, y: this.y});
	}
}

var Guy = function(socket, id, initPos) {
	this.socket = socket;
	var that = this;
	this.pos = initPos;
	this.id = id;

	socket.on("iMove", function(data) {
		socket.broadcast.emit("iMove", {id: that.id, data: data});
	});
}
