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
  game = new play.Game();

//variables serveur
server.listen( 19872 );
var casURL = 'https://localhost:8443/cas', // URL de base du service CAS, ex. https//www.monsite.com/cas
    serviceURL = 'http://localhost:19872'; // URL du service à autoriser par le CAS

app.use(cookieParser()) // required before session.
  app.use(session({
    secret: 'session user'
}))

app.get( '/', function ( req, resp ) {
  var ticket = req.param('ticket');
  if(ticket){
    // connexion au service de validation
    var validateURL = url.parse(casURL + '/validate?service=' + serviceURL + '&ticket=' + ticket);
    https.get({
      hostname:validateURL.hostname,
      port:validateURL.port,
      path:validateURL.path,
      rejectUnauthorized: false // à supprimer sur serveur de prod
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
          req.session.username = rep[1]; //enregistrement du nom dans la variable de session
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
  if(req.session.username)
    next();
  else
    res.redirect('/');
});


app.get( '/admin.html', function ( req, res ) {
  res.sendfile( __dirname + '/admin.html' );
} );

app.get( '/index.html', function ( req, res ) {
  res.sendfile( __dirname + '/index.html' );
} );

app.use( '/assets', express.static( __dirname + '/assets' ) );
app.use( '/node_modules', express.static( __dirname + '/node_modules' ) );
app.use( '/app', express.static( __dirname + '/app' ) );
app.use( '/editeur_de_quetes', express.static( __dirname + '/editeur_de_quetes' ) );
app.get( '/quete.js', function ( req, res ) {
  res.sendfile( __dirname + '/quete.js' );
} );

app.use( '*', function(req, res, next){
  res.sendfile( __dirname + '/404.html');
  });

io.sockets.on( 'connection', function ( socket ) {
  socket.on('ready', function(data){
    game.appendGuy(socket, data);
  } );
} );
