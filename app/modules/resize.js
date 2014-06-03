/**
  Module de redimensionnement 
  @module resize
*/

App.Models.Canvas = Backbone.Model.extend( /** @lends module:resize.Canvas.prototype */ {
  defaults: {
    'height': window.innerHeight,
    'width': window.innerWidth,
    'ratio': 1.6
  },

  /**
  * @property {object}  defaults
  * @property {number}  defaults.height
  * @property {number}  defaults.width
  * @property {number}  defaults.ratio
  * @augments Backbone.Model
  * @constructs
  */
  initialize: function ( ) {
    this.resize( );
  },

  /**
    Redimensionnement
  */
  resize: function ( ) {
    var height = this.get( 'height' ),
      width = this.get( 'width' ),
      ratio = this.get( 'ratio' ),
      canWidth = ratio * height,
      canHeight = width / ratio;

    if ( this.get( "registering" ) ) {
      this.sizeRegister( width, height );
    }
    if ( width >= canWidth ) {
      this.setSize( 0, ( width - canWidth ) / 2, canWidth, height );
    } else {
      this.setSize( ( height - canHeight ) / 2, 0, width, canHeight );
    }
  },

  /**
    Dimensionnement
    @param {number} top
    @param {number} left
    @param {number} width
    @param {number} height
  */
  setSize: function ( top, left, width, height ) {
    var mapCan = $( "#mapCanvas" )[ 0 ],
      charCan = $( "#charactersCanvas" )[ 0 ],
      contCan = $( "#canvasContainer" ),
      navbar = $("#navbar"),
      isMobile = App.mobilecheck(),
      navbarWidth = 1084;
      if(/WebKit/.test(navigator.userAgent)){
        $("#messaging").css({'position' : 'relative', 'bottom' : '22px'})
      }
    this.set( {
      'height': height,
      'width': width
    }, {
      silent: true
    } );

    contCan.css( {
      'top': top + 'px',
      'left': left + 'px'
    } );
    if(isMobile){
      $("#messageInput").css({'display': 'none'});
      navbar.css({'width': '710px'});
      navbarWidth = 734;
      $(".spaced").css({'margin-right' : '40px'});
      $(".navbutton").css({'margin-left' : '8px'});
    }
    navbar.css({
        'top' : height - 84 + 'px',
        'left' : (width-navbarWidth)/2 + 'px' 
    });
    $("#infoBox").css({
      'width': width - 200 + 'px',
      'height': height - 200 + 'px',
      'top' : '50px',
      'left' : '80px'
    });
    $('#imgmap').css({
      'max-width' : width - 250 + 'px',
      'max-height': height - 320 + 'px'
    });
    var imgWidth = $('#imgmap').width();
      $('#imgmap').css({
        'margin-right' : (width - 200 - imgWidth)/2,
        'margin-left' : (width -200 - imgWidth)/2
    });

    mapCan.width = width;
    mapCan.height = height;
    charCan.width = width;
    charCan.height = height;
    app.trigger( 'resized:ok', width, height );
  },

  /**
    Taille écran de connexion
    @param {number} width
    @param {number} height
  */
  sizeRegister: function ( width, height ) {
    var cont = $( "#regCont" ),
      playName = $( "#register" );

    playName.css( {
      "left": ( width - playName.width( ) ) / 2 + "px",
      "top": ( height - playName.height( ) ) / 2 + "px"
    } );
    cont.css( {
      "width": width + "px",
      "height": height + "px",
      "display": "block"
    } );
  }
} );

App.Views.Screen = Backbone.View.extend( /** @lends module:resize.Screen.prototype */ {
  /** @type {string} */
  el: '#myCanvas',

  /** @constructs */
  initialize: function ( ) {
    var win = $( window ),
    isMobile = App.mobilecheck();

    $( "#loading" ).remove();
    $( "#message" ).css( "display", "block" );
    win.on( 'resize', {
      that: this
    }, this.resize );
    if(isMobile){
      this.model.set( {
        'height': window.innerHeight,
        'width': window.innerWidth
      } );
      this.resizeWin();
    }else{
      this.model.on( 'change', this.resizeWin, this );
      this.model.set( {
        'height': window.innerHeight,
        'width': window.innerWidth
      } );
    }
    this.listenTo( app, 'resize:on', this.resizeCan );
  },

  /**
    Redimensionnement
  */
  resize: function ( e ) {
    var that = e.data.that;
    that.model.set( {
      'height': window.innerHeight,
      'width': window.innerWidth
    } );
  },

  resizing: {},

  /**
    Redimensionnement
  */
  resizeCan: function ( ) {
    this.model.resize( );
  },

  /**
    Redimensionnement
  */
  resizeWin: function ( ) {
    clearTimeout( this.resizing );
    var that = this;
    this.resizing = setTimeout( function ( ) {
      app.trigger( 'resize:on', that.model.toJSON( ) );
    }, 100 );
  },
} );