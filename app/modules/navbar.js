App.Models.Navbar = Backbone.Model.extend({
  defaults: {
    "quetes": "",
    "discussion": "",
    "carte": '<img id="imgmap" src="./assets/resources/img/carte.png"><br>',
    "profil": '<div class="info"> Pseudo : Inconnu<br><br>Biographie : <br><br><br><br>Avatar :<br><img src="assets/resources/img/select/etu-m/brown-blue.png"><br><br></div>',
    "son": '<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>',
    "param": '<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>',
    "aide": '<div class="info">Bienvenue sur Campusnet v2.<br><br>Bientôt vous pourrez trouvez l\'aide pour le jeu ici.<br><br>Crédits:<br><br>Campusnet v2 a été développé par Nicolas Benning, Thomas Laurence, Bilgé Kimyonok et Benoît Koenig.</div>',
    "quit": "",
    "curQ": [],
    "endedQ": []
  },

  newQ: function (newQ) {
    var curQ = "", endedQ = "", ret = "";
    for (var i = 0; i < newQ.length; i++) {
      var tempQ = newQ[i];
      switch(tempQ.type){
        case 1:
          this.get("curQ").push(tempQ.name);
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
    this.listenTo(app, 'close:info', this.closeInfo);
    App.socket.on("newQuests", function(data){
      that.model.newQ(data.data);
    });
  },

  navAction: function (e){
    var title = "<h1> - " + e.target.title + " - </h1>",
      infoBox = $("#infoBox");
      this.closeInfo();
      infoBox.css({'display' : 'block'});
    switch(e.target.id){
      case "quetes" :
        infoBox.html(title);
        infoBox.append(this.model.get("quetes"));
        break;
      case "discussion" :
        infoBox.html(title);
        break;
      case "carte" :
        infoBox.html(title);
        var width = infoBox.css("width").slice(0,-2),
          height = infoBox.css('height').slice(0,-2);
        infoBox.append(this.model.get("carte"));
        $('#imgmap').css({
          'width' : width - 50 + 'px'
        });
        break;
      case "profil" :
        infoBox.html(title);
        infoBox.append(this.model.get("profil"));
        break;
      case "son" :
        infoBox.html(title);
        infoBox.append(this.model.get("son"));
        break;
      case "aide" :
        infoBox.html(title);
        infoBox.append(this.model.get("aide"));
        break;
      case "param" :
        infoBox.html(title);
        infoBox.append('<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>');
        break;
      case "quit" :
        break;
      default:
        break;
    }
  },

  closeInfo: function (){
    $("#infoBox").css({'display' : 'none'});
    $("#infoBox").html("");
  }

});
