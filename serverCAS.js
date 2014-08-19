var express = require( 'express' ),
  app = express( ),
  cookieParser = require('cookie-parser'),
  session = require('express-session'),
  https = require( 'https' ),
  http = require('http'),
  url = require('url'),
  server = require( 'http' ).createServer( app ),
  io = require( 'socket.io' ).listen( server, {"pingTimeout": 20000, "pingInterval": 8000} ),
  play = require("./Game.js"),
  MemoryStore = session.MemoryStore,
  cookie = require("cookie"),
  sessionStore = new MemoryStore(),
  game = new play.Game(),
  loggedIn = [],
  quests = require("./quetes"),
  sRequests = require("./socketRequests"),
  services = require("./admin/editeur_de_droits/services.json"),
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

app.get( '/dejala.html', function ( req, res ) {
  res.sendfile( __dirname + '/dejala.html' );
} );

app.get('/logout.html', function ( req, res ) {
  if(typeof req.session.login === "string"){
    var login = req.session.login;
    for (var i = loggedIn.length - 1; i >= 0; i--) {
      if(loggedIn[i] == login){
        break;
      }
    };
    req.session.destroy();
    console.log("\n client disconnected :", login);
  }
  res.redirect( casURL + '/logout');
  //res.sendfile( __dirname + '/logout.html' );
});

