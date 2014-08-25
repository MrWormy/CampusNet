(function(undefined){

  var services = {
    data: {},
    indexOf: function (name) {
      for(var k in this.data){
        if(this.data[k] == name){
          return k;
        }
      }
      return undefined;
    },
    addService: function (name) {
      var max = -1;

      for(var k in this.data){
        var kNum = parseInt(k)
        if(!isNaN(kNum) && kNum > max){
          max = kNum;
        }
      }
      this.data[max + 1] = name;
    }
  }

  var oldServices = [];

  function sendNewS (s) {
    $.post("sendNewServices", JSON.stringify(s), function(data){
      alert("modifications enregistrées");
    })
  }

  function isEmpty (obj) {
    for(var k in obj){
      if(obj.hasOwnProperty(k))
        return false;
    }
    return true;
  }

  function sendNewServices (e) {
    var toSend = {},
      newS = document.getElementsByClassName("persoSelec");

    for(var i = 0, l = newS.length; i < l; i++){
      var tmpN = newS[i],
        tmpO = oldServices[i],
        ind = parseInt(services.indexOf(tmpN.value))

      if(tmpO.login === tmpN.id && tmpO.admin !== ind){
        toSend[tmpN.id] = ind;
        tmpO.admin = ind;
      }
    }

    if(!isEmpty(toSend)) sendNewS(toSend);
  }

  function handleSearch (e) {
    if(e.preventDefault) e.preventDefault();
    if(e.returnValue) e.returnValue = false;

    var search = e.target.search.value.trim();

    if(search.length > 0){

      var url = "searchById?search="+search;

      $.get(url, function (data) {
        var display = document.getElementById("searchResults");
        while(display.firstChild){
          display.removeChild(display.firstChild);
        }
        if(typeof data !== "object" || data.length == 0){
          display.innerHTML = "il n'y a aucun résultat pour cette recherche";
        } else {
          var servicesSelec = document.getElementById("services").cloneNode(true);
          servicesSelec.className = "persoSelec";
          oldServices = data;
          for (var i = 0, l = data.length; i < l; i++) {
            var persoTr = document.createElement("TR"),
              td1 = document.createElement("TD"),
              td2 = document.createElement("TD"),
              persoSelec = servicesSelec.cloneNode(true),
              login = data[i].login,
              service = data[i].admin;

            persoSelec.id = login;
            persoSelec.value = services.data[service];
            td1.innerHTML=login + " : ";
            td2.appendChild(persoSelec);
            persoTr.appendChild(td1);
            persoTr.appendChild(td2);
            display.appendChild(persoTr);
          };
          var but = document.createElement("button");
          but.innerHTML = "envoyer au serveur";
          but.onclick = sendNewServices;
          display.appendChild(but);
        }
      });
    }
  }

  function handleServiceChange (e) {
    var serviceName = document.getElementById("serviceName");

    serviceName.value = e.target.value;
  }

  function handleChangeName (e) {
    var serviceName = document.getElementById("serviceName")
      newName = serviceName.value.trim(),
      selec = document.getElementById("services");

    if(newName && services.indexOf(newName) === undefined){
      var indName = services.indexOf(selec.value);
      if(indName !== undefined){
        var opt = selec.options[selec.selectedIndex];
        services.data[indName] = newName;
        opt.text = newName;
        opt.value = newName;
      }
    }
    serviceName.value = newName;
  }

  function handleNewService (e) {
    var newName = document.getElementById("serviceName").value.trim();

    if(newName && services.indexOf(newName) === undefined){
      var opt = document.createElement("option");

      opt.value = newName;
      opt.innerHTML = newName;
      document.getElementById("services").appendChild(opt);
      document.getElementById("services").value = newName;
      services.addService(newName);
    }
    document.getElementById("serviceName").value = newName;
  }

  function sendServicesToServ (e) {
    $.post("updateServices", JSON.stringify(services.data), function(data){
      alert("modifications enregistrées");
    })
  }

  function initListeners () {
    var searchId = document.getElementById("searchById"),
      servicesSelec = document.getElementById("services"),
      changeName = document.getElementById("changeName"),
      newService = document.getElementById("newService"),
      sendServ = document.getElementById("sendServicesToServ");


    searchId.addEventListener("submit", handleSearch, false);
    servicesSelec.addEventListener("change", handleServiceChange, false);
    changeName.addEventListener("click", handleChangeName, false);
    newService.addEventListener("click", handleNewService, false);
    sendServ.addEventListener("click", sendServicesToServ, false);
  }

  function fillServices (data) {
    var services = document.getElementById("services");

    while(services.firstChild){
      services.delete(services.firstChild);
    }

    for(var k in data){
      var opt = document.createElement("option"),
        name = data[k];

      opt.value = name;
      opt.text = name;
      services.add(opt);
    }

    handleServiceChange({target: services});
  }

  function getServices () {
    $.get("getServices", function(data){
      fillServices(data);
      services.data = data;
    });
  }

  function initialize () {
    initListeners();
    getServices();
  }

  initialize();

})()
