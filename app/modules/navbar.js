App.Models.Navbar = Backbone.Model.extend({
  defaults: {
    "quetes": "",
    "discussion": "",
    "carte": "",
    "son": '<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>',
    "param": '<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>',
    "aide": '<div class="info">Bienvenue sur Campusnet v2.<br><br>Bientôt vous pourrez trouvez l\'aide pour le jeu ici.<br><br>Crédits:<br><br>Campusnet v2 a été développé par Nicolas Benning, Thomas Laurence, Bilgé Kimyonok et Benoît Koenig.</div>',
    "quit": "",
    "name": "<div class=\"info\"> Pseudo : Inconnu<br><br>",
    "bio": "Biographie : <br><br><textarea id=\"bio\" rows=\"10\" cols=\"50\"></textarea><div>Calendrier : <input id=\"urlCal\" type=\"text\" size=\"46\"><br><input id=\"sendBio\" type=\"button\" value=\"Enregistrer\"><input id=\"cal\" type=\"button\" value=\"Emploi du temps\"></div><br><br>",
    "avatar": "Avatar :<br><img src=\"assets/resources/img/select/etu-m/brown-blue.png\"><br><br></div>",
    "curQ": [],
    "endedQ": [],
    "layers": {},
    "curMap": 0
  },

  newQ: function (newQ, init) {
    var curQ = "", endedQ = "", ret = "";
    for (var i = 0; i < newQ.length; i++) {
      var tempQ = newQ[i];
      switch(tempQ.type){
        case 1:
          this.get("curQ").push(tempQ);
          if(!init){
            setTimeout(function(){
            App.views.drawings.displayQ(true, tempQ.name);}, 3000);
          }
          break;
        case 2:
          this.get("endedQ").push(tempQ);
          break;
        case 3:
          var curQt = this.get("curQ");
          for (var j = curQt.length - 1; j >= 0; j--) {
            if(curQt[j].name == tempQ.name){
              curQt.splice(j, 1);
              break;
            }
          };
          this.get("endedQ").push(tempQ);
          if(!init){
            setTimeout(function(){
            App.views.drawings.displayQ(false, tempQ.name);}, 3000);
          }
          break;
        default:
          break;
      }
    };
    for (var i = this.get("curQ").length - 1; i >= 0; i--) {
      curQ += this.get("curQ")[i].name;
      curQ += "<br />";
    };
    for (var j = this.get("endedQ").length - 1; j >= 0; j--) {
      if(this.get("endedQ")[j].type == 3){
        endedQ += this.get("endedQ")[j].name;
        endedQ += "<br />";
      }
    };
    ret = "<div class='info'><h2> Quêtes en cours </h2>"+curQ+"<br /><h2> Quêtes terminées </h2>"+endedQ+"</div>";
    this.set("quetes", ret);
  }
});

