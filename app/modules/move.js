App.Models.move = Backbone.Model.extend( {
  animating: {},

  handleMove: function ( scope, way ) {
    var container = scope.stage.getChildAt( 0 ),
      that = this,
      model = scope.model,
      tileW = model.get( "tilewidth" ),
      tileH = model.get( "tileheight" );
    clearInterval( this.animating );
    this.animating = setInterval( function ( ) {
      var currentTarget = way.shift( );
      if ( !currentTarget )
        clearInterval( that.animating )
      else
        that.moveIt( model, container, currentTarget, tileW, tileH );
    }, 90 );
  },

  moveIt: function ( model, container, currentTarget, tw, th ) {
    var x = currentTarget.j * tw,
      y = currentTarget.i * th,
      currentX = model.get( "currentX" ),
      currentY = model.get( "currentY" );
    container.x += currentX - x;
    container.y += currentY - y;
    model.set( {
      "currentX": x,
      "currentY": y
    } );
  },

  findAway: function ( fromI, fromJ, toI, toJ, layerWidth ) {
    var i, j, neighbor, iN, Ni, Nj, tempCost, tempRes, openCases = [ {
        "i": fromI,
        "j": fromJ,
        "cost": 0,
        "hCost": Math.abs( toI - fromI ) + Math.abs( toJ - fromJ )
        } ],
      closedCases = [ ],
      compteur = 0,
      hashMove = toI * layerWidth + toJ,
      cameFrom = {};

    if ( App.map[ toI * layerWidth + toJ ] > 1 )
      return [ hashMove, [ ] ];
    while ( openCases[ 0 ] ) {
      compteur++;
      tempRes = this.nextCase( openCases );
      currentCase = tempRes[ 0 ];
      openCases = tempRes[ 1 ];
      closedCases.push( currentCase );
      i = currentCase.i;
      j = currentCase.j;
      if ( i == toI && j == toJ ) {
        return [ hashMove, this.buildAway( cameFrom, i, j ) ];
      }
      if ( compteur == 1000 ) {
        var minHcost = this.closestCase( closedCases );
        return [ hashMove, this.buildAway( cameFrom, minHcost.i, minHcost.j ) ];
      }
      for ( var h = 0; h < 4; h++ ) {
        Ni = i + ( ( h + 1 ) % 2 ) * ( h - 1 );
        Nj = j + ( h % 2 ) * ( 2 - h );
        neighbor = {
          "i": Ni,
          "j": Nj
        };
        if ( this.isIn( neighbor, closedCases ) + 1 )
          continue;
        tempCost = currentCase.cost + 1;
        iN = this.isIn( neighbor, openCases );
        if ( App.map[ Ni * layerWidth + Nj ] < 2 && ( iN == -1 || openCases[ iN ].cost > tempCost ) ) {
          ( cameFrom[ Ni.toString( ) ] || ( cameFrom[ Ni.toString( ) ] = {} ) ) && ( cameFrom[ Ni.toString( ) ][ Nj.toString( ) ] = {
            "i": i,
            "j": j
          } );
          neighbor.cost = tempCost;
          neighbor.hCost = tempCost + Math.abs( toI - neighbor.i ) + Math.abs( toJ - neighbor.j );
          ( iN == -1 && openCases.unshift( neighbor ) ) || ( openCases[ iN ] = neighbor );
        }
      }
    }
    return [ hashMove, [ ] ];
  },


  buildAway: function ( cameFrom, a, b ) {
    var next, result, current = {
        "i": a,
        "j": b
      };
    if ( ( next = cameFrom[ a.toString( ) ] ) && ( next = next[ b.toString( ) ] ) ) {
      result = this.buildAway( cameFrom, next.i, next.j );
      result.push( current );
      return result;
    } else return [ current ];
  },

  isIn: function ( a, l ) {
    var temp, i = a.i,
      j = a.j;
    for ( var k = 0; k < l.length; k++ ) {
      temp = l[ k ];
      if ( i == temp.i && j == temp.j )
        return k;
    }
    return -1;
  },

  nextCase: function ( openCases ) {
    var result, caseMin, tempMin, costMin = openCases[ 0 ].hCost,
      iMin = 0,
      n = openCases.length;
    for ( var i = 1; i < n; i++ ) {
      ( tempMin = openCases[ i ].hCost ) && tempMin < costMin && ( iMin = i ) && ( costMin = tempMin );
    }
    min = openCases[ iMin ];
    result = openCases.slice( 0, iMin ).concat( openCases.slice( iMin + 1 ) );
    return [ min, result ];
  },

  closestCase: function ( closedCases ) {
    var caseMin, tempMinCost, tempMinHcost, costMin = closedCases[ 0 ].cost,
      hCostMin = closedCases[ 0 ].hCost,
      iMin = 0,
      n = closedCases.length;
    for ( var i = 1; i < n; i++ ) {
      ( ( tempMinHcost = closedCases[ i ].hCost ) && ( tempMinCost = closedCases[ i ].cost ) ) && tempMinHcost <= hCostMin && tempMinCost > costMin && ( iMin = i ) && ( hCostMin = tempMinHcost ) && ( costMin = tempMinCost );
    }
    min = closedCases[ iMin ];
    return min;
  }

} );
