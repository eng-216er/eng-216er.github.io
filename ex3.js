"use strict";

function draw_background( canvas, ctx ){
  var backgroundElem = document.getElementById( "birdFunctionContour" );
  ctx.clearRect ( 0 , 0 , canvas.width, canvas.height );
  ctx.drawImage( backgroundElem, 0, 0, canvas.width, canvas.height );
}

function clear_screen(){
  var [canvas, context] = getCanvasAndContext();
  draw_background( canvas, context );
}

var evalCount = 0;
var resetEvalCount = function(){
  evalCount = 0;
};
var getEvalCount = function(){
  return evalCount;
}

function bird_function( x1, x2 ){ 
  evalCount = evalCount + 1;
  var y = Math.sin(x1) * Math.exp( Math.pow(1 - Math.cos(x2),2 ) ) +  
      Math.cos(x2) * Math.exp ( Math.pow(1 - Math.sin(x1), 2) )+ 
      Math.pow(x1 - x2, 2);
  return y;
}

var getCanvasAndContext;

var drawPoint = function( x1, x2, colour ){
  var [canvas, context] = getCanvasAndContext();
  var centerX = canvas.width * ( x1 + 6 )/12; 
  var centerY = canvas.height * ( -x2 + 6 ) /12;
  var radius = 2;
  //window.console.log( "X1: " + x1 + " X2: " + x2 );
  context.beginPath();
  context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
  context.fillStyle =  colour || 'green';
  context.fill();
  context.lineWidth = 1;
  context.strokeStyle = 'black';
  context.stroke();
}
var connectPoints = function( a1, a2, b1, b2 ){
  var [canvas, context] = getCanvasAndContext();
  var aX = canvas.width * ( a1 + 6 )/12; 
  var aY = canvas.height * ( -a2 + 6 ) /12;
  var bX = canvas.width * ( b1 + 6 )/12; 
  var bY = canvas.height * ( -b2 + 6 ) /12;

  context.beginPath();
  context.moveTo(aX, aY);
  context.lineTo(bX, bY);
  context.stroke();
} 

function clearChildren( node ){
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function displayCsvStringAsURL( string ){
  var d = document.getElementById("urlsection");
  var a = document.createElement("a");
  a.href = "data:text/csv," + encodeURIComponent( string );
  a.textContent = "data";
  clearChildren( d );
  d.appendChild(a);
}

function logMinimumHistory( minimumHistory ){
  var csvString = "Evaluations, x1, x2, y\n"
  minimumHistory.forEach( function( h ){
    csvString += h.evaluations + ", " + h.x1 + ", " + h.x2 + ", " + h.y + "\n";
  } );
  displayCsvStringAsURL( csvString );
}

function getItterationPause(){
  return document.getElementById( "pause" ).value;
}


function setRunning(){
  var d = document.getElementById("urlsection");
  clearChildren(d);
  d.textContent = "Running";
  document.getElementById("loadingAnim").style.display = "block";

  var buttons = document.getElementsByClassName( "algorithm" );
  [].forEach.call( buttons, function(b){
    b.disabled = true;
  } );
}

function finishRunning(){
  document.getElementById("loadingAnim").style.display = "";
  var buttons = document.getElementsByClassName( "algorithm" );
  [].forEach.call( buttons, function(b){
    b.disabled = false;
  } );
}

function updateSlider(id){
  var slider = document.getElementById( id );
  var label = document.getElementById( id + "span" );
  label.textContent = slider.value;
}

window.onload = function(){
  var canvas = document.getElementById( "c" );
  var ctx=canvas.getContext("2d");
  draw_background( canvas, ctx );
  
  var ranges = document.getElementsByClassName( "range" );
  [].forEach.call( ranges, function(r){
    updateSlider( r.id );
  } );

  getCanvasAndContext = function(){
    return [canvas, ctx];
  }
  finishRunning();
}