App.Views.Navbar = Backbone.View.extend( /** @lends module:navbar.Navbar.prototype */ {

  el: '#navbar',

  events: {
    "click": "navAction"
  },

  /**
  * @augments Backbone.View
  * @constructs
  */
  initialize: function ( ) {
    var that = this;
    this.ind = -1;
    this.timer = new Date().getTime();
    this.listenTo(app, 'close:info', function(){
      this.ind = -1;
      this.clearMapInfos();
      this.closeInfo();});
    this.listenTo(app, "showOnMap", function(input){
      that.showOnMap(input);
    });
    App.socket.emit("waitQ");
    App.socket.on("newQuests", function(data){
      that.model.newQ(data.data, data.init);
    });
    App.socket.on("bio", function(data){
      var urlCal = data.match(/url=[^;\n]*;/);

      if(urlCal && urlCal[0]){
        data = data.replace(urlCal, "");
        urlCal = urlCal[0].replace("url=","").replace(";","");
      } else {
        urlCal = "";
      }

      that.loadBio(data, urlCal);
    });
    App.socket.on("todayCalendar", function(cal){
      that.displayCal(cal)
    });
    App.socket.emit("getBio");
    document.getElementById("infoBox").onclick = function(e){
      that.sendBio(e, that);
    }
    this.model.set("carte", this.createInteractiveMap());
  },

  navAction: function (e){
    var title = "<h1> - " + e.target.title + " - </h1>",
      infoBox = $("#infoBox");
      this.clearMapInfos();
    switch(e.target.id){
      case "quetes" :
        if(this.ind != 1){
          this.ind = 1
          infoBox.html(title);
          infoBox.append(this.model.get("quetes"));
        } else this.ind = -1;
        break;
      case "discussion" :
        if(this.ind != 2){
          this.ind = 2;
          infoBox.html(title);
        } else this.ind = -1
        break;
      case "carte" :
        if(this.ind != 3){
          this.ind = 3;
          infoBox.html(title);
          infoBox.append(this.model.get("carte"));
          var mapCan = document.getElementById("imgmap"),
            width = infoBox.css("width").slice(0,-2),
            height = infoBox.css('height').slice(0,-2);
          mapCan.style.width = Math.min(mapCan.width, width) + "px";
          this.displayOwnMap();
        } else this.ind = -1;
        break;
      case "profil" :
        if(this.ind != 4){
          this.ind = 4;
          infoBox.html(title);
          infoBox.append(this.model.get("name") + this.model.get("bio") + this.model.get("avatar"));
        } else this.ind = -1;
        break;
      case "son" :
        if(this.ind != 5){
          this.ind = 5;
          infoBox.html(title);
          infoBox.append(this.model.get("son"));
        } else this.ind = -1;
        break;
      case "aide" :
        if(this.ind != 6){
          this.ind = 6;
          infoBox.html(title);
          infoBox.append(this.model.get("aide"));
        } else this.ind = -1;
        break;
      case "param" :
        // param option must be still implemented since people could change their skin, def, ...
        // if(this.ind != 3){
        //   this.ind = 3;
        //   infoBox.html(title);
        //   infoBox.append('<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>');
        // } else this.ind = -1;
        if (!document.mozFullScreen && !document.webkitIsFullScreen && !document.msFullscreenElement) {
          if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
          } else if(document.documentElement.webkitRequestFullScreen) {
            document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
          } else if(document.documentElement.msRequestFullscreen){
            document.documentElement.msRequestFullscreen();
          }
        } else {
          if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
          } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
          } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
          }
        }
        break;
      case "quit" :
        this.ind = -1;
        break;
      default:
        this.ind = -1;
        break;
    }
    if(this.ind > 0){
      infoBox.css({'display' : 'block'});
    } else {
      this.closeInfo();
    }
  },

  closeInfo: function (){
    $("#infoBox").css({'display' : 'none'});
    $("#infoBox").html("");
  },

  sendBio: function (e, that) {
    if(e.target.id == "sendBio"){
      var bio = document.getElementById("bio"),
        urlCal = document.getElementById("urlCal");
      if(bio && urlCal){
        bio.value = bio.value.trim();
        that.model.set("bio", "Biographie : <br><br><textarea id=\"bio\" rows=\"10\" cols=\"50\">"+bio.value+"</textarea><div>Calendrier : <input id=\"urlCal\" value=\""+urlCal.value+"\" type=\"text\" size=\"46\"><br><input id=\"sendBio\" type=\"button\" value=\"Enregistrer\"><input id=\"cal\" type=\"button\" value=\"Emploi du temps\"></div><br><br>");
        App.socket.emit("setBio", bio.value+" url="+urlCal.value+";");
      }
    } else if (e.target.id == "cal"){
      App.socket.emit("getCal");
    }
  },

  displayCal: function (cal) {
    var calD = document.getElementById("infoBox");
    if(cal){
      var display = this.renderingCal(cal);
      calD.innerHTML = display;
    } else {
      calD.innerHTML = "<br>Veuillez saisir une url de calendrier valide : <br> zimbra -> calendrier -> cours -> propriétés -> copier l'url en remplaçant %26 par & ";
    }
  },

  renderingCal: function (cal) {
    var ret = "";

    ret += "<h2>En cours</h2>"
    for(var i = 0, l = cal.enCours.length; i < l; i++){
      ret += this.displayEvent(cal.enCours[i]);
    };
    ret += "<h2>A venir</h2>"
    for(var i = 0, l = cal.suivants.length; i < l; i++){
      ret += this.displayEvent(cal.suivants[i]);
    };

    return ret;
  },

  displayEvent: function (temp) {
      var ret = "",
        start = new Date(temp.start),
        end = new Date(temp.end),
        building = this.getBuilding(temp.location);
      ret+="contenu : " + temp.summary + "<br />";
      ret+="début : " + this.getFhour(start) + "<br />";
      ret+="fin : " + this.getFhour(end) + "<br />";
      ret+="salle : " + temp.location;
      if(building){
        var onclickF = this.writeOnClick();
        ret += "<input type=\"button\" class=\"showOnMap\" onclick=\""+onclickF+"\" name=\""+building+"\" value=\"Voir sur la carte\"><br /><br />";
      } else {
        ret+="<br /><br />";
      }
      return ret
  },

  writeOnClick: function () {
    return "app.trigger(\'showOnMap\', this)";
  },

  showOnMap: function (input) {
    $("#carte").click();
    this.displayOwnMap(input.name, "pointOnMap", "#2593e5");
    //this.displayLayerName(input.name, "showOnMap");
  },

  getFhour: function (date) {
    return date.getHours() + "h" + ((date.getMinutes() > 9) ? date.getMinutes() : ("0" + date.getMinutes()));
  },

  getBuilding: function (str) {
    var building = null,
      batiment = /^(A|B|C|D|E|F|G)/,
      amphis = /^(AMPHI 10|AMPHI 11)/i,
      autres = /^(BL|SSP)/i,
      bat = str.match(batiment),
      am = str.match(amphis),
      a = str.match(autres);

      if(bat){
        building = "bâtiment " + bat[0];
      }
      if(am){
        building = am[0].toLowerCase();
      }
      if(a){
        building = a[0];
      }

      return building;
  },

  loadBio: function (bio, url) {
    this.model.set("bio", "Biographie : <br><br><textarea id=\"bio\" rows=\"10\" cols=\"50\">"+bio+"</textarea><div>Calendrier : <input id=\"urlCal\" type=\"text\" size=\"46\" value=\""+url+"\"><br><input id=\"sendBio\" type=\"button\" value=\"Enregistrer\"><input id=\"cal\" type=\"button\" value=\"Emploi du temps\"></div><br><br>")
  },

  loadPerso: function (name, skin) {
    var uri = skin.substr(0, 5).concat("/").concat(skin.substring(6, skin.length));
    this.model.set({
      name: "<div class=\"info\"> Pseudo : " + name + "<br><br>",
      avatar: "Avatar :<br><img src=\"assets/resources/img/select/" + uri + "\"><br><br></div>"
    });
  },

  createInteractiveMap: function () {
    var that = this,
      map = document.createElement("canvas"),
      stage = new createjs.Stage(map),
      infoCont = new createjs.Container(),
      eMap = null;

    this.model.set("stage", stage);
    stage.addChild(infoCont);
    map.id = "imgmap";
    this.initMap(this.resizeMap, map, stage);
    this.listenTo(app, "numMap", function(numMap){
      this.model.set("curMap", numMap);
    });

    map.onmousemove = function(e){
      var curT = new Date().getTime();
      if(curT - that.timer > 30){
        that.onLayer(e, this);
        that.timer = curT;
      }
    };

    //stage.on("stagemousemove", this.onLayer, this);

    return map;
  },

  displayOwnMap: function(layName, cName, pColor){
    var cont =  this.model.get("stage").getChildAt(0),
      contName = (typeof cName !== "undefined") ? cName : "ownMap",
      color = (typeof pColor !== "undefined") ? pColor : "#ee0000",
      info = cont.getChildByName(contName),
      layerName = (typeof layName !== "undefined") ? layName : App.models.transitions.get("mapsName")[this.model.get("curMap")],
      layers = this.model.get("layers"),
      bats = / [A-G]/,
      autres = / (SSP|BL)/i;
      layer = null;

    if(layerName != "exterieur" && !(layerName in layers)){
      for(var k in layers){
        if(layerName.indexOf(k) >= 0){
          layerName = k;
          break;
        } else {
          var ba = layerName.match(bats),
            a = layerName.match(autres);

          if(ba){
            layerName = "bâtiment" + ba[0];
            break;
          }
          if(a){
            layerName = a[0].trim();
            break;
          }
        }
      }
    }

    layer = layers[layerName];

    if(!info){
      info = this.createPosMarker(color);
      info.name = contName;
      cont.addChild(info);
    }

    if(!layer){
      console.log("map inconnue");
      return false;
    }

    if(layerName == "exterieur"){
      var temp = App.models.myself.get("currentPos");
      info.x = temp.j * (App.tw / 4);
      info.y = temp.i * (App.tw / 4);
    } else {
      info.x = layer.baryCenter.j * (App.tw / 4);
      info.y = layer.baryCenter.i * (App.tw / 4);
    }

    this.model.get("stage").update();
  },

  createPosMarker: function (color) {
    var map = document.getElementById("imgmap"),
      ratio = map.width / parseInt(map.style.width.split("px")[0]),
      cont = new createjs.Container(),
      g = new createjs.Graphics();

    g.beginFill(color);
    g.setStrokeStyle(2*ratio,"round").beginStroke("#ffffff");
    g.moveTo(0,0);
    g.lineTo(-ratio * 8, - ratio * 20);
    g.arc(0,-ratio * 20,ratio * 8,Math.PI, 2*Math.PI);
    g.lineTo(0,0)
    g.endStroke();
    g.endFill();

    var s = new createjs.Shape(g);
    s.x = (App.tw / 4)/2;
    s.y = (App.tw / 4)/2;
    cont.addChild(s);

    return cont;

  },

  initMap: function (callback, arg, stage) {
    var that = this,
      eMaps = new App.Collections.ExterieurMaps(),
      eMap = new App.Models.ExterieurMap();

    eMaps.add(eMap);
    eMaps.fetch({
      success: function (coll, mod, cal) {
        that.fillMap(mod);
        callback(arg, mod);
        stage.update();
      },
      error: function (err) {
        arg = "il y a eu des erreur lors du chargement de la carte";
      }
    });
  },

  resizeMap: function (map, mod) {
    map.style.backgroundImage = "url(assets/resources/map/exterieurMap.png)";
    map.style.backgroundSize = "100%";
    map.width = mod.width * mod.tilewidth / 4;
    map.height = mod.height * mod.tileheight / 4;
  },

  fillMap: function (model) {
    var that = this;
    this.model.get("layers").height = model.height;
    this.model.get("layers").width = model.width;

    model.layers.forEach(function(layer){
      that.fillLayer.call(this, layer, that);
    }, this.model);
  },

  fillLayer: function (layer, view) {
    var layerName = layer.name.split("_")[0] || "exterieur",
      tiles = layer.data,
      nbl = layer.height,
      nbc = layer.width,
      tw = (App.tw / 4),
      layerCont = this.get("layers")[layerName];

    if(!layerCont){
      layerCont = view.initLayer();
      this.get("layers")[layerName] = layerCont;
    }

    for(var i = 0; i < nbl; i++){
      for(var j = 0; j < nbc; j++){
          k = i*nbc + j,
          tile = tiles[k];

        if(tile > 0){
          var baryCenter = layerCont.baryCenter;
          baryCenter.n++;
          baryCenter.i = ( baryCenter.i * (baryCenter.n - 1) + i ) / baryCenter.n;
          baryCenter.j = ( baryCenter.j * (baryCenter.n - 1) + j ) / baryCenter.n;
          layerCont.tiles.push(k);
        }
      }
    }
  },

  initLayer: function () {
    var layer = {};
    layer.baryCenter = {n: 0, i: 0, j: 0};
    layer.tiles = [];
    return layer;
  },

  clearMapInfos: function () {
    var stage = this.model.get("stage");

    if(stage){
      stage.getChildAt(0).removeAllChildren();
      stage.update();
    }
  },

  onLayer: function (e) {
    var map = document.getElementById("imgmap"),
      ratio = map.width / parseInt(map.style.width.split("px")[0]),
      i = 0,
      j = 0;

    if("layerX" in e){
      i = Math.floor(e.layerY * ratio / (App.tw / 4));
      j = Math.floor(e.layerX * ratio / (App.tw / 4));
    }
    /* IE < 9 and opera compatibility */
    else if("x" in e){
      i = Math.floor(e.y * ratio / (App.tw / 4));
      j = Math.floor(e.x * ratio / (App.tw / 4));
    }

    this.treatMouseOn(i * this.model.get("layers").width + j);
  },

  treatMouseOn: function (key) {
    var layers = this.model.get("layers"),
      name = "exterieur";

    for(var k in layers){
      var tiles = layers[k].tiles;
      if(tiles){
        var i = tiles.indexOf(key)
        if(i >= 0){
          name = k;
          if(name != "exterieur")
            break;
        }
      }
    }

    this.displayLayerName(name, "ownPos");
  },

  outLayer: function (e) {

    var layer = e.currentTarget,
      stage = layer.parent.parent,
      infoCont = stage.getChildAt(0);

    this.removeLayerName(infoCont);
  },

  displayLayerName: function (layerName, name) {
    var stage = this.model.get("stage"),
      infoCont = stage.getChildAt(0),
      text = infoCont.getChildByName(name);

    if(text){
      if(layerName == "exterieur"){
        infoCont.removeChild(text);
      } else {
        if(text.text == layerName){
          return;
        } else {
          infoCont.removeChild(text);
          text = this.constructName(layerName, name);
          if(text != null){
            infoCont.addChild(text);
          }
        }
      }
    } else {
      text = this.constructName(layerName, name);
      if(text != null){
        infoCont.addChild(text);
      }
    }

    stage.update();
  },

  constructName: function (layerName, textName) {
    var layer = this.model.get("layers")[layerName],
      canvas = document.getElementById("imgmap"),
      text = null,
      ratio = 0,
      size = 0,
      baryCenter = null;

    if(layer && layer.baryCenter && layerName != "exterieur"){
      baryCenter = layer.baryCenter;
      if(canvas){
        ratio = canvas.width / parseInt(canvas.style.width.split("px")[0]);
        size = Math.floor(30*ratio);
      }

      text = new createjs.Text(layerName, size+"px Arial", "#000000");
      text.name = textName;
      text.x = baryCenter.j * (App.tw / 4) - text.getMeasuredWidth( )/2;
      text.y = baryCenter.i * (App.tw / 4) - text.getMeasuredHeight( )/2 - (App.tw / 4);
    }

    return text;
  }

});

App.Models.ExterieurMap = Backbone.Model.extend({
  defaults:{
    id: 1
  }
});

App.Collections.ExterieurMaps = Backbone.Collection.extend( /** @lends module:map~Maps.prototype */ {
  url: 'assets/resources/map/exterieurMap.json',
  model: App.Models.ExterieurMap
} );

