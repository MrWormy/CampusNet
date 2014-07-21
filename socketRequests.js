var openConnectionBDD = require("./Game").openConnectionBDD,
  https = require("https"),
  icalParser = require("./ical-parser");

exports.listenSocket = function(socket){
  var login = socket.login.login;

  socket.on("setCalUrl", function(url){

  });

  socket.on("setBio", function(bio) {
    var connection = openConnectionBDD(),
      requete = "UPDATE `campusnet`.`users` SET `bio`='"+bio+"' WHERE `login`='"+login+"';";
    connection.query(requete, function(err, rows, fields) {
      if (err) throw err;
      console.log("\n " + login + "'s bio updated : ", bio);
    });
    connection.end();
  });

  socket.on("getBio", function() {
    var connection = openConnectionBDD(),
      requete = "SELECT `bio` FROM `campusnet`.`users` WHERE `login`='"+login+"';";
    connection.query(requete, function(err, rows, fields) {
      if (err) throw err;
      var bio = rows[0].bio;
      socket.emit("bio", bio);
    });
    connection.end();
  });

  socket.on("getCal", function () {
    var connection = openConnectionBDD(),
      url = /url=[^;\n]*;/,
      requete = "SELECT `bio` FROM `campusnet`.`users` WHERE `login`='"+login+"';";
    connection.query(requete, function(err, rows, fields) {
      if (err) throw err;
      var bio = rows[0].bio,
        cal = bio.match(url);

      if(cal){
        cal = cal[0];
      }
        /* récupérer le cal */
      if(cal){
        cal = cal.replace("url=https://webservices.int-evry.fr/agenda", "").replace(";","");

        var options = {
          hostname:"webservices.int-evry.fr",
          path: "/agenda"+cal,
          method: "GET",
          rejectUnauthorized: false };

        options.agent = new https.Agent(options);

        var req = https.request(options, function(res){
          console.log("\n Calendar requested by : ", login);
          console.log(" statusCode : ", res.statusCode);
          res.setEncoding('utf8');
          var donnees;
          res.on('data', function(data){
            donnees += data;
          });
          res.on('end', function(){
            if(res.statusCode == 200){
              var ret = treatCal(donnees);
              socket.emit("todayCalendar", ret);
            } else {
              socket.emit("todayCalendar", null);
            }
          })
        });
        req.on("error", function(e){
          console.log(e);
        });
        req.end();
      } else {
        socket.emit("todayCalendar", null);
      }
    });
    connection.end();
  })

  /*socket.on("setAvatar", function(avatar) {
    if (that.idBDD != null) {
      var requete = "UPDATE `campusnet`.`users` SET `avatar`="+avatar+" WHERE `id`="+idBDD+";";
      connection.query(requete, function(err, rows, fields) {
        if (err) throw err;
      });
    }
  });*/

  /*
  socket.on("setNom", function(nom) {
    if (that.idBDD != null) {
      var requete = "UPDATE `campusnet`.`users` SET `nom`="+nom+" WHERE `id`="+idBDD+";";
      connection.query(requete, function(err, rows, fields) {
        if (err) throw err;
      });
    }
  });

  socket.on("getNom", function(nom) {
    if (that.idBDD != null) {
      var requete = "SELECT `nom` FROM `campusnet`.`users` WHERE `id`="+that.idBDD+";";
      connection.query(requete, function(err, rows, fields) {
        if (err) throw err;
        socket.emit("nom", rows[0].nom);
      });
    } else {
      socket.emit("nom", "anonyme " + that.id);
    }
  });
  */
}

function treatCal (calstr) {
  var enCours = [], suivants = [], now = new Date(), //"May 26 2014 14:20:50 GMT+0200 (Paris, Madrid (heure d’été))" pour tester
    ical = {
      version:'',
      prodid:'',
      events:[],
      todos:[],
      journals:[],
      freebusys:[]
    };
  icalParser.parseIcal(ical, calstr);
  for(var k = 0, l = ical.events.length; k < l; k++){
    var tmpEv = ical.events[k],
      tStart = createDate(tmpEv.dtstart.value),
      tEnd = createDate(tmpEv.dtend.value);

    if(tEnd >= now && tStart <= now){
      enCours.push({
        location: tmpEv.location.value,
        summary: tmpEv.summary.value,
        start: tStart.toString(),
        end: tEnd.toString()
      });
    } else if(tStart > now && tStart.getFullYear() == now.getFullYear() && tStart.getMonth() == now.getMonth() && tStart.getDate() == now.getDate()){
      suivants.push({
        location: tmpEv.location.value,
        summary: tmpEv.summary.value,
        start: tStart.toString(),
        end: tEnd.toString()
      });
    }
  }
  return {enCours: enCours, suivants: suivants};
}

function createDate (dateStr){
  var d = null;
  if(dateStr.length == 8){
    d = new Date(dateStr.substr(0, 4),dateStr.substr(4, 2)-1,dateStr.substr(6, 2));
  } else if (dateStr.length == 15){
    d = new Date(dateStr.substr(0, 4),dateStr.substr(4, 2)-1,dateStr.substr(6, 2),dateStr.substr(9, 2),dateStr.substr(11, 2),dateStr.substr(13, 2));
  }
  d = (d == "Invalid Date") ? null : d;
  return d;
}
