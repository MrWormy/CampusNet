
var App = {
  Models: {},
  Collections: {},
  Views: {},
  models: {},
  collections: {},
  views: {}
};

App.Models.Map = Backbone.Model.extend({
  defaults: {
    id: 1
  }
});

App.Collections.Maps = Backbone.Collection.extend({
  base: "/assets/resources/map/",
  model: App.Models.Map
});

App.Models.Transition = Backbone.Model.extend({
  defaults: {
    id: 1
  },

  updateTransitions: function (trs) {
    var transitions = this.get("transitions"),
      toDelete = [],
      oks = [];

    for(var k in trs){
      var uri = k + ".json",
        ind = this.get("maps").indexOf(uri),
        eTrs = transitions[ind];

      if(!eTrs){
        transitions[ind] = [];
      }

      oks[uri] = trs[k];
    }

    for(var i = 0, l = transitions.length; i < l; i++){
      var tmpTr = transitions[i],
        names = this.get("maps"),
        ok = oks[names[i]].trans;

      for(var j = 0, m = tmpTr.length; j < m; j++){
        var tmp = tmpTr[j],
          target = transitions[tmp[2]][tmp[3]],
          okT = oks[names[tmp[2]]].trans;

        if(!this.isTr(tmp, ok) || !this.isTr(target, okT)){
          toDelete.push([i, j]);
        }
      }
    }

    for(var a = toDelete.length - 1; a > 0; a--){
      this.updateAndSplice(transitions, toDelete[a][0], toDelete[a][1]);
    }
  },

  isTr: function (tr, ref) {
    for(var i = 0, l = ref.length; i < l; i++){
      if(tr[0] == ref[i].i && tr[1] == ref[i].j)
        return true;
    }
    return false;
  },

  isInTr: function (pos, map) {
    var trs = this.get("transitions")[map];

    for (var i = trs.length - 1; i >= 0; i--) {
      if(trs[i][0] == pos.i && trs[i][1] == pos.j){
        var target = this.get("transitions")[trs[i][2]][trs[i][3]]
        return {i: target[0], j: target[1], map: trs[i][2]};
      }
    };
    return null;
  },

  updateAndSplice: function (trs, indMap, indTr) {
    var mapTrs = trs[indMap];
    for(var i = indTr + 1, l = mapTrs.length; i < l; i ++){
      var tmp = mapTrs[i];
      trs[tmp[2]][tmp[3]][3]--;
    }
    mapTrs.splice(indTr, 1);
  },

  addTr: function (tr) {
    var from = tr.from,
      to = tr.to,
      isFrom = this.isInTr(from, from.map),
      isTo = this.isInTr(to, to.map);

    console.log(isFrom, isTo);
  }
});

App.Collections.Transition = Backbone.Collection.extend({
  url: "/assets/resources/map/transitions.json",
  model: App.Models.Transition
});

App.Models.Preload = Backbone.Model.extend({
  defaults: {
    mapsLoaded: false,
    transitionsLoaded: false,
    ret: {
      maps: {},
      transitions: {}
    }
  },
  /**
    * Launch all the prealoading functions
  **/
  initialize: function () {
    this.loadTransitions();
    this.on("change", this.checkEnd);
  },

  checkEnd: function () {
    if(this.get("mapsLoaded") && this.get("transitionsLoaded")){
      var transView = new App.Views.Transition({
        model: App.models.transition,
        datas: this.get("ret")
      });
    }
  },

  loadTransitions: function () {
    var that = this,
      map = new App.Models.Map,
      maps = new App.Collections.Maps,
      transitions = new App.Collections.Transition;
    var transition = App.models.transition = new App.Models.Transition;

    maps.add(map);
    transitions.add(transition);
    transitions.fetch({
      success: function (coll, resp, opt) {
        that.loadMaps(transition.get("mapsName"), transition.get("maps"));
        that.loadJsons(transition.get("mapsName"), transition.get("maps"), maps);
      }
    });
  },

  loadJsons: function (mapsName, mapsUri, maps) {
    var mapsJsons = {},
      pastUris = [],
      counts = [0, 0];

    this.loadJson(counts, mapsUri, pastUris, mapsJsons, maps);
  },

  loadJson: function (counts, uris, pUris, ret, coll) {
    var curUri = uris[pUris.length],
      that = this,
      name = curUri.split(".json")[0];

    pUris.push(curUri);
    if(!(name in ret)){
      counts[0]++;
      ret[name] = [];
      coll.url = coll.base + curUri;
      coll.fetch({
        name: name,
        success: function (coll, resp, opt) {
          ret[opt.name] = {
            height: resp.height,
            width: resp.width,
            trans: that.getTransition(resp.layers)
          };
          counts[1]++;
          if(counts[1] == counts[0]){
            that.get("ret").transitions = ret;
            that.set("transitionsLoaded", true);
          }
        }
      });
    }

    if(pUris.length !== uris.length){
      this.loadJson(counts, uris, pUris, ret, coll);
    }
  },

  getTransition: function (layers) {
    for(var i=0, l=layers.length; i<l; i++){
      if(layers[i].name == "map-transition"){
        return this.getPosFromT(layers[i]);
      }
    }

    return [];
  },

  getPosFromT: function (layer) {
    var ret = [],
      w = layer.width,
      d = layer.data;

    for(var i = 0, l = d.length; i < l; i++){
      if(d[i] > 0){
        ret.push({
          i: Math.floor(i / w),
          j: i % w
        })
      }
    }

    return ret;
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
        "map": map,
        "id": mapsName.indexOf(name),
        "json": urls[k]
      };

      map.onload = function (img) {
        compt++;
        if(compt == l){
          that.set("mapsLoaded", true);
        }
      }
    }
  }

});

