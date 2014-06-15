/**
Config de express
*/
var express = require( 'express' ),
  app = express( ),
  server = require( 'http' ).Server( app ),
  io = require( 'socket.io' )( server ),
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
app.use( '/editeur_de_quetes', express.static( __dirname + '/editeur_de_quetes' ) );
app.get( '/quete.js', function ( req, res ) {
  res.sendfile( __dirname + '/quete.js' );
} );

io.set('authorization', function (handshake, callback) {
  handshake.foo = 'bar';
  callback(null, true);
});

io.sockets.on( 'connection', function ( socket ) {
  console.log(socket.handshake.foo);
  socket.on('ready', function(data){
    data.login = "koenig_b"; // A modifier avec le CAS
    game.appendGuy(socket, data);
  });
} );
