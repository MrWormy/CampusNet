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


App.Views.CanvasView = Backbone.View.extend( {

  el: '#myCanvas',

} );
