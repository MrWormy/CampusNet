App.Models.Canvas = Backbone.Model.extend( {
  defaults: {
    'height': window.innerHeight,
    'width': window.innerWidth,
    'ratio': 1.6
  },

  initialize: function ( ) {
    this.resize( this.toJSON( ) );
  },

  resize: function ( ) {
    var height = this.get( 'height' ),
      width = this.get( 'width' ),
      ratio = this.get( 'ratio' ),
      myCan = $( "#myCanvas" ),
      myCanProp = myCan[ 0 ],
      canWidth = ratio * height,
      canHeight = width / ratio;

    if ( width >= canWidth ) {

      this.set( {
        'height': height,
        'width': canWidth
      }, {
        silent: true
      } );

      myCan.css( {
        'margin-top': 0 + 'px'
      } );

      myCanProp.width = canWidth;
      myCanProp.height = height;
    } else {

      this.set( {
        'height': canHeight,
        'width': width
      }, {
        silent: true
      } );

      myCan.css( {
        'margin-top': ( height - canHeight ) / 2 + 'px'
      } );

      myCanProp.width = width;
      myCanProp.height = canHeight;
    }

    app.trigger( 'resized:ok', this.get( "width" ), this.get( "height" ) );
  }
} );


App.Views.CanvasView = Backbone.View.extend( {

  el: '#myCanvas',

  initialize: function ( ) {
    var that = this;

    App.Images.tyleset = new Image( );
    App.Images.tyleset.src = "assets/resources/img/tilesheet.png"
    App.Images.tyleset.onload = function ( ) {
      that.afterLoad( );
    };
  },

  afterLoad: function ( ) {
    var maps = new App.Collections.Maps( ),
      firstMap = new App.Models.Map( {
        id: 1
      } );

    maps.add( firstMap );
    maps.fetch( {

      success: function ( coll, resp, opt ) {
        firstMap.initMap( );
        console.log( 'Données chargées' );
        var myCanvas = new App.Models.Canvas( );
        var screenView = new App.Views.Screen( {
          model: myCanvas
        } );
        var drawingView = new App.Views.DrawMap( {
          model: firstMap
        } );
      },

      error: function ( coll, resp, opt ) {
        console.log( 'Une erreur c\' est dûr' );
        $( 'body' ).html( 'Une erreur est survenue lors du chargement des données !' )
      }

    } );
  }

} );
