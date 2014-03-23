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

    if ( this.get( "registering" ) ) {
      this.sizeRegister( width, height );
    }
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
  },

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

App.Views.Screen = Backbone.View.extend( {
  el: '#myCanvas',

  initialize: function ( ) {
    var win = $( window );

    $( "#loading" ).remove();
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
