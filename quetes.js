var quetes = require('./admin/editeur_de_quetes/quetes.json'),
  pnjs = require("./assets/resources/pnj.json"),
  fs = require("node-fs"),
  pnjsQ = [],
  openConnectionBDD = require("./Game").openConnectionBDD;

var quests = exports = module.exports = {};

pnjsQ = fillPnjsQ(quetes);

quests.ClientQuest = function (login, socket) {
  var that = this;
  this.login = login;
  this.QenCours = [];
  this.Qterminees = [];
  this.idBDD = -1;

  var reqGetId = "SELECT `id` FROM `campusnet`.`users` WHERE `login` = \'"+login+"\';",
   connection = openConnectionBDD();

  connection.query(reqGetId, function(err, row, fields) {
    if (err) throw err;
    if(!(row[0] && typeof(row[0].id) != "undefined")){
      socket.disconnect();
      return 0;
    }
    that.idBDD = row[0].id;
    console.log("\n idBDD : ", that.idBDD);
    var requete = "SELECT `id_quest` FROM `campusnet`.`quests` WHERE `id_user` = "+that.idBDD+" ;",
      connec = openConnectionBDD();
    connec.query(requete, function(err, rows, fields) {
      if (err) throw err;
      for(var i = 0; i < rows.length; i++){
       var tempQ = rows[i].id_quest;
       if(tempQ - 1000 >= 0)
         that.QenCours.push(tempQ - 1000);
       else
         that.Qterminees.push(tempQ);
       }

       /* on envoie toutes les quetes au client */
       var sendQ = [];
       for(var k = 0; k < that.QenCours.length; k++){
        var name = that.getQName(that.QenCours[k]);
        if(name)
          sendQ.push({"type": 1, "name": name});
       }

       for(var k = 0; k < that.Qterminees.length; k++){
        var name = that.getQName(that.Qterminees[k]);
        if(name)
          sendQ.push({"type": 2, "name": name});
       }
       socket.on("waitQ", function(){
         socket.emit("newQuests", {"data": sendQ, "init": true});
       });
       console.log("\n sending quests : ", sendQ, " to client : ", that.login);

       console.log("\n quests loaded : \n QenCours : ", that.QenCours, "\n Qterminees : ", that.Qterminees);
       socket.on("parler_pnj", function(idPnj){
         var ret = that.treatQ(idPnj, that, socket),
          name = null;
         that.updateQ(ret);
         if(ret.type > 0 && ret.type < 4){
         /* on revoie ret au client (avec nom de la quête) */
         name = that.getQName(ret.idQ);
           if(name){
            socket.emit("newQuests", {"data": [{"type": ret.type, "name": name}], "init": false});
           }
         }
       });
     });
     connec.end();
  });
  connection.end();

  this.checkEndQ = function(Quest){
    var bool = true
    for(var i = 0; i<Quest.QneededToEnd.length; i++){
      if(!isIn(Quest.QneededToEnd[i], this.Qterminees)){
        bool = false;
        break;
      }
    }
    return bool;
  }

  this.endQ = function(qId){
    for(var i = 0; i<this.QenCours.length; i++){
      if(this.QenCours[i] == qId){
        this.QenCours.splice(i, 1);
      }
    }
  }

  this.getQName = function (qId) {
    var ret = null;
    for (var i = quetes.length - 1; i >= 0; i--) {
      if(quetes[i].id == qId){
        ret = quetes[i].nameQ;
        break;
      }
    };
    return ret;
  }
};

quests.ClientQuest.prototype.updateQ = function (ret) {
  var connection = openConnectionBDD(),
    requete = "";
  switch(ret.type){
    case 0:
      break;
    case 1:
      requete = "INSERT INTO `campusnet`.`quests` (`id_user`, `id_quest`) VALUES ("+this.idBDD+", \'"+(ret.idQ + 1000)+"\');";
      connection.query(requete, function(err, rows, fields) {
        if (err) throw err;
      });
      console.log("\n new quest in progress : ", ret.idQ, " ", this.login);
      break;
    case 2:
      requete = "INSERT INTO `campusnet`.`quests` (`id_user`, `id_quest`) VALUES ("+this.idBDD+", \'"+(ret.idQ)+"\');";
      connection.query(requete, function(err, rows, fields) {
        if (err) throw err;
      });
      console.log("\n quest ended : ", ret.idQ, " ", this.login);
      break;
    case 3:
      requete = "INSERT INTO `campusnet`.`quests` (`id_user`, `id_quest`) VALUES ("+this.idBDD+", \'"+(ret.idQ)+"\');";
      connection.query(requete, function(err, rows, fields) {
        if (err) throw err;
      });
      requete = "DELETE FROM `campusnet`.`quests` WHERE `quests`.`id_user` = "+this.idBDD+" AND `quests`.`id_quest` = "+(ret.idQ + 1000)+";";
      connection.query(requete, function(err, rows, fields) {
        if (err) throw err;
      });
      console.log("\n quest ended and quest in progress deleted : ", ret.idQ, " ", this.login);
      break;
    default:
      break;
  }
  connection.end();
};

