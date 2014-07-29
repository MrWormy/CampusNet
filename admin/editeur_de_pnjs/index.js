/**
  * Pnjs editor
  * Structure globale de l'application
  * Global application structure
  * Upper cases are for the classes, lower cases, for the intstances.
**/
var App = {
  Models: {},
  Collections: {},
  Views: {},
  models: {},
  collections: {},
  views: {}
};

/**
  * the model used for preloading all the resources needed for the editor
**/
App.Models.Preload = Backbone.Model.extend({
  defaults: {
    mapsLoaded: false,
    objectsLoaded: false,
    spriteSheetLoaded: false,
    charPrevLoaded: false,
    charTilesetsLoaded: false,
    ret: {
      maps: {},
      tileset: {},
      objects: {},
      characters: {
        previews: {},
        tilesets: {}
      },
      stages: {}
    }
  },

  /**
    * Launch all the prealoading functions
  **/
  initialize: function () {
    this.loadTransitions();
    this.loadTilesheet();
    this.loadCharcters();
    this.initStages();
    this.checkChange();
  },

  /**
    * Listen events to launch loaders that depends of preloaded resources
  **/
  checkChange: function () {
    this.on('change:spriteSheetLoaded', this.loadObjects, this);
    this.on('change', this.checkEndLoad, this);
  },

  /**
    * Once all the resources have been loaded, launch the interactive view
  **/
  checkEndLoad: function () {
    if(this.get("mapsLoaded") && this.get("spriteSheetLoaded") && this.get("objectsLoaded") && this.get("charPrevLoaded") && this.get("charTilesetsLoaded")){
      console.log("chargement des données terminées");
      document.getElementById("loading").style.display = "none";
      document.getElementById("menu").style.display = "block";
      App.models.resources = new App.Models.Resources(this.get("ret"));
      App.collections.pnjs = new App.Collections.Pnjs();
      App.collections.pnjsForExport = new App.Collections.PnjsForExport();
      App.views.pnjs = new App.Views.Pnjs({
        collection: App.collections.pnjs,
        model: App.models.resources
      });
      App.views.gestionPnjs = new App.Views.GestionPnjs({
        collection: App.collections.pnjs,
        model: App.models.resources
      });
    }
  },

  initStages: function () {
    this.get("ret").stages.framePreview = new createjs.Stage("apercuFrame");
    this.get("ret").stages.mapDisplay = new createjs.Stage("mapDisplay");
  },

  loadTransitions: function () {
    var that = this,
      transition = new App.Models.Transition,
      transitions = new App.Collections.Transition;

    transitions.add(transition);
    transitions.fetch({
      success: function (coll, resp, opt) {
        that.loadMaps(coll.get(1).get("mapsName"), coll.get(1).get("maps"));
      }
    });
  },

  loadObjects: function (){
    var that = this,
      obj = new App.Models.Obj(),
      objs = App.collections.objs = new App.Collections.Objs();

    objs.add(obj);
    objs.fetch({
      success: function (coll, resp, opt) {
        that.loadObjs(coll);
      }
    });
  },

  loadObjs: function (coll) {
    var compt = 0,
      that = this;
    for(var k = 0, lc = coll.length; k < lc; k++){
      var obj = coll.at(k),
        cont = new createjs.Container(),
        object = obj.get("tiles"),
        height = obj.get("height")*48,
        width = obj.get("width")*48,
        imgObj = new Image();

      for(var i = 0, l = object.length; i < l; i+=3){
        var temp = new createjs.Sprite(this.get("ret").tileset.spriteSheet);
        temp.gotoAndStop(object[i]);
        temp.x = object[i+1] ? object[i+1] * 48 : 0;
        temp.y = object[i+2] ? object[i+2] * 48 : 0;
        cont.addChild(temp);
      };

      cont.cache(0, 0, width, height);

      imgObj.id = "apercuObj";
      imgObj.className = "object";
      imgObj.src = cont.getCacheDataURL();
      that.get("ret").objects[obj.get("name")] = imgObj;

      imgObj.onload = function (e) {
        compt++;
        if(compt == lc){
          that.set("objectsLoaded", true);
        }
      };
    }
  },

  loadMaps: function (mapsName, mapsUrl) {
    var names = [],
      urls = [],
      that = this,
      uri = "/assets/resources/map/",
      format = ".png";
    for (var i = 0, j = 0; i < mapsName.length; i++) {
      if(names.indexOf(mapsName[i]) < 0){
        names[j] = mapsName[i];
        urls[j] = mapsUrl[i].split(".json")[0];
        j++;
      }
    };

    var compt = 0;

    for(var k = 0, l = names.length; k < l; k++){
      var map = new Image(),
        name = names[k];
        map.name = name; // mapsName.indexOf(name)
        map.src = uri + urls[k] + format;
        map.id = "displayMap";  // urls[k]
        // map.className = "displayMap";

      this.get("ret").maps[name] = {
        "map": new createjs.Bitmap(map),
        "id": mapsName.indexOf(name)
      };

      map.onload = function (img) {
        compt++;
        if(compt == l){
          that.set("mapsLoaded", true);
        }
      }
    }
  },

  loadTilesheet: function () {
    var ts = new Image(),
      that = this;

    ts.src = "/assets/resources/img/tilesheet.png";

    ts.onload = function (e) {
      that.get("ret").tileset.img = ts;
      that.loadTileset(ts);
    };
  },

  loadTileset: function (tileSheet) {
    var data = {
        images: [tileSheet],
        frames: {
          height: 48,
          width: 48
        }
      },
      ts = new createjs.SpriteSheet(data);

    this.get("ret").tileset.spriteSheet = ts;
    this.set("spriteSheetLoaded", true);
  },

  ssLoaded: function (argument) {
  },

  loadCharcters: function () {
    var names = ["blond-blue.png", "blond-green.png", "blond-red.png", "brown-blue.png", "brown-green.png",
        "brown-red.png", "red-blue.png", "red-green.png", "red-red.png", "blond-black.png", "blond-blue.png",
        "blond-green.png", "brown-black.png", "brown-blue.png", "brown-green.png", "red-black.png",
        "red-blue.png", "red-green.png", "blond-blue.png", "blond-green.png", "blond-red.png",
        "brown-blue.png", "brown-green.png", "brown-red.png", "red-blue.png",
        "red-green.png", "red-red.png", "blond-blue.png", "blond-green.png",
        "blond-red.png", "brown-blue.png", "brown-green.png", "brown-red.png",
        "red-blue.png", "red-green.png", "red-red.png"
      ];

    this.loadPreviewsCharacters(names);
    this.loadDetailedCharacters(names);
  },

  loadPreviewsCharacters: function (names) {
    var previews = [],
      that = this,
      compt = 0,
      baseURL = "/assets/resources/img/select/",
      folders = ["adm-f", "adm-m", "etu-f", "etu-m"];

    for(var i = 0; i < 4; i++){
      var div = document.createElement('div');
      div.id = "selectChar";
      for(var j = 0; j < 9; j++){
        var prev = new Image(),
          name = names[ i * 9 + j ];
        if(j  % 3 == 0 && j > 0){
          div.appendChild(document.createElement('br'));
        }
        prev.id = folders[i] + "-" + name;
        prev.className = "previewChar";
        prev.src = baseURL + folders[i] + "/" + name;
        div.appendChild(prev);

        prev.onload = function (e) {
          compt++;
          if(compt == 36){
            that.set("charPrevLoaded", true);
          }
        };
      };
      this.get("ret").characters.previews[folders[i]] = div;
    };
  },

  loadDetailedCharacters: function(names){
    var charImgs = {},
      compt = 0,
      that = this,
      folders = ["adm/", "etu/"],
      prefixes = ["adm-f-", "adm-m-", "etu-f-", "etu-m-"],
      baseURL = "/assets/resources/img/skins/";

    for(var i = 0; i < names.length; i++){
      var img = new Image(),
        uri = prefixes[Math.floor(i/9)] + names[i],
        url = baseURL + folders[Math.floor(i/18)] + uri;

      img.id = uri;
      img.src = url;
      charImgs[img.id] = img;

      img.onload = function(e){
        compt++;
        if(compt == names.length){
          that.loadCharTilesets(charImgs);
        }
      }
    }
  },

  loadCharTilesets: function (charImgs) {
    var tilesets = {};

    for(img in charImgs){
      tilesets[img] = new createjs.SpriteSheet({
        images: [charImgs[img]],
        frames: {
          height: 96,
          width: 96
        }
      })
    };
    this.get("ret").characters.tilesets = tilesets;
    this.set("charTilesetsLoaded", true);
  }

});

