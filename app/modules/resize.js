App.Models.Canvas = Backbone.Model.extend( {
  defaults: {
    'height': window.innerHeight,
    'width': window.innerWidth,
    'ratio': 1.6
  },

  initialize: function ( ) {
    this.resize( );
  },

  resize: function ( ) {
    var height = this.get( 'height' ),
      width = this.get( 'width' ),
      ratio = this.get( 'ratio' ),
      canWidth = ratio * height,
      canHeight = width / ratio;

    if ( width >= canWidth ) {
      this.setSize( 0, ( width - canWidth ) / 2, canWidth, height );
    } else {
      this.setSize( ( height - canHeight ) / 2, 0, width, canHeight );
    }
  },

  setSize: function ( top, left, width, height ) {
    var mapCan = $( "#mapCanvas" )[ 0 ],
      charCan = $( "#charactersCanvas" )[ 0 ],
      contCan = $( "#canvasContainer" );
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

    mapCan.width = width;
    mapCan.height = height;
    charCan.width = width;
    charCan.height = height;
    app.trigger( 'resized:ok', width, height );
  }
} );

App.Views.Screen = Backbone.View.extend( {
  el: '#myCanvas',

  initialize: function ( ) {
    var win = $( window );

    $( "#loading" ).css( "display", "none" );
    $( "#message" ).css( "display", "block" );
    win.on( 'resize', {
      that: this
    }, this.resize );
    this.model.on( 'change', this.resizeWin, this );
    this.model.set( {
      'height': window.innerHeight,
      'width': window.innerWidth
    } );
    this.listenTo( app, 'resize:on', this.resizeCan );
    this.displayRegister( );
  },

  displayRegister: function ( ) {
    var shadow = $( "#shadow" ),
      regForm = $( "#register" ),
      innW = window.innerWidth,
      innH = window.innerHeight;

    shadow.css( {
      "display": "block",
      "width": innW + 'px',
      "height": innH + 'px'
    } );
    regForm.css( {
      "display": "block",
      "left": ( innW - regForm.width( ) ) / 2 + 'px',
      "top": ( innH - regForm.height( ) ) / 2 + 'px'
    } );

  },

  resize: function ( e ) {
    var that = e.data.that;
    that.model.set( {
      'height': window.innerHeight,
      'width': window.innerWidth
    } );
  },

  resizing: {},

  resizeCan: function ( ) {
    this.model.resize( );
  },

  resizeWin: function ( ) {
    clearTimeout( this.resizing );
    var that = this;
    this.resizing = setTimeout( function ( ) {
      app.trigger( 'resize:on', that.model.toJSON( ) );
    }, 100 );
  },
} );
