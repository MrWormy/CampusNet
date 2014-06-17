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
var casURL = 'https://localhost:8443/cas', // URL de base du service CAS, ex. https//www.monsite.com/cas
    serviceURL = 'http://localhost:19872'; // URL du service à autoriser par le CAS

app.use(cookieParser()) // required before session.
  app.use(session({
    secret: 'session user',
    store: sessionStore,
    key: "express.sid"
}))

app.get( '/404.html', function ( req, res ) {
  res.sendfile( __dirname + '/404.html' );
} );

app.get( '/', function ( req, resp ) {
  var ticket = req.param('ticket');
  if(ticket){
    // connexion au service de validation
    var validateURL = url.parse(casURL + '/validate?service=' + serviceURL + '&ticket=' + ticket);
    https.get({
      hostname:validateURL.hostname,
      port:validateURL.port,
      path:validateURL.path
      , rejectUnauthorized: false // pour autoriser un certificat auto-signé
      },
      function(res){
      res.on('error', function(e) {
        callback(e);
      });
      var donnees = '';
      res.on('data', function(data){
        donnees += data;
      });
      res.on('end', function(){
        var rep = donnees.split('\n');
        if(rep[0] == 'yes'){
          req.session.login = rep[1]; //enregistrement du nom dans la variable de session
          resp.redirect('index.html');
          return;
        } else {
          resp.redirect('/');
        }
      });
    });
  }
  else{
    resp.redirect(casURL + '/login?service=' + serviceURL); // redirection vers le service de login
  }
} );

// test de log in
app.use(function(req, res, next){
  if(req.session.login)
    next();
  else
    res.redirect('/');
});

app.get( '/index.html', function ( req, res ) {
  var requete = "SELECT login, avatar FROM campusnet.users WHERE login='"+req.session.login+"';";
  var connection = play.openConnectionBDD();
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
    if (rows[0] && rows[0].login == req.session.login && rows[0].avatar != null && rows[0].avatar != "") {
      res.sendfile( __dirname + '/index.html' );
    } else {
      res.sendfile( __dirname + '/selectSkin.html' );
    }
  });
  connection.end();
} );
app.use( '/assets', express.static( __dirname + '/assets' ) );
app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
app.use( '/app', express.static( __dirname + '/app' ) );
app.get( '/quete.js', function ( req, res ) {
  res.sendfile( __dirname + '/quete.js' );
} );
app.use('/modifAvatar', function(req, res) {
  var requete = "UPDATE campusnet.users SET AVATAR='"+req.query.avatar+"' WHERE login='"+req.session.login+"';";
  var connection = play.openConnectionBDD();
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
  });
  connection.end();
  res.sendfile( __dirname + '/index.html' );
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
