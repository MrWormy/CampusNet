exports.Game = function() {
	this.guys = [];

	this.appendGuy = function(socket) {
		this.guys.unshift(new Guy(socket, this.guys.length));
		for (var i=0 ; i<this.guys.length ; i++) {
			console.log(this.guys);
			var guy = this.guys[i];
			socket.emit("popGuy", {id: guy.id, pos: guy.pos});
		}
		//socket.broadcast.emit("popGuy", {x: this.x, y: this.y});
	}
}

var Guy = function(socket, id) {
	console.log(this);
	this.socket = socket;
	var that = this;
	this.pos = {i : 20, j: 30};
	this.id = id;

	socket.on("iMove", function(data) {
		socket.broadcast.emit("iMove", {id: that.id, data: data});
	});
}
