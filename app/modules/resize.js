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
      this.setSize( 0, canWidth, height );
    } else {
      this.setSize( ( height - canHeight ) / 2, width, canHeight );
    }
  },

  setSize: function ( margin, width, height ) {
    var myCan = $( "#myCanvas" ),
      myCanProp = myCan[ 0 ];

    this.set( {
      'height': height,
      'width': width
    }, {
      silent: true
    } );

    myCan.css( {
      'margin-top': margin + 'px'
    } );

    myCanProp.width = width;
    myCanProp.height = height;
    app.trigger( 'resized:ok', width, height );
  }
} );

App.Views.Screen = Backbone.View.extend( {
  el: '#myCanvas',

  initialize: function ( ) {
    var win = $( window );
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
