/**
Config de express
*/
var express = require( 'express' ),
  app = express( ),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  https = require( 'https' ),
  http = require('http'),
  url = require('url'),
  server = require( 'http' ).createServer( app ),
  io = require( 'socket.io' ).listen( server ),
  play = require("./Game.js"),
  game = new play.Game(),
  MemoryStore = session.MemoryStore,
  sessionStore = new MemoryStore();

app.use(cookieParser()) // required before session.
  app.use(session({
    secret: 'session user',
    store: sessionStore,
    key: "express.sid"
}))

server.listen( 19872 );

app.get( '/', function ( req, res ) {
  req.session.test = "coucou";
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

/*
io.set('authorization', function (data, accept) {
    if (data.headers.cookie) {
        // data.cookie = cookieParser(data.headers.cookie);
        // data.sessionID = data.cookie['express.sid'];
        // console.log(data.headers.cookie.split("express.sid=")[1].split(" ")[0]);
        data.sessionID = data.headers.cookie.split("express.sid=")[1].split(" ")[0];
        // (literally) get the session data from the session store
        sessionStore.get(data.sessionID, function (err, session) {
            if (err || !session) {
                // if we cannot grab a session, turn down the connection
                accept('Error', false);
            } else {
                // save the session data and accept the connection
                data.session = session;
                accept(null, true);
                console.log(session);
            }
        });
    } else {
       return accept('No cookie transmitted.', false);
    }
});
*/

io.sockets.on( 'connection', function ( socket ) {
  // console.log(socket.handshake);
  socket.on('ready', function(data){
    game.appendGuy(socket, data);
  });
} );