App.Models.Transition = Backbone.Model.extend({
  defaults: {
    id: 1
  }
});

App.Collections.Transition = Backbone.Collection.extend({
  url: "/assets/resources/map/transitions.json",
  model: App.Models.Transition
});

App.Models.Obj = Backbone.Model.extend({

});

App.Collections.Objs = Backbone.Collection.extend({
  url: "/assets/resources/objects.json",
  model: App.Models.Obj
});

App.Models.Pnj = Backbone.Model.extend({

  clearInfos: function () {
    if(this.get("object")){
      this.unset("height", {silent: true});
      this.unset("width", {silent: true});
      this.unset("objectName", {silent: true});
      this.unset("pannel", {silent: true});
    } else {
      this.unset("skin", {silent: true});
      this.unset("orientation", {silent: true});
    }
  }
});;

App.Collections.Pnjs = Backbone.Collection.extend({
  model: App.Models.Pnj,
  url: "/assets/resources/pnj.json",

  getSelectedIndex: function (id) {
    for(var i = 0; i<this.length; i++){
      if(this.at(i).id == id)
        return i;
    }
    return -1;
  },

  newId: function () {
    return this.at(this.length - 1).id + 1;
  }
});

App.Collections.PnjsForExport = Backbone.Collection.extend({
  model: App.Models.Pnj,
  url: "/assets/resources/pnj.json",

  initialize: function () {
    this.fetch();
  }
});

