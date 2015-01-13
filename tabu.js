"use strict";

// Tabu Point class
function TabuPoint( f, x1, x2 ){
  this.x1 = x1 || 0;
  this.x2 = x2 || 0;

  this.getValue = function(){
    return [this.x1, this.x2];
  }

  // Get the value of the tabu point, the value is cached
  var lastCalled;
  this.getFValue = function(){
    if( lastCalled === undefined || !(this.isEqual( lastCalled )) ){
      this.fValue = f( this.x1, this.x2 );
      lastCalled = this.clone();
    }
    return( this.fValue );
  }
  // Is this tabu point equal to another
  this.isEqual = function( p ){
    if( p.x1 === this.x1 && p.x2 === this.x2 ){
      return true;
    }
    return false;
  }
  // Duplicate an instance of this class
  this.clone = function(){
    var o = new TabuPoint( f, this.x1, this.x2 );
    o.lastCalled = this.lastCalled;
    o.fValue = this.fValue;
    return o;
  }
  //Check if the point is within the function range
  this.valid = function(){
    if( Math.abs( this.x1 ) <= 6.0 && Math.abs( this.x2 ) < 6.0 ){
      return true;
    }
    return false;
  }
}

// function used for searching arrays

// Return the lowest value of two points
function tabuMin( a, b ){
  return a.getFValue() < b.getFValue() ? a : b;
}

// Return the highest value of two points
function tabuMax( a, b ){
  return a.getFValue() < b.getFValue() ? a : b;
}

function considerForMediumTermMemory( memory, point, size ){
  if( memory.length < size ){
    memory.push( point );
  } else {
    var max = memory.max( tabuMax )
    if( max.getFValue() > point.getFValue() ){
      // add the point     
      var rIndex = memory.indexOf( max );
      memory.splice( rIndex, 1, point );
    }
  }
}


function addToMemory( memory, value, memSize ){
  memory.push( value );
  if( memory.length > memSize ){
    memory.splice( 0, memory.length - memSize );
  }
}

function getAveragePoint( memory, f ){
  var x1 = 0, x2 = 0;
  memory.forEach( function(m){
    x1 += m.x1/memory.length;
    x2 += m.x2/memory.length;
  } );
  return new TabuPoint( f, x1, x2 );
}

function setupLongTermMemory(size){
  var m = Array(size);
  for( var i = 0; i< size; i++ ){
    m[i] = Array( size );
    for( var j = 0; j< size; j++ ){
      m[i][j] = 0;
    }
  }
  return m;
}

function addToLongTermMemory(memory, point){
  var i =  Math.floor( memory.length*( point.x1 + 6 )/12.01 );
  var j =  Math.floor( memory.length*( point.x2 + 6 )/12.01 );
  memory[i][j] +=1;
}

function getDiversePointFromLongTermMemory(memory, f){
  for( var i = 0; i< memory.length; i++ ){
    for( var j = 0; j< memory[i].length; j++ ){
      if( memory[i][j] === 0 ){
        memory[i][j] = 1;
        window.console.log( "i: " + i + ", j: " + j + ", m:" + memory[i][j]); 
        return new TabuPoint( f,
          12 * ((i+0.5)/memory.length) - 6, 
          12 * ((j+0.5)/memory.length) - 6
        );
      }
    }
  }
  return new TabuPoint( f, 0, 0 );
}

function updateTabuMinimumHistory( minimumHist, minimum ){
  var o = {
    evaluations: getEvalCount(),
    x1: minimum.x1,
    x2: minimum.x2,
    y: minimum.getFValue()
  };
  minimumHist.push( o );
}

function getShortSize(){
  return document.getElementById( "tabushort" ).value;
}
function getMediumSize(){
  return document.getElementById( "tabumedium" ).value;
}
function getLongSize(){
  return document.getElementById( "tabulong" ).value;
}
function getIntensifyStep(){
  return document.getElementById( "tabuintensify" ).value;
}
function getDiversifyStep(){
  return document.getElementById( "tabudiversify" ).value;
}
function getReduceStep(){
  return document.getElementById( "tabustepreduce" ).value;
}


