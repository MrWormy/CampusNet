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
