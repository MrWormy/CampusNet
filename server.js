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
  MemoryStore = session.MemoryStore,
  cookie = require("cookie"),
  sessionStore = new MemoryStore(),
  game = new play.Game(),
  fs = require("node-fs");

//variables serveur
server.listen( 19872 );

app.use(cookieParser()) // required before session.
  app.use(session({
    secret: 'session user',
    store: sessionStore,
    key: "express.sid"
}));

app.get( '/404.html', function ( req, res ) {
  res.sendfile( __dirname + '/404.html' );
} );

app.get( '/', function ( req, resp ) {
  req.session.login = 'admin';
  resp.redirect('index.html');
} );

// test de log in
app.use(function(req, res, next){
  if(req.session.login)
    next();
  else
    res.redirect('/');
});

app.get( '/index.html', function ( req, res ) {
  var requete = "SELECT login, avatar FROM `campusnet`.`users` WHERE `login`="+req.session.login+";";
  var connection = play.openConnectionBDD();
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
    if (rows[0] && rows[0].login == req.session.login && rows[0].avatar != null && rows[0].avatar != "") {
      res.sendfile( __dirname + '/index.html' );
    } else {
      res.sendfile( __dirname + '/selectSkin.html' );
    }
  });
  play.closeConnectionBDD();
} );
app.use( '/assets', express.static( __dirname + '/assets' ) );
app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
app.use( '/app', express.static( __dirname + '/app' ) );
app.use( '/editeur_de_quetes', express.static( __dirname + '/editeur_de_quetes' ) );
app.use('/modifQuetes', function(req, res) {
  // TODO et c'est ultra important : vérifier l'identité CAS. C'est pas compliqué mais c'est ultra-important
  fs.writeFile("quete.js", req.query.valeurjson);
  res.sendfile( __dirname + '/modifQuetes.html' );
});

app.use('/modifAvatar', function(req, res) {
  var requete = "UPDATE `campusnet`.`users` SET AVATAR='"+req.query.avatar+"' WHERE `login`="+req.session.login+";";
  var connection = play.openConnectionBDD();
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
  });
  play.closeConnectionBDD();
} );

app.get( '/quete.js', function ( req, res ) {
  res.sendfile( __dirname + '/quete.js' );
} );

app.use(function(req, res, next){
  if(play.isAdmin(req.session.login))
    next();
  else
    res.redirect('/404.html');
});
app.use( '/admin', express.static( __dirname + '/admin' ) );
app.use('/admin/editeur_de_quetes/modifQuetes', function(req, res) {
    fs.writeFile("quete.js", req.query.valeurjson);
    res.sendfile( __dirname + '/admin/editeur_de_quetes/modifQuetes.html' );
});
app.use(function(req, res, next){
  res.redirect('/404.html');
});

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
    data.login = socket.login.login;
    game.appendGuy(socket, data);
  });
} );
