var express = require( 'express' ),
  app = express( ),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  https = require( 'https' ),
  http = require('http'),
  server = require( 'http' ).createServer( app ),
  io = require( 'socket.io' ).listen( server ),
  play = require("./Game.js"),
  logged = false,
  game = new play.Game();

server.listen( 19872 );

app.use(cookieParser()) // required before session.
  app.use(session({
    secret: 'session user'
}))

app.get( '/', function ( req, resp ) {
  var ticket = req.param('ticket');
  var host = 'http://localhost:19872';
  if(ticket){
    // connexion au service de valdation
    https.get({
      hostname:'localhost',
      port:8443,
      path: '/cas/validate?service=' + host + '&ticket=' + ticket,
      rejectUnauthorized: false
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
    resp.redirect('https://localhost:8443/cas/login?service=' + host); // redirection vers le service de login
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
  });
} );
