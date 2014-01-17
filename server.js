var express = require( 'express' ),
  app = express( ),
  server = require( 'http' ).createServer( app ),
  io = require( 'socket.io' ).listen( server );

server.listen( 19872 );

app.get( '/', function ( req, res ) {
  res.sendfile( __dirname + '/index.html' );
} );

app.use( '/assets', express.static( __dirname + '/assets' ) );
app.use( '/app', express.static( __dirname + '/app' ) );

io.sockets.on( 'connection', function ( socket ) {
  // sockets
} );
