"use strict";

function GAPoint(){
  var precision = 16;
  this.x1 = Array(precision);
  this.x2 = Array(precision);
  
  var getSinglePoint = function( xval ){
    var val = -6;
    for( var i = 0; i< precision; i++ ){
      if( xval[i] ){
        val += 6.0 * Math.pow(0.5, i);
      }
    }
    return val;
  }

  this.getValue = function(){
    return [ getSinglePoint( this.x1 ), getSinglePoint( this.x2 ) ];
  }
  this.getFunctionValue = function( f ){
    if( this.fvalue === undefined ){
      var x = this.getValue();
      this.fvalue = f( x[0], x[1] );
    }
    return this.fvalue;

  }
}

function getRandomGAPoint(){
  var point = new GAPoint();
   var randomizeBool = function(){
    var a;
    if(Math.random()<.5){
      a = true;
    } else {
      a = false;
    }
    return a;
  };
  for( var i = 0; i< point.x1.length; i++ ){
    point.x1[i] = randomizeBool();
    point.x2[i] = randomizeBool();
  }
  return point;
}

function getSeveralRandomGAPoints( N ){
  var points = Array(N);
  for( var i = 0; i< N; i++ ){
    points[i] = getRandomGAPoint();
  }
  return points;
}

function drawGAPoints( points, colour ){

  points.forEach( function(p) {
    var x = p.getValue();
    drawPoint( x[0], x[1], colour );
  } );

}


function swapPoints( points, i, j ){
  var tmp = points[i];
  points[i] = points[j];
  points[j] = tmp;
} 

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fisherYatesShuffle( list ){
  for( var i = 0; i< list.length; i++ ){
    var j = getRandomInt( i, list.length -1 );
    swapPoints( list, i,  j);
  }
}


function split(a, n) {
  var len = a.length;
  var out = [];
  var i = 0;
  while (i < len) {
    var size = Math.ceil((len - i) / n--);
    out.push(a.slice(i, i += size));
  }
  return out;
}

function tournamentSelect( points, f, groups ){

  var size = points.length / groups;
  fisherYatesShuffle( points );
  var splitGroups = split( points, groups ); 
  var comparer = function( a, b ){
    return a.getFunctionValue(f) < b.getFunctionValue(f) ? a : b;
  }

  var selected = [];

  splitGroups.forEach( function(g){
    selected.push( g.min(comparer) );
  } );
  return selected;
}

function fitnessProportionateSelect( points, f, N ){
  var sum = 0;
  //the function has range that's roughly -100 to 100
  // it goes a little lower than this, but we can still use 100 - function as a 
  // fitness score
  points.forEach( function(p){
    sum += 100 - p.getFunctionValue(f);
  } );
  var selected = [];
  for( var i = 0; i < N; i++ ){
    var r = Math.random();
    var j = 0;
    while( r > 0 && j < points.length ){ 
      r -= (100-points[j].getFunctionValue(f))/sum;
      j++;
    }
    if( points[j-1] === undefined ) alert("scary");
    selected.push( points[j-1] );
  }
  return selected;
}

function doSingleValCrossover( p1, p2, c1, c2, val ){
  var crossoverPoint1 = getRandomInt( 1, 
    Math.floor( ( p1[val].length -1) * 0.75 ) );
  var crossoverPoint2 = getRandomInt( crossoverPoint1,  p1[val].length );
  for( var i = 0; i < p1.x1.length; i++ ){
    if( i < crossoverPoint1 || i > crossoverPoint2 ){
      c1[val][i] = p1[val][i];
      c2[val][i] = p2[val][i];
    } else {
      c2[val][i] = p1[val][i];
      c1[val][i] = p2[val][i];
    }
  }
}

function crossTwoPoints( p1, p2 ){
  var c1 = new GAPoint(); 
  var c2 = new GAPoint();
  doSingleValCrossover( p1, p2, c1, c2, "x1" );
  doSingleValCrossover( p1, p2, c1, c2, "x2" );
  return [c1, c2];
}


function breedPoints( selectedPoints, nextGenSize ){
  var newPoints = [];
  for( var i = 0; i < nextGenSize/2; i += 1){
    // pair each point in turn with a random point, and breed them 
    newPoints = newPoints.concat( 
      crossTwoPoints( 
        selectedPoints[i%selectedPoints.length],
        selectedPoints[getRandomInt(0, selectedPoints.length-1)]
      )
    );
  }
  return newPoints;
}


function mutatePoint( point, value ){
  var bit = getRandomInt( 0, point[value].length -1 );
  if( point[value][bit]  ){
    point[value][bit] = false;
  } else {
    point[value][bit] = true;
  }
}

function getMutationRate(){
  return document.getElementById( "gamutate" ).value;
}

function mutatePoints(points){

  var mutationProbability = getMutationRate();

  points.forEach( function(p){
    if( Math.random() < mutationProbability ){
      var value = "x1";
      if(Math.random() < 0.5 ){
        value = "x2";
      }
      mutatePoint( p, value );
    }
  } );
}

function updateGAMinimumHistory( points, f, minimumHistory ){
  var comparer = function( a, b ){
    return a.getFunctionValue(f) < b.getFunctionValue(f) ? a : b;
  }

  var min = points.min(comparer)
  var x = min.getValue();
  var y = min.getFunctionValue( f );

  if( minimumHistory.length === 0 ||
    minimumHistory[minimumHistory.length-1].y > y ){
    var o = {};
    o.x1 = x[0];
    o.x2 = x[1];
    o.y = y;
    o.evaluations = getEvalCount();
    minimumHistory.push( o );
  }
}


function getGAPopulation(){
  return document.getElementById( "gapopulation" ).value;
}

function getGAParentsCount(){
  return document.getElementById( "gaparents" ).value;
}

function getGAParents(points, f){
  var stratergy = document.getElementById( "gastratergy" ).value;
  if( stratergy === "tournament" ){
    return  tournamentSelect( points, f, getGAParentsCount() );
  } else if( stratergy === "frequency" ){
    return fitnessProportionateSelect( points, f, getGAParentsCount() );
  }
}

function GAItteration( points, f, minimumHistory ){
  clear_screen();

  drawGAPoints( points, "green" );

  var reproducing = getGAParents(points,  f );

  drawGAPoints( reproducing, "red" );

  var nextGen = breedPoints(reproducing, points.length);

  updateGAMinimumHistory( points, f, minimumHistory);

  var last = minimumHistory[minimumHistory.length-1];

  drawPoint( last.x1, last.x2, "blue" );

  mutatePoints( nextGen );

  if( getEvalCount() < 1000 - nextGen.length){
    window.setTimeout( function(){
      GAItteration( nextGen, f, minimumHistory );
    }, getItterationPause() );
  } else {
    logMinimumHistory( minimumHistory );
    finishRunning();
  }
}

function genetic_algorithm( f ){
  resetEvalCount();
  var nPoints = getGAPopulation();
  var points = getSeveralRandomGAPoints(nPoints);
  setRunning();
  GAItteration(points, f, []);
}
