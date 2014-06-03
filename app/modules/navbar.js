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
    this.listenTo(app, 'close:info', this.closeInfo);
  },

  navAction: function (e){
    var title = "<h1> - " + e.target.title + " - </h1>",
      infoBox = $("#infoBox");
    switch(e.target.id){
      case "quetes" :
        console.log("quetes");
        infoBox.html(title);
        infoBox.append('<div class="info">Aucune quête en cours</div>');
        infoBox.css({'display' : 'block'});
        break;
      case "discussion" :
        console.log("discussion");
        infoBox.html(title);
        infoBox.css({'display' : 'block'});
        break;
      case "carte" :
        console.log("carte");
        infoBox.html(title);
        var width = infoBox.css("width").slice(0,-2),
          height = infoBox.css('height').slice(0,-2);
        infoBox.append('<img id="imgmap" src="./assets/resources/img/carte.png"><br>');
        $('#imgmap').css({
          'max-width' : width - 50 + 'px',
          'max-height': height - 120 + 'px',
        });
        infoBox.css({'display' : 'block'});
        break;
      case "profil" :
        console.log("profil");
        infoBox.html(title);
        infoBox.append('<div class="info">Pseudo : Inconnu<br><br>Biographie : <br><br>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed malesuada semper augue eu scelerisque. Vestibulum accumsan iaculis erat, ut malesuada purus rutrum in. Nulla malesuada tincidunt velit, a vehicula magna commodo eu. Vivamus neque ipsum, vestibulum in imperdiet vel, porttitor sit amet lectus. Vivamus cursus, odio in imperdiet gravida, magna magna consequat leo, ac iaculis enim sem sit amet tortor. Aenean pharetra rutrum turpis vitae molestie. Curabitur interdum sit amet dolor sit amet sagittis.<br><br>Avatar :<br><img src="assets/resources/img/select/etu-m/brown-blue.png"> </div>');
        infoBox.css({'display' : 'block'});
        break;
      case "son" :
        console.log("son");
        infoBox.html(title);
        infoBox.append('<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>');
        infoBox.css({'display' : 'block'});
        break;
      case "aide" :
        console.log("aide");
        infoBox.html(title);
        infoBox.append('<div class="info">Bienvenue sur Campusnet v2.<br><br>Bientôt vous pourrez trouvez l\'aide pour le jeu ici.<br><br>Crédits:<br><br>Campusnet v2 a été développé par Nicolas Benning, Thomas Laurence, Bilgé Kimyonok et Benoît Koenig.</div>');
        infoBox.css({'display' : 'block'});
        break;
      case "param" :
        console.log("param");
        infoBox.html(title);
        infoBox.append('<div class="info">Cette fonctionnalité n\'a pas encore été implémentée</div>');
        infoBox.css({'display' : 'block'});
        break;
      case "quit" :
        console.log("quit");
        break;
      default:
        break;
    }
  },

  closeInfo: function (){
    $("#infoBox").css({'display' : 'none'});
  }

});