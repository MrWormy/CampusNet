exports.Game = function() {
	this.guys = [];

	this.appendGuy = function(socket) {
		this.guys.push(new Guy(socket));
		for (var i=0 ; i<this.guys.length ; i++) {
			socket.emit("popGuy", {x: guy.x, y: guy.y});
		}
		socket.emit("id", this.guys.length-1);
		socket.broadcast.emit("popGuy", {x: this.x, y: this.y});
	}
}

var Guy = function(socket) {
	this.socket = socket;
	var that = this;
	this.x = 20;
	this.y = 30;

	socket.on("iMove", function(data) {
		socket.broadcast.emit("iMove", {id: that.id, data: data});
	});
}