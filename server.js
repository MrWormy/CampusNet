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
  server = require( 'http' ).Server( app ),
  io = require( 'socket.io' )( server ),
  play = require("./Game.js"),
  game = new play.Game(),
  MemoryStore = session.MemoryStore,
  sessionStore = new MemoryStore(),
  Session = require('connect').middleware.session.Session;

// app.use(cookieParser()) // required before session.
//   app.use(session({
//     secret: 'session user',
//     store: sessionStore,
//     key: "express.sid"
// }))

server.listen( 19872 );

app.get( '/', function ( req, res ) {
  //req.session.test = "coucou";
  res.sendfile( __dirname + '/index.html' );
} );
app.get( '/admin.html', function ( req, res ) {
  res.sendfile( __dirname + '/admin.html' );
  // console.log(sessionStore, req.headers.cookie);
  /*sessionStore.get(req.headers.cookie.split("connect.sid=")[1].split(" ")[0], function(err, session) {
    console.log("session et err : ", session, " ", err);
  });*/
} );

app.use( '/assets', express.static( __dirname + '/assets' ) );
app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
app.use( '/app', express.static( __dirname + '/app' ) );
app.use( '/editeur_de_quetes', express.static( __dirname + '/editeur_de_quetes' ) );
app.get( '/quete.js', function ( req, res ) {
  res.sendfile( __dirname + '/quete.js' );
} );


io.set('authorization', function (data, accept) {
  data.test = "jsaispasnimportequoi";
  accept(null, true);
    /*if (data.headers.cookie) {
        data.cookie = require("cookie").parse(data.headers.cookie);
        data.sessionID = data.cookie['express.sid'].split(":")[1].split(".")[0];
        // console.log(data.sessionID);
        // data.sessionStore = sessionStore;
        sessionStore.get(data.sessionID, function (err, session) {
            if (err || !session) {
                // if we cannot grab a session, turn down the connection
                accept('Error', false);
                // console.log("Error");
            } else {
                // save the session data and accept the connection
                // data.session = session;
                data.session = new Session(data, session);
                accept(null, true);
                // console.log(session);
            }
        });
    } else {
      console.log("No cookie transmitted.");
       return accept('No cookie transmitted.', false);
    }*/
});


io.sockets.on( 'connection', function ( socket ) {
  console.log(socket.handshake.test);
  socket.on('ready', function(data){
    game.appendGuy(socket, data);
  });
} );
