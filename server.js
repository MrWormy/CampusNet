/**
Config de express
*/
var express = require( 'express' ),
  app = express( ),
  server = require( 'http' ).Server( app ),
  io = require( 'socket.io' )( server ),
  play = require("./Game.js"),
  game = new play.Game(),
  fs = require("node-fs"),
  mysql = require("mysql");;

if (true) {
  var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root"
  });
  connection.connect();
}

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
app.use('/modifQuetes', function(req, res) {
  // TODO et c'est ultra important : vérifier l'identité CAS. C'est pas compliqué mais c'est ultra-important
  fs.writeFile("quete.js", req.query.valeurjson);
  res.sendfile( __dirname + '/modifQuetes.html' );
});

app.use('/modifAvatar', function(req, res) {
  // TODO et c'est ultra important : vérifier l'identité CAS. C'est pas compliqué mais c'est ultra-important

  var requete = "UPDATE `campusnet`.`users` SET AVATAR='"+req.query.avatar+"' WHERE `login`="+req.session.login+";";
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
  });

  res.sendfile( __dirname + '/modifQuetes.html' );
});

app.get( '/quete.js', function ( req, res ) {
  res.sendfile( __dirname + '/quete.js' );
} );

io.sockets.on( 'connection', function ( socket ) {
  socket.on('ready', function(data){
    data.login = "koenig_b"; // A modifier avec le CAS
    game.appendGuy(socket, data);
  });
} );