App.Models.Resources = Backbone.Model.extend({});

/**
  * Interactive views
**/
App.Views.Pnjs = Backbone.View.extend({

  el: "#listePnj",

  events: {
    "change": "pnjSelected"
  },

  initialize: function () {
    this.collection.on('add', function(pnj){
      this.listenTo(pnj, "change:pName", this.updateName);
      this.listenTo(pnj, "change", this.savePnjforExport);
      this.displayNewPnj(pnj);
    }, this);
    this.collection.on('remove', function(pnj, options){
      this.stopListening(pnj);
      this.removePnj(pnj, options);
    }, this)
    this.collection.fetch({
      error: function (coll, resp, opt) {
        alert("une erreur est survenue lors du chargement des donées");
      }
    });
  },

  displayNewPnj: function (pnj) {
    this.$el.append("<option class=\"pnjItem\" id=\"pnj"+pnj.id+"\" >"+pnj.get("pName")+"</otion>");
    document.getElementById("listePnj").selectedIndex = this.collection.getSelectedIndex(pnj.id);
    if(pnj.collection.length <= pnj.id + 1){
      this.$el.focus();
      this.$el.change();
    }
  },

  pnjSelected: function (e) {
    var id = e.target.options[e.target.selectedIndex].id.split("pnj")[1],
      formPnj = document.getElementById("detailPnj"),
      mapContainer = document.getElementById("mapContainer");
      pnj = this.collection.get(id),
      pos = pnj.get("pos");

    document.getElementById("id").innerHTML = id;
    formPnj.pName.value = pnj.get("pName");
    formPnj.map.selectedIndex = pnj.get("map");
    $(formPnj.map).change();
    if(pnj.get("object")){
      formPnj.objet.checked = true;
      $(formPnj.objet).change();
      formPnj.obj.value = pnj.get("objectName");
      $("#obj").change();
      if(pnj.get("pannel")){
        formPnj.pannel.checked = true;
      } else {
        formPnj.pannel.checked = false;
      }
    } else {
      var splitName = (pnj.get("skin") || "etu-m-brown-blue.png").split("-");
      formPnj.perso.checked = true;
      $(formPnj.perso).change();
      formPnj.admEtu.value = splitName[0];
      formPnj.hf.value = splitName[1];
      $(".aspectSelect").change();
      App.views.gestionPnjs.initFrameSelect(pnj.get("skin"));
      formPnj.frameSkin.value = pnj.get("orientation");
      $("#frameSkin").change()
    }
    mapContainer.scrollTop = pos.i * 48 - 300;
    mapContainer.scrollLeft = pos.j * 48 - 500;
    App.views.gestionPnjs.positionSelected({offsetX: pos.j*48, offsetY: pos.i*48});
    formPnj.dialDefault.value = pnj.get("text");
    if(pnj.get("showName")){ // pnj.get("displayName") peut être undefined
      formPnj.showName.checked = true;
    } else {
      formPnj.showName.checked = false;
    }
  },

  updateName: function (pnj, pName) {
    document.getElementById("pnj"+pnj.id).innerHTML = pName;
  },

  savePnjforExport: function (pnj) {
    var p = App.collections.pnjsForExport.get(pnj.id);
    if(p){
      p.clearInfos();
      p.set(pnj.attributes);
    } else {
      App.collections.pnjsForExport.add(pnj.clone(), {merge: true});
    }
  },

  removePnj: function (pnj, option) {
    var s = this.$el[0],
      si = s.selectedIndex;
    s.selectedIndex = si - 1;
    s.remove(si);
    this.$el.focus();
    this.$el.change();
  }

});