quests.ClientQuest.prototype.treatQ = function (idPnj, that, socket) {
  var dial = "default",
    ret = {"type": 0, "idQ": -1},
    idSpeaker = idPnj;
  if(typeof(idPnj) == "number" && (0 <= idPnj) && (idPnj < pnjs.length)){
    var pnjQ = pnjsQ[idPnj] || [];
    for(var i = 0; i < pnjQ.length; i++){
      var curQ = quetes[pnjQ[i]];
      ret.idQ = curQ.id;
      if(idPnj == curQ.idPnj){
        if(isIn(curQ.id, that.QenCours)){
          var bool = that.checkEndQ(curQ);
          idSpeaker = curQ.speaker;
          if(bool){
            that.endQ(curQ.id);
            that.Qterminees.push(curQ.id);
            dial = curQ.dialEnd;
            ret.type = 3;
            break;
          }
          else {
            dial = curQ.dialQ;
            break;
          }
        }
        else if(isIn(curQ.id, that.Qterminees)) {
          idSpeaker = curQ.speaker;
          dial = curQ.dialEnded;
        }
        else {
          var bool = true;
          for(var j = 0; j < curQ.QEforDispo.length; j++){
            if(!isIn(curQ.QEforDispo[j], that.Qterminees)){
              bool = false;
              break;
            }
          }
          if(bool){
            for(var j = 0; j < curQ.QCforDispo.length; j++){
              if(!isIn(curQ.QCforDispo[j], that.QenCours)){
                bool = false;
                break;
              }
            }
          }
          if(bool){
            var bool2 = that.checkEndQ(curQ);
            idSpeaker = curQ.speaker;
            if(bool2) {
              that.Qterminees.push(curQ.id);
              dial = curQ.dialEnd;
              ret.type = 2;
              break;
            }
            else {
              that.QenCours.push(curQ.id);
              dial = curQ.dialInit;
              ret.type = 1;
              break;
            }
          }
        }
      }
    }
    socket.emit("reponse_pnj", {"id":idSpeaker, "texte":dial});
  }
  return ret;
}

quests.validate = function(newQuestsStr){
  var newQ = JSON.parse(newQuestsStr),
    rigthQ = [],
    qIds = [],
    pnjIds = [];

  for(var i = 0; i < pnjs.length; i++){
    pnjIds.push(pnjs[i].id);
  }

  newQ.forEach(fillRQ);

  for(var j = 0; j < rigthQ.length; j++){
    qIds.push(rigthQ[j].id);
  }

  rigthQ.forEach(testRQ);

  quetes = rigthQ;
  pnjsQ = fillPnjsQ(rigthQ);

  fs.writeFile("./admin/editeur_de_quetes/quetes.json", JSON.stringify(rigthQ));

  function fillRQ(q, key, obj){
    if(pnjIds.indexOf(q.idPnj) >=  0 && pnjIds.indexOf(q.speaker) >= 0){
      rigthQ.push(q);
    }
  };

  function testRQ(q, key, obj){
    q.QEforDispo = testQList(q.QEforDispo, q.id);
    q.QCforDispo = testQList(q.QCforDispo, q.id);
    q.QneededToEnd = testQList(q.QneededToEnd, q.id);
  };

  function testQList(list, id){
    var tempL = [];
    for(var i = 0; i < list.length; i++){
      var q = list[i];
      if(qIds.indexOf(q) >= 0 && q!=id){
        tempL.push(q);
      }
    }
    return tempL;
  };
};

quests.validatePnjs = function (newPnjsString) {
  var newPnjs = JSON.parse(newPnjsString);

  /* validate here */

  pnjs = newPnjs;
  fs.writeFile("./assets/resources/pnj.json", JSON.stringify(newPnjs));
};

quests.validateTransitions = function (newTrsString) {
  var newTrs = JSON.parse(newTrsString);

  /* validate here */

  fs.writeFile("./assets/resources/map/transitions.json", JSON.stringify(newTrs));
};


function isIn (el, list) {
  var bool = false;
  for (var i = list.length - 1; i >= 0; i--) {
    if(list[i] == el){
      bool = true;
      break;
    }
  };
  return bool;
}

function fillPnjsQ (quetes){
  var ret = []
  for(var i = 0, l = quetes.length; i < l; i++){
    var curQ = quetes[i],
      pnjQ = ret[curQ.idPnj];
    if(pnjQ)
      ret[curQ.idPnj].push(i);
    else
      ret[curQ.idPnj] = [i];
  }
  return ret;
}

quests.getPannels = function (serv) {
  var res = [];
  for(var i = 0, l = pnjs.length; i < l; i++){
    var pnj = pnjs[i];

    if(pnj.service && pnj.service == serv && pnj.object){
      res.push(pnj);
    }
  }
  return res;
};
