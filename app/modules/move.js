App.Models.move = Backbone.Model.extend( {
  defaults: {
    'moveX': 0,
    'moveY': 0
  },

  initiateMove: function ( moveX, moveY ) {
    var formerMoveX = this.get( "moveX" ),
      formerMoveY = this.get( "moveY" );

    console.log( moveX, moveY, formerMoveX, formerMoveY );
    this.set( {
      'moveX': moveX - formerMoveX,
      'moveY': moveY - formerMoveY
    } );
  },

  animating: {},

  handleMove: function ( scope ) {
    var that = this,
      container = scope.stage.getChildAt( 0 ),
      step = scope.model.get( "tilewidth" ),
      moveX = this.get( "moveX" ),
      moveY = this.get( "moveY" );
    clearInterval( this.animating );
    this.animating = setInterval( function ( ) {
      if ( moveX == 0 && moveY == 0 )
        clearInterval( that.animating );
      else if ( moveX == 0 ) {
        if ( moveY > 0 )
          that.moveIt( scope, container, "Y", step, moveY -= step );
        else
          that.moveIt( scope, container, "Y", -step, moveY += step );
      } else {
        if ( moveX > 0 )
          that.moveIt( scope, container, "X", step, moveX -= step );
        else
          that.moveIt( scope, container, "X", -step, moveX += step );
      }
    }, 90 );
  },

  moveIt: function ( scope, container, direction, step, newValue ) {
    var directionZ = 'current' + direction,
      newCurrent = scope.model.get( directionZ ) + step;
    container[ direction.toLowerCase( ) ] -= step;
    scope.model.set( directionZ, newCurrent );
    this.set( 'move' + direction, newValue, {
      silent: true
    } );
  },

  findAway: function ( fromI, fromJ, toI, toJ, layerWidth ) {
    console.log(layerWidth);
    var way = [ ],
      tempMap = App.map.slice( 0 );
    if ( App.map[ toI * layerWidth + toJ ] > 1 )
      return way;
    else {
      var currentI = fromI,
        currentJ = fromJ,
        coord = currentI * layerWidth + currentJ,
        currentNext;
      while ( currentI != toI || currentJ != toJ ) {
        currentNext = this.nextCase( tempMap, currentI, currentJ, toI, toJ, layerWidth );
        if ( currentNext == -1 ) {
          tempMap[ coord ] = 3;
          currentNext = way.pop( );
          if ( typeof ( currentNext ) === "undefined" )
            return [ ]
          currentI = currentNext.i;
          currentJ = currentNext.j;
        } else {
          tempMap[ coord ] = 3;
          way.push( currentNext );
          currentI = currentNext.i;
          currentJ = currentNext.j;
        }
      }
      return way;
    }
  },

  nextCase: function ( tempMap, fromI, fromJ, toI, toJ, layerWidth ) {
    var nextCases = this.nextCases( fromI, fromJ, toI, toJ );
    for ( var k = 0; k < 4; k++ ) {
      var tempCase = nextCases[ k ],
        i = tempCase.i,
        j = tempCase.j,
        coord = i * layerWidth + j;
      if ( tempMap[ coord ] && tempMap[ coord ] < 3 )
        return tempCase;
    }
    return -1;
  },

  nextCases: function ( fromI, fromJ, toI, toJ ) {
    var diffI = ( toI - fromI ) > 0,
      diffJ = ( toJ - fromJ ) > 0,
      absDiffIJ = Math.abs( toI - fromI ) > Math.abs( toJ - fromJ ),
      f = this.priority,
      priorities = [ f( !diffI, absDiffIJ ), f( diffJ, !absDiffIJ ), f( diffI, absDiffIJ ), f( !diffJ, !absDiffIJ ) ];

    return this.returnPos( fromI, fromJ, priorities );
  },

  returnPos: function ( i, j, next ) {
    var tempReturn = [ ];
    for ( var h = 0; h < next.length; h++ ) {
      var k = next[ h ];
      tempReturn[ k ] = ( {
        "i": i + ( ( h + 1 ) % 2 ) * ( h - 1 ),
        "j": j + ( h % 2 ) * ( 2 - h )
      } );
    }
    return tempReturn;
  },



  priority: function ( a, b ) {
    return ( 3 - ( a * ( b + 2 ) + !b * !a ) );
  }
} );