App.Views.GestionPnjs = Backbone.View.extend({
  el:"#menu-right",

  events: {
    "change #map": "mapSelected",
    "change .choixAspect": "aspectSelected",
    "change .aspectSelect": "displayPreview",
    "click #apercuSkin": "skinSelected",
    "change #frameSkin": "frameSelected",
    "change #obj": "objectSelected",
    "click #mapDisplay": "positionSelected",
    "click #newPnj": "newPnj",
    "click #savePnj": "savePnj",
    "click #removePnj": "removePnj",
    "click #sendAllPnjs": "sendAllPnjs"
  },

  initialize: function () {
    this.delegateEvents();
    this.initMaps();
    this.initObjects();
  },

  initMaps: function () {
    /* MODIFIER MAP.JSON POUR AVOIR DES IDENTIFIANTS DE NOMMAGE, UNIQUES */

    var maps = this.model.get("maps"),
      selec = document.getElementById("map");
    for(var map in maps){
      var opt = document.createElement("option");
      opt.value = map;
      opt.className = "selectMap";
      opt.innerHTML = map;
      selec.appendChild(opt);
    }
    $(selec).change();
  },

  mapSelected: function (e) {
    var mapName = e.target.value,
      mapObj = this.model.get("maps")[mapName],
      map = this.model.get("maps")[mapName].map;

    this.displayMap(map);
  },

  displayMap: function (map) {
    var mapDisplay = this.model.get("stages").mapDisplay,
      canv = document.getElementById("mapDisplay"),
      bounds = map.getBounds(),
      width = bounds.width,
      height = bounds.height;

    canv.height = height;
    canv.width = width;

    mapDisplay.removeAllChildren();
    mapDisplay.addChildAt(map, 0);
    mapDisplay.update();
  },

  positionSelected: function (e) {
    var selecPerso = document.getElementById("perso").checked,
      selecObj = document.getElementById("objet").checked,
      pos = {i: Math.floor((e.offsetY || e.originalEvent.layerY) / 48), j: Math.floor((e.offsetX || e.originalEvent.layerX) / 48)},
      mapDisplay = this.model.get("stages").mapDisplay;

    document.getElementById("posI").value = pos.i;
    document.getElementById("posJ").value = pos.j;
    if(selecPerso && !selecObj) {
      pos.i -= 34/48;
      pos.j -= 24/48;
      this.updatePreviewPnj(document.getElementById("apercuFrame"), pos);
    }
    else if (selecObj && !selecPerso){
      this.updatePreviewPnj(document.getElementById("apercuObj"), pos);
    }
  },

  removePreviewPnj: function(){
    var mapDisplay = this.model.get("stages").mapDisplay;

    mapDisplay.removeChild(mapDisplay.getChildByName("preview"));

    mapDisplay.update();
  },

  updatePreviewPnj: function (image, pos) {
    var needUpdate = false,
      mapDisplay = this.model.get("stages").mapDisplay,
      preview = mapDisplay.getChildByName("preview");

    if(!preview && pos){
      preview = new createjs.Bitmap(image);
      preview.name = "preview";
      mapDisplay.addChild(preview);
    }

    if(preview){
      if(preview.image != image){
        preview.image = image;
        needUpdate = true;
      }
      if(pos){
        preview.x = pos.j * 48;
        preview.y = pos.i * 48;
        needUpdate = true;
      }
      if(needUpdate)
        mapDisplay.update();
    }
  },

  updateMapDisplay: function () {
    var mapDisplay = this.model.get("stages").mapDisplay;

    mapDisplay.update();
  },

  aspectSelected: function (e) {
    var objDisplayStyle,
      persoDisplayStyle,
      objs = document.getElementsByClassName("objectPreview"),
      persos = document.getElementsByClassName("persoPreview");

    this.removePreviewPnj();
    switch(e.target.value){
      case "Objet":
        objDisplayStyle = "inline-block";
        persoDisplayStyle = "none";
        break;
      case "Personnage":
        objDisplayStyle = "none";
        persoDisplayStyle = "inline-block";
        this.displayPreview();
        break;
      default:
        objDisplayStyle = "none";
        persoDisplayStyle = "none";
        break;
    }

    for(var k = 0; k < objs.length; k++){
      objs[k].style.display = objDisplayStyle;
    }

    for(var l = 0; l < persos.length; l++){
      persos[l].style.display = persoDisplayStyle;
    }
  },

  skinSelected: function(e) {
    this.initFrameSelect(e.target.id);
  },

  initFrameSelect: function (name) {
    var nbFrames = this.model.get("characters").tilesets[name].getNumFrames(),
      selec = document.getElementById("frameSkin"),
      oldFrame = selec.selectedIndex;

    while(selec.firstChild){
      selec.removeChild(selec.firstChild);
    }

    selec.name = name;
    for(var i = 0; i < nbFrames; i++){
      var opt = document.createElement("option");
      opt.value = i;
      opt.className = "selectFrameSkin";
      opt.innerHTML = i;
      selec.appendChild(opt);
    }

    if(oldFrame > 0 && oldFrame < selec.options.length)
      selec.selectedIndex = oldFrame;

    $(selec).change();
  },

  frameSelected: function(e) {
    var selec = e.target,
      frame = selec.value,
      name = selec.name,
      sprite = new createjs.Sprite(this.model.get("characters").tilesets[name]);

    sprite.name = name + "+" + frame;
    sprite.gotoAndStop(frame);
    this.updateSprite(sprite);
  },

  updateSprite: function(sprite){
    var stage = this.model.get("stages").framePreview;

    stage.removeAllChildren();
    if(sprite)
      stage.addChildAt(sprite, 0);
    stage.update();
    this.updateMapDisplay();
  },

  displayPreview: function () {
    var status = document.getElementById("admEtu"),
      sexe = document.getElementById("hf"),
      choice = status.value + "-" + sexe.value,
      display = document.getElementById("apercuSkin");

    while(display.firstChild){
      display.removeChild(display.firstChild);
    }

    display.appendChild(this.model.get("characters").previews[choice]);
    this.updateSprite(null);
  },

  initObjects: function () {
    var objects = this.model.get("objects"),
      selec = document.getElementById("obj");
    for(var obj in objects){
      var opt = document.createElement("option");
      opt.value = obj;
      opt.className = "selectObj";
      opt.innerHTML = obj;
      selec.appendChild(opt);
    }
    $(selec).change();
  },

  objectSelected: function (e) {
    var selec = e.target,
      obj = selec.value,
      display = document.getElementById("apercuObj"),
      newDisplay = this.model.get("objects")[obj];

    display.parentNode.replaceChild(newDisplay, display);
    this.updatePreviewPnj(newDisplay, false);
  },

  newPnj: function () {
    var newP = new App.Models.Pnj({
      "id": this.collection.newId(),
      "skin": "etu-m-brown-blue.png",
      "orientation": 24,
      "object": false,
      "pName": "nouveau pnj",
      "displayName": true,
      "pos": {i:15, j:50},
      "map": 0,
      "text": "",
      "showName": true
    });

    this.collection.push(newP);
  },

  savePnj: function () {
    var formPnj = document.getElementById("detailPnj"),
      pnj = {},
      isValid = true,
      id = parseInt(document.getElementById("id").innerHTML),
      pName = formPnj.pName.value.trim(),
      map = formPnj.map.selectedIndex,
      pos = {i: parseInt(formPnj.posI.value), j: parseInt(formPnj.posJ.value)},
      persoSelected = formPnj.perso.checked,
      objectSelected = formPnj.objet.checked,
      text = formPnj.dialDefault.value,
      err = "",
      showName = formPnj.showName.checked;

    if(persoSelected && !objectSelected){
      var skin = formPnj.frameSkin.name,
        orientation = parseInt(formPnj.frameSkin.value),
        ts;

      if(!(skin && (ts = this.model.get("characters").tilesets[skin]) && orientation >= 0 && orientation < ts.getNumFrames())){
        err += " veuillez sélectionner un aperçu de personnage valide,";
        isValid = false;
      } else {
        pnj.object = false
        pnj.skin = skin;
        pnj.orientation = orientation;
      }
    } else if(objectSelected && !persoSelected){
      var obj = App.collections.objs.get(formPnj.obj.selectedIndex);

      if(obj){
        pnj.object = obj.get("tiles");
        pnj.height = obj.get("height");
        pnj.width = obj.get("width");
        pnj.objectName = obj.get("name");
        pnj.pannel = formPnj.pannel.checked;
      } else{
        err += " veuillez délectionner un objet valide,";
        isValid = false;
      }
    } else {
      err += " veuillez sélectionner un aspect de pnj,";
      isValid = false;
    }

    if(pos.i < 0 || pos.j < 0 ){
      err += " veuillez sélectionner une position valide pour votre pnj";
      isValid = false;
    }

    if(pName == ""){
      err += " veuillez saisir un nom valide pour votre pnj";
      isValid = false;
    }

    if(!(this.model.get("maps")[formPnj.map.value])){
      err += " veuillez sélectionner une map valide";
      isValid = false;
    }

    if(!this.collection.get(id)){
      err += " id de pnj invalide";
      isValid = false;
    }

    if(!isValid){
      err += " merci."
      alert(err);
    }else{
      pnj.id = id;
      pnj.pName = pName;
      pnj.map = map;
      pnj.pos = pos;
      pnj.text = text;
      pnj.showName = showName;
      this.collection.get(id).clearInfos();
      this.collection.get(id).set(pnj);
    }
  },

  removePnj: function () {
    var id = parseInt(document.getElementById("id").innerHTML);
      pnj = this.collection.get(id),
      pnjForExp = App.collections.pnjsForExport.get(id);

      if(pnj){
        this.collection.remove(pnj);
      }
      if(pnjForExp){
        App.collections.pnjsForExport.remove(pnjForExp);
      }
  },

  sendAllPnjs: function () {
    var data = JSON.stringify(App.collections.pnjsForExport.toJSON());
    $.ajax({
      type: "POST",
      url: "modifPnjs",
      data: data,
      success: function(data, status){
        alert("les modifications ont bien été enregistrées");
      }
    });
  }

});

App.models.preload = new App.Models.Preload();