app.get( '/', function ( req, resp ) {
  var ticket = req.param('ticket');
  if(ticket){
    // connexion au service de validation
    var validateURL = url.parse(casURL + '/validate?service=' + serviceURL + '&ticket=' + ticket);
    https.get({
      hostname:validateURL.hostname,
      port:validateURL.port,
      path:validateURL.path,
      rejectUnauthorized: false // pour autoriser un certificat auto-signé
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
app.use('/modifAvatar', function(req, res) {
  var requeteSel = "SELECT login FROM campusnet.users WHERE login='"+req.session.login+"';",
    avatar = game.testAvatar(req.query.avatar),
    requeteNew = "INSERT INTO campusnet.users (`login`, `nom`, `avatar`) VALUES ('"+req.session.login+"', '"+req.session.login+"', '"+avatar+"');",
    requeteUp = "UPDATE campusnet.users SET avatar='"+avatar+"' WHERE login='"+req.session.login+"';";
  var connection = play.openConnectionBDD();
  connection.query(requeteSel, function(err, rows, fields) {
    if (err) throw err;
    var oConnection = play.openConnectionBDD();
    if (rows[0] && rows[0].login == req.session.login) {
      oConnection.query(requeteUp, function(err, rows, fields) {
        if (err) throw err;
        res.redirect('index.html');
      });
    } else {
      oConnection.query(requeteNew, function(err, rows, fields) {
        if (err) throw err;
        res.redirect('index.html');
      });
    }
    oConnection.end();
  });
  connection.end();
} );

app.use(function (req, res, next) {
  var requete = "SELECT admin FROM campusnet.users WHERE login='"+req.session.login+"';",
    connection = play.openConnectionBDD();
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
    if (rows[0] && rows[0].admin > 0) {
      next();
    } else {
      res.redirect('/404.html');
    }
  });
  connection.end();
})
app.use( '/services', express.static( __dirname + '/services' ) );

app.get('/services/getPannels', function (req, res) {
  var requete = "SELECT admin FROM campusnet.users WHERE login='"+req.session.login+"';",
    connection = play.openConnectionBDD();
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
    if (rows[0] && rows[0].admin > 0) {
      res.send(quests.getPannels(rows[0].admin));
    } else {
      res.redirect('/404.html');
    }
  });
  connection.end();
});
app.use('/services/setNewPanText', function(req, res) {
  if(req.method == 'POST'){
    var obj = "";
    req.on('data', function(data){
      obj += data.toString();
    })
    req.on('end', function(){
      obj = JSON.parse(obj);
      if(obj && obj.id && obj.text){
        console.log("\n Pannel :", obj.id, "updated by :", req.session.login);
        quests.setNewPanText(obj);
      }
    })
    res.send(200);
  }
  else{
    res.redirect('/404.html');
  }
});

app.use(function(req, res, next){
  var requete = "SELECT admin FROM campusnet.users WHERE login='"+req.session.login+"';",
    connection = play.openConnectionBDD();
  connection.query(requete, function(err, rows, fields) {
    if (err) throw err;
    if (rows[0] && rows[0].admin == 1) {
      next();
    } else {
      res.redirect('/404.html');
    }
  });
});
app.use( '/admin', express.static( __dirname + '/admin' ) );
app.use('/admin/editeur_de_quetes/modifQuetes', function(req, res) {
  if(req.method == 'POST'){
    var obj = "";
    req.on('data', function(data){
      obj += data.toString();
    })
    req.on('end', function(){
      console.log("\n Quests file updated : ", req.session.login);
      quests.validate(obj);
    })
    res.send(200);
  }
  else{
    res.redirect('/404.html');
  }
});
app.use('/admin/editeur_de_pnjs/modifPnjs', function(req, res) {
  if(req.method == 'POST'){
    var obj = "";
    req.on('data', function(data){
      obj += data.toString();
    })
    req.on('end', function(){
      console.log("\n Pnjs file updated : ", req.session.login);
      quests.validatePnjs(obj);
    })
    res.send(200);
  }
  else{
    res.redirect('/404.html');
  }
});
app.use('/admin/editeur_de_maps/modifTransitions', function(req, res) {
  if(req.method == 'POST'){
    var obj = "";
    req.on('data', function(data){
      obj += data.toString();
    })
    req.on('end', function(){
      console.log("\n Transitions file updated : ", req.session.login);
      quests.validateTransitions(obj);
    })
    res.send(200);
  }
  else{
    res.redirect('/404.html');
  }
});

app.use('/admin/editeur_de_droits/searchById', function(req, res) {
  if(req.method == 'GET'){
    var search = req.param("search").trim(),
     ret = [];

    if(search.length > 0){
      var requete = "SELECT login, admin FROM campusnet.users WHERE login like '%"+search+"%';",
        connection = play.openConnectionBDD();

      connection.query(requete, function(err, rows, fields){
        if (err) throw err;
        res.send(rows);
      })
      connection.end();
    } else {
      res.send([]);
    }
  }
  else{
    res.redirect('/404.html');
  }
});

app.use('/admin/editeur_de_droits/getServices', function(req, res) {
  if(req.method == 'GET'){
    res.send(services);
  }
  else{
    res.redirect('/404.html');
  }
});

app.use('/admin/editeur_de_droits/sendNewServices', function (req, res) {
  if(req.method == 'POST'){
    var obj = "";
    req.on('data', function(data){
      obj += data.toString();
    })
    req.on('end', function(){
      var modif = JSON.parse(obj)
      console.log("\n Authorizations updated by", req.session.login, " : ", modif);
      for(var k in modif){
        if(typeof services[modif[k]] !== "undefined"){
          var requete = "UPDATE campusnet.users SET `admin`="+modif[k]+" WHERE `login`='"+k+"';",
            connection = play.openConnectionBDD();

          connection.query(requete, function(err, rows, fields){
            if (err) throw err;
          })
          connection.end();
        }
      }
      res.send(200);
    })
  }
  else{
    res.redirect('/404.html');
  }
});

app.use("/admin/editeur_de_droits/updateServices", function (req, res) {
  if(req.method == 'POST'){
    var obj = "";
    req.on('data', function(data){
      obj += data.toString();
    })
    req.on('end', function(){
      var modif = JSON.parse(obj)
      console.log("\n Services updated by", req.session.login, " : ", modif);
      fs.writeFile("./admin/editeur_de_droits/services.json", JSON.stringify(modif));
      services = modif;
      res.send(200);
    })
  }
  else{
    res.redirect('/404.html');
  }
});

app.use(function(req, res, next){
  res.redirect('/404.html');
});

io.use(function (socket, next) {
var sid = "";
  if(socket.request){
    if(socket.request.headers){
      if(socket.request.headers.cookie && (sid = cookie.parse(socket.request.headers.cookie)['express.sid'])){
        console.log("\n attempt to connect a new client");
        sid = sid.split(":")[1].split(".")[0];
      }
    }
  }

if(sid){
  sessionStore.get(sid, function (err, login) {
    if (err || !login) {
      console.log("\n connexion denied");
      next(new Error("ERR_CONN_DEN"));
    } else {
      if(isIn(login.login, loggedIn)){
        console.log("\n connexion denied, the client is already connected : ", login.login);
        next(new Error("ERR_CONN_ALR"));
      } else {
        loggedIn.push(login.login);
        // save the session data and accept the connection
        socket.login = login;
        next();
      }
    }
  });
} else {
  console.log("\n connexion denied");
  next(new Error("ERR_CONN_DEN"));
}
});


io.sockets.on( 'connection', function ( socket ) {
  console.log("\n new socket connexion : " + socket.login.login);
  var quetes = new quests.ClientQuest(socket.login.login, socket);
  sRequests.listenSocket(socket);
  socket.on('ready', function(data){
    data.login = socket.login.login;
    game.appendGuy(socket, data);
  });
  socket.on("disconnect", function() {
    var i;
    quetes = null;
    if((i = loggedIn.indexOf(socket.login.login)) >= 0){
      loggedIn.splice(i, 1);
      console.log(" \n client socket disconnected : ", socket.login.login);
    }
  });

} );

function isIn (el, tab) {
  for (var i = tab.length - 1; i >= 0; i--) {
    if(tab[i] == el)
      return true;
  };
  return false;
}
