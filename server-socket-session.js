/**
Config de express
*/
var express = require( 'express' ),
  app = express( ),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  server = require( 'http' ).createServer( app ),
  io = require( 'socket.io' )( server ),
  play = require("./Game.js"),
  MemoryStore = session.MemoryStore,
  cookie = require("cookie");
  sessionStore = new MemoryStore(),
  game = new play.Game();

app.use(cookieParser()) // required before session.
app.use(session({
    secret: 'session user',
    store: sessionStore,
    key: "express.sid"
}))

server.listen( 19872 );

app.get( '/', function ( req, res ) {
  req.session.login = "coucou";
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

io.use(function (socket, next) {
  var sid = cookie.parse(socket.request.headers.cookie)['express.sid'].split(":")[1].split(".")[0];

  sessionStore.get(sid, function (err, login) {
           if (err || !login) {
            next(new Error("connexion refusée"));
          } else {
            // save the session data and accept the connection
            socket.login = login;
            next();
          }
      });
});

io.sockets.on( 'connection', function ( socket ) {
  console.log(socket.login.login);
  socket.on('ready', function(data){
    data.login = "koenig_b"; // A modifier avec le CAS
    game.appendGuy(socket, data);
  });
} );