App.Views.Transition = Backbone.View.extend({

  el:"#detailTrans",

  events: {
    "change #fromMap": "changeFromMap",
    "change #toMap": "changeToMap",
    "click #fromDisplayMap": "fromClick",
    "click #toDisplayMap": "toClick",
    "click #saveTr": "saveTr",
    "click #removeTr": "removeTr",
    "click #sendAllTrs": "sendAllTrs"
  },

  initialize: function (opts) {
    this.res = opts.datas;
    this.model.updateTransitions(this.res.transitions);
    this.loadMaps();
    this.tr = {};
    this.displayMap("from");
  },

  loadMaps: function () {
    for(var k in this.res.maps){
      var id = this.res.maps[k].id,
        optFrom = this.createOpt(k, "from" + id),
        optTo = this.createOpt(k, "to" + id),
        selecFrom = document.getElementById("fromMap"),
        selecTo = document.getElementById("toMap");

      selecTo.appendChild(optTo);
      selecFrom.appendChild(optFrom);
    }
  },

  createOpt: function (name, id) {
    var opt = document.createElement("option");

    opt.value = name;
    opt.innerHTML = name;
    if(id){
      opt.id = id;
    }

    return opt;
  },

  displayMap: function(name){
    var selec = document.getElementById(name + "Map"),
        disp = document.getElementById(name + "Container");

    while(disp.firstChild){
      disp.removeChild(disp.firstChild);
    }

    if(selec.selectedIndex >= 0){
      var mapName = selec.options[selec.selectedIndex].value,
        map = this.res.maps[mapName].map;

      map.id = name + "DisplayMap";
      disp.appendChild(map);
    }
  },

  changeFromMap: function () {
    this.tr = {};
    this.displayMap("from");
  },

  changeToMap: function () {
    this.displayMap("to");
  },

  fromClick: function (ev) {
    var pos = this.posFromClick(ev),
      selec = document.getElementById("fromMap"),
      mapName = selec.options[selec.selectedIndex].value,
      ind = this.model.get("mapsName").indexOf(mapName),
      name = this.model.get("maps")[ind].split(".json")[0],
      trs = this.res.transitions[name].trans;

    if(this.isTra(pos, trs)){
      this.tr.from = {i: pos.i, j: pos.j, map: ind};
      var alreadyExist = this.model.isInTr(pos, ind);
      if(alreadyExist){
        var selecTo = document.getElementById("toMap"),
          indTo = this.indexFromSelect(selecTo, this.model.get("mapsName")[alreadyExist.map]);

        selecTo.selectedIndex = indTo;
        this.tr.to = alreadyExist;
        this.displayMap("to");
        this.scrollMapTo("to", this.tr.to);
      } else {
        var selecTo = document.getElementById("toMap");

        selecTo.selectedIndex = -1;
        this.displayMap("to");
      }
    }
  },

  toClick: function (ev) {
    if(this.tr.from){
      var pos = this.posFromClick(ev),
        selec = document.getElementById("toMap"),
        mapName = selec.options[selec.selectedIndex].value,
        ind = this.model.get("mapsName").indexOf(mapName),
        name = this.model.get("maps")[ind].split(".json")[0],
        trs = this.res.transitions[name].trans;

      if(this.isTra(pos, trs)){
        this.tr.to = {i: pos.i, j: pos.j, map: ind};
      }
    }
  },

  scrollMapTo: function (name, pos) {


    var cont = document.getElementById(name + "Container"),
      scrollX = Math.max(0, pos.j * 48 - parseInt(cont.style.width.split("px")[0]) / 2),
      scrollY = Math.max(0, pos.i * 48 - parseInt(cont.style.height.split("px")[0]) / 2);

    cont.scrollTop = scrollY;
    cont.scrollLeft = scrollX;
  },

  isTra: function (pos, ref) {
    for (var i = ref.length - 1; i >= 0; i--) {
      if (ref[i].i == pos.i && ref[i].j == pos.j){
        return true
      }
    };
    return false;
  },

  posFromClick: function (ev) {
    var e = ev.originalEvent,
      posX = (e.offsetX || e.layerX || e.x || 0),
      posY = (e.offsetY || e.layerY || e.y || 0),
      j = Math.floor(posX / 48),
      i = Math.floor(posY / 48);

    return {i: i, j: j};
  },

  indexFromSelect: function (s, name) {
    for (var i = s.options.length - 1; i >= 0; i--) {
      if(s.options[i].value == name){
        return i;
      }
    };
    return -1;
  },

  saveTr: function (e) {
    if(this.tr.from && this.tr.to){
      this.model.addTr(this.tr);
    }
  },

  removeTr: function (e) {

  },

  sendAllTrs: function (e) {

  }
});

new App.Models.Preload();