function tabu_search( f ){
  
  var shortTerm = [];
  var mediumTerm = [];
  var longTerm = setupLongTermMemory(getLongSize()); 

  var minimumHist = [];

  var point = new TabuPoint( f, 0, 0 );
  var minimum = point;

  var initialInterval = 1;
  var interval = initialInterval;
  minimum.interval = initialInterval;

  resetEvalCount();
  updateTabuMinimumHistory( minimumHist, minimum );
  
  setRunning();

  var isInShortTermMem = function( p ){
    var found = false;
    shortTerm.forEach( function( s ){
      if( s.isEqual( p ) ){
        found = true;
      }
    }); 
    return found;
  };

  var improvementCounter = 0;

  clear_screen();

  var step = function(){
    var nextSteps = [];
    ["x1", "x2"].forEach( function( param ){
      var inc = point.clone();
      var dec = point.clone();
      inc[param] += interval;
      dec[param] -= interval;
      if( !isInShortTermMem( inc ) && inc.valid() ){
        nextSteps.push( inc );
      }
      if( !isInShortTermMem( dec ) && dec.valid() ){
        nextSteps.push( dec );
      }
    } );
    var best = nextSteps.min( tabuMin );
    if( nextSteps.length === 0 ){
      window.console.log( "All points are Tabu" );
      best = point; 
    } 

    // Colour to draw the next point
    var colour = "green";

    if( best.getFValue() < point.getFValue() ){
      //pattern move
      var change = { x1: best.x1 - point.x1, x2: best.x2 - point.x2 };
      var pattern = point.clone();
      pattern.x1 += 2.0 * change.x1;
      pattern.x2 += 2.0 * change.x2;
      if( pattern.getFValue() < best.getFValue() && pattern.valid() ){
        best = pattern;
        colour = "GreenYellow";
      }
    }

    // store old point for Line Drawing purposes
    var oldPoint = point;

    point = best;

    addToMemory( shortTerm, best, getShortSize() );
    considerForMediumTermMemory( mediumTerm, best, getMediumSize() );
    addToLongTermMemory( longTerm, best );   

    improvementCounter += 1;
    if( point.getFValue() < minimum.getFValue() ){
      improvementCounter = 0;
      minimum = point;
      minimum.interval = interval;
      updateTabuMinimumHistory( minimumHist, minimum );
    }

    window.console.log
    if( improvementCounter == getIntensifyStep() ){
      //Intensify
      window.console.log( "intensifying" );
      point = getAveragePoint( mediumTerm, f );
      colour = "red";
    } else if( improvementCounter == getDiversifyStep() ) {
      //Diversify
      window.console.log( "diversifying" );
      point = getDiversePointFromLongTermMemory(longTerm, f);
      window.console.log( " point: " + point.x1 + ", " + point.x2 );
      // clear the minimum term memory
      mediumTerm = [];
      //reset the step Size
      interval = initialInterval;
      colour = "cyan";
    } else if( improvementCounter == getReduceStep() ){
      //Step Size Reduction
      window.console.log( "Step Size Reduce" );
      point = minimum;
      minimum.interval = 0.5 * minimum.interval;
      interval = minimum.interval;
      colour = "yellow"
      improvementCounter = 0;
    } else {
      connectPoints( oldPoint.x1, oldPoint.x2, point.x1, point.x2 );
    }
    drawPoint( point.x1, point.x2, colour );

    if( point.getFValue() < minimum.getFValue() ){
      improvementCounter = 0;
      minimum = point;
      minimum.interval = interval;
      updateTabuMinimumHistory( minimumHist, minimum );
    }

    if( getEvalCount() < 1000 - 10 ){
      window.setTimeout( step, getItterationPause() );
    } else {
      drawPoint( minimum.x1, minimum.x2, "blue" );
      logMinimumHistory( minimumHist );
      finishRunning();
    }
  }
  step();
}
