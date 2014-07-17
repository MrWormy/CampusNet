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
    "bio": "Biographie : <br><br><textarea id=\"bio\" rows=\"10\" cols=\"50\"></textarea><br><input id=\"sendBio\" type=\"button\" value=\"Enregistrer\"/><input id=\"cal\" type=\"button\" value=\"Emploi du temps\"/><br><br>",
    "avatar": "Avatar :<br><img src=\"assets/resources/img/select/etu-m/brown-blue.png\"><br><br></div>",
    "curQ": [],
    "endedQ": [],
    "curMap": 0
  },

  newQ: function (newQ, init) {
    var curQ = "", endedQ = "", ret = "";
    for (var i = 0; i < newQ.length; i++) {
      var tempQ = newQ[i];
      switch(tempQ.type){
        case 1:
          this.get("curQ").push(tempQ.name);
          if(!init){
            setTimeout(function(){
            App.views.drawings.displayQ(true, tempQ.name);}, 3000);
          }
          break;
        case 2:
          this.get("endedQ").push(tempQ.name);
          break;
        case 3:
          var curQt = this.get("curQ");
          for (var j = curQt.length - 1; j >= 0; j--) {
            if(curQt[j] == tempQ.name){
              curQt.splice(j, 1);
              break;
            }
          };
          this.get("endedQ").push(tempQ.name);
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
      curQ += this.get("curQ")[i];
      curQ += "<br />";
    };
    for (var j = this.get("endedQ").length - 1; j >= 0; j--) {
      endedQ += this.get("endedQ")[j];
      endedQ += "<br />";
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
    this.listenTo(app, 'close:info', function(){
      this.ind = -1;
      this.closeInfo();});
    App.socket.on("newQuests", function(data){
      that.model.newQ(data.data, data.init);
    });
    App.socket.on("bio", function(data){
      that.loadBio(data);
    });
    App.socket.on("todayCalendar", this.displayCal);
    App.socket.emit("getBio");
    document.getElementById("infoBox").onclick = function(e){
      that.sendBio(e, that);
    }
    this.model.set("carte", this.createInteractiveMap());
  },

  navAction: function (e){
    var title = "<h1> - " + e.target.title + " - </h1>",
      infoBox = $("#infoBox");
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
          var width = infoBox.css("width").slice(0,-2),
            height = infoBox.css('height').slice(0,-2);
          infoBox.append(this.model.get("carte"));
          $('#imgmap').css({
            'width' : width + 'px'
          });
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
      var bio = document.getElementById("bio");
      if(bio){
        that.model.set("bio", "Biographie : <br><br><textarea id=\"bio\" rows=\"10\" cols=\"50\">"+bio.value+"</textarea><br><input id=\"sendBio\" type=\"button\" value=\"Enregistrer\"/><input id=\"cal\" type=\"button\" value=\"Emploi du temps\"/><br><br>");
        App.socket.emit("setBio", bio.value);
      }
    } else if (e.target.id == "cal"){
      App.socket.emit("getCal");
    }
  },

  displayCal: function (cal) {
    var calD = document.getElementById("infoBox");
    if(cal){
      calD.innerHTML = "<br>Vous avez des cours aujourd'hui : <br>" + JSON.stringify(cal);
    } else {
      calD.innerHTML = "<br>Veuillez saisir une url de calendrier valide : <br> zimbra -> calendrier -> cours -> propriétés -> copier l'url en remplaçant %26 par & ";
    }
  },

  loadBio: function (bio) {
    this.model.set("bio", "Biographie : <br><br><textarea id=\"bio\" rows=\"10\" cols=\"50\">"+bio+"</textarea><br><input id=\"sendBio\" type=\"button\" value=\"Enregistrer\"/><input id=\"cal\" type=\"button\" value=\"Emploi du temps\"/><br><br>")
  },

  loadPerso: function (name, skin) {
    var uri = skin.substr(0, 5).concat("/").concat(skin.substring(6, skin.length));
    this.model.set({
      name: "<div class=\"info\"> Pseudo : " + name + "<br><br>",
      avatar: "Avatar :<br><img src=\"assets/resources/img/select/" + uri + "\"><br><br></div>"
    });
  },

  createInteractiveMap: function () {
    var map = document.createElement("canvas"),
      stage = new createjs.Stage(map),
      mapCont = new createjs.Container(),
      infoCont = new createjs.Container(),
      eMap = null;

    mapCont.name = "map";
    stage.addChild(mapCont);
    stage.addChild(infoCont);
    stage.enableMouseOver(10);
    map.id = "imgmap";
    this.initMap(mapCont, this.resizeMap, map, stage);
    this.listenTo(app, "numMap", function(numMap){
      this.model.set("curMap", numMap);
      this.displayOwnMap(infoCont, mapCont);
    });

    return map;
  },

  displayOwnMap: function(cont, map){
    var info = cont.getChildByName("ownMap"),
      layer = map.getChildByName(App.models.transitions.get("mapsName")[this.model.get("curMap")]);

    console.log(App.models.transitions.get("mapsName")[this.model.get("curMap")], map);

    if(!info){
      info = new createjs.Bitmap("assets/resources/img/select/etu-m/blond-blue.png");
      info.name = "ownMap";
      cont.addChild(info);
    }

    if(!layer){
      layer = {baryCenter: {i: 31, j: 52}};
    }
    info.x = layer.baryCenter.j * App.tw;
    info.y = layer.baryCenter.i * App.tw;
  },

  initMap: function (map, callback, arg, stage) {
    var that = this,
      eMaps = new App.Collections.ExterieurMaps(),
      eMap = new App.Models.ExterieurMap();

    eMaps.add(eMap);
    eMaps.fetch({
      success: function (coll, mod, cal) {
        that.fillMap(map, mod);
        that.displayOwnMap(map.parent.getChildAt(1), map);
        callback(arg, mod);
        stage.update();
      },
      error: function (err) {
        map = "il y a eu des erreur lors du chargement de la carte";
      }
    });
  },

  resizeMap: function (map, model) {
    $('#navbar').css("display", "block");
    map.width = model.tilewidth * model.width;
    map.height = model.tileheight * model.height;
  },

  fillMap: function (map, model) {
    var that = this;
    model.layers.forEach(function(layer){
      that.fillLayer.call(this, layer, that);
    }, map);

    /*cache map*/
    //map.cache(0, 0, model.width * model.tilewidth, model.height * model.tileheight);
  },

  fillLayer: function (layer, view) {
    var layerName = layer.name.split("_")[0] || "floor",
      spriteSheet = App.spriteSheet,
      tiles = layer.data,
      nbl = layer.height,
      nbc = layer.width,
      tw = App.tw,
      layerCont = this.getChildByName(layerName);

    if(layerCont == null){
      layerCont = view.initLayer(layerName);
      this.addChild(layerCont);
    }

    for(var i = 0; i < nbl; i++){
      for(var j = 0; j < nbc; j++){
        var sprite = new createjs.Sprite(spriteSheet),
          tile = tiles[i*nbc + j];

        if(tile > 0){
          var baryCenter = layerCont.baryCenter;
          sprite.x = j * tw;
          sprite.y = i * tw;
          sprite.gotoAndStop(tile - 1);
          baryCenter.n++;
          baryCenter.i = ( baryCenter.i * (baryCenter.n - 1) + i ) / baryCenter.n;
          baryCenter.j = ( baryCenter.j * (baryCenter.n - 1) + j ) / baryCenter.n;
          layerCont.addChild(sprite);
        }
      }
    }
  },

  initLayer: function (name) {
    var layer = new createjs.Container();
    layer.name = name;
    layer.baryCenter = {n: 0, i: 0, j: 0};
    layer.on("mouseover", this.onLayer, this);
    layer.on("mouseout", this.outLayer, this);
    return layer;
  },

  onLayer: function (e) {
    var layer = e.currentTarget;

    this.displayLayerName(layer);
  },

  outLayer: function (e) {
    var layer = e.currentTarget,
      stage = layer.parent.parent,
      infoCont = stage.getChildAt(1);

    this.removeLayerName(infoCont);
  },

  displayLayerName: function (layer) {
    var stage = layer.parent.parent,
      text = null,
      infoCont = stage.getChildAt(1);

    this.removeLayerName(infoCont);
    text = this.constructName(layer);
    if(text != null){
      infoCont.addChild(text);
    }
    stage.update();
  },

  removeLayerName: function (cont) {
    var layerName = cont.getChildByName("layerName");

    if(layerName){
      cont.removeChild(layerName);
    }
  },

  constructName: function (layer) {
    var name = layer.name,
      canvas = document.getElementById("imgmap"),
      text = null,
      ratio = 0,
      size = 0,
      baryCenter = layer.baryCenter;

    if(canvas){
      ratio = canvas.width / parseInt(canvas.style.width.split("px")[0]);
      size = 30*ratio;
    }

    if(!(name == "objects" || name == "floor" || name == "wall" || name == "map-transition")){
      text = new createjs.Text(name, size+"px Arial", "#000000");
      text.name = "layerName";
      text.x = baryCenter.j * App.tw - text.getMeasuredWidth( )/2;
      text.y = baryCenter.i * App.tw - text.getMeasuredHeight( )/2 - App.tw;
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

