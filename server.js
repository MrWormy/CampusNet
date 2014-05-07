var express = require( 'express' ),
  app = express( ),
  server = require( 'http' ).createServer( app ),
  io = require( 'socket.io' ).listen( server ),
  play = require("./Game.js"),
  game = new play.Game();

server.listen( 19872 );

app.get( '/', function ( req, res ) {
  res.sendfile( __dirname + '/index.html' );
} );
app.get( '/admin.html', function ( req, res ) {
  res.sendfile( __dirname + '/admin.html' );
} );

app.use( '/assets', express.static( __dirname + '/assets' ) );
app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
app.use( '/app', express.static( __dirname + '/app' ) );
app.use( '/mapEditor', express.static( __dirname + '/mapEditor' ) );

io.sockets.on( 'connection', function ( socket ) {
  socket.on('ready', function(data){
    game.appendGuy(socket, data);
  });
} );
