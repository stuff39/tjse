/*
Author: Simon Laroche
Site: http://simon.lc/
Demo: http://simon.lc/tetr.js

Note: Before looking at this code, it would be wise to do a bit of reading about
the game so you know why some things are done a certain way.
*/
'use strict';

// boom.
var focused = true;

window.onfocus = function () {
  try {
    focused = true;
    if (alarm) {
      sound.playse("alarm")
    }
    sound.unmutebgm()
  } catch (error) {

  }

};
window.onblur = function () {
  try {
    focused = false;
    sound.stopse("alarm")
    sound.mutebgm()
  } catch (error) {

  }

};

function ObjectClone(obj) {
  var copy = (obj instanceof Array) ? [] : {};
  for (var attr in obj) {
    if (!obj.hasOwnProperty(attr)) continue;
    copy[attr] = (typeof obj[attr] == "object") ? ObjectClone(obj[attr]) : obj[attr];
  }
  return copy;
}

function $$(id) {
  return document.getElementById(id);
}

function $setText(elm, s) {
  if (typeof elm.innerText === "string") {
    elm.innerText = s;
  } else {
    elm.textContent = s;
  }
}




/**
 * Playfield.
 */
var cellSize;
var column;

/**
 * Get html elements.
 */
var msg = $$('msg');
var statsIpieces = $$('ivalue');
var stats = $$('stats');
var statsTime = $$('time');
var statsLines = $$('line');
var statsPiece = $$('piece');
var statsScore = $$('score');
var statsLevel = $$('level');

var h3 = document.getElementsByTagName('h3');
var set = $$('settings');
var leaderboard = $$('leaderboard');
var replaydata = $$('replaydata');
var hidescroll = $$('hidescroll');

// Get canvases and contexts
var holdCanvas = $$('hold');
var bgStackCanvas = $$('bgStack');
var stackCanvas = $$('stack');
var activeCanvas = $$('active');
var previewCanvas = $$('preview');
var spriteCanvas = $$('sprite');

var timeCanvas = $$('time').childNodes[0];

var holdCtx = holdCanvas.getContext('2d');
var bgStackCtx = bgStackCanvas.getContext('2d');
var stackCtx = stackCanvas.getContext('2d');
var activeCtx = activeCanvas.getContext('2d');
var previewCtx = previewCanvas.getContext('2d');
var spriteCtx = spriteCanvas.getContext('2d');

var timeCtx = timeCanvas.getContext('2d');

var touchLeft = $$('touchLeft');
var touchRight = $$('touchRight');
var touchDown = $$('touchDown');
var touchDrop = $$('touchDrop');
var touchHold = $$('touchHold');
var touchRotLeft = $$('touchRotLeft');
var touchRotRight = $$('touchRotRight');
var touchRot180 = $$('touchRot180');

var touchLayout = $$('touchLayout');

var touchButtons = [
  touchLeft, touchRight, touchDown, touchDrop,
  touchHold, touchRotRight, touchRotLeft, touchRot180
];
touchLeft.bindsMemberName = "moveLeft";
touchRight.bindsMemberName = "moveRight";
touchDown.bindsMemberName = "moveDown";
touchDrop.bindsMemberName = "hardDrop";
touchHold.bindsMemberName = "holdPiece";
touchRotRight.bindsMemberName = "rotRight";
touchRotLeft.bindsMemberName = "rotLeft";
touchRot180.bindsMemberName = "rot180";

var nLayouts = 7,
  currLayout = -2 /* none */ ;

/**
 * Piece data
 */

// [r][x][y]
var TetroI = [
  [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
  [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]]];
var TetroJ = [
  [[2, 2, 0, 0], [0, 2, 0, 0], [0, 2, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [2, 2, 2, 0], [2, 0, 0, 0], [0, 0, 0, 0]],
  [[0, 2, 0, 0], [0, 2, 0, 0], [0, 2, 2, 0], [0, 0, 0, 0]],
  [[0, 0, 2, 0], [2, 2, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0]]];
var TetroL = [
  [[0, 3, 0, 0], [0, 3, 0, 0], [3, 3, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [3, 3, 3, 0], [0, 0, 3, 0], [0, 0, 0, 0]],
  [[0, 3, 3, 0], [0, 3, 0, 0], [0, 3, 0, 0], [0, 0, 0, 0]],
  [[3, 0, 0, 0], [3, 3, 3, 0], [0, 0, 0, 0], [0, 0, 0, 0]]];
var TetroO = [
  [[0, 0, 0, 0], [4, 4, 0, 0], [4, 4, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [4, 4, 0, 0], [4, 4, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [4, 4, 0, 0], [4, 4, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [4, 4, 0, 0], [4, 4, 0, 0], [0, 0, 0, 0]]];
var TetroS = [
  [[0, 5, 0, 0], [5, 5, 0, 0], [5, 0, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [5, 5, 0, 0], [0, 5, 5, 0], [0, 0, 0, 0]],
  [[0, 0, 5, 0], [0, 5, 5, 0], [0, 5, 0, 0], [0, 0, 0, 0]],
  [[5, 5, 0, 0], [0, 5, 5, 0], [0, 0, 0, 0], [0, 0, 0, 0]]];
var TetroT = [
  [[0, 6, 0, 0], [6, 6, 0, 0], [0, 6, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [6, 6, 6, 0], [0, 6, 0, 0], [0, 0, 0, 0]],
  [[0, 6, 0, 0], [0, 6, 6, 0], [0, 6, 0, 0], [0, 0, 0, 0]],
  [[0, 6, 0, 0], [6, 6, 6, 0], [0, 0, 0, 0], [0, 0, 0, 0]]];
var TetroZ = [
  [[7, 0, 0, 0], [7, 7, 0, 0], [0, 7, 0, 0], [0, 0, 0, 0]],
  [[0, 0, 0, 0], [0, 7, 7, 0], [7, 7, 0, 0], [0, 0, 0, 0]],
  [[0, 7, 0, 0], [0, 7, 7, 0], [0, 0, 7, 0], [0, 0, 0, 0]],
  [[0, 7, 7, 0], [7, 7, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]];
// [r][MINX MINY MAXX MAXY]
var RectI = [[0, 1, 4, 2], [2, 0, 3, 4], [0, 2, 4, 3], [1, 0, 2, 4]]; // hacked for next display
var RectJ = [[0, 0, 3, 2], [1, 0, 3, 3], [0, 1, 3, 3], [0, 0, 2, 3]];
var RectL = [[0, 0, 3, 2], [1, 0, 3, 3], [0, 1, 3, 3], [0, 0, 2, 3]];
var RectO = [[1, 0, 3, 2], [1, 0, 3, 2], [1, 0, 3, 2], [1, 0, 3, 2]];
var RectS = [[0, 0, 3, 2], [1, 0, 3, 3], [0, 1, 3, 3], [0, 0, 2, 3]];
var RectT = [[0, 0, 3, 2], [1, 0, 3, 3], [0, 1, 3, 3], [0, 0, 2, 3]];
var RectZ = [[0, 0, 3, 2], [1, 0, 3, 3], [0, 1, 3, 3], [0, 0, 2, 3]];

var SpinCheckI = {
  highX: [[1,2,2,1],[1,3,1,3],[1,2,2,1],[0,2,0,2]],
  highY: [[0,2,0,2],[1,2,2,1],[1,3,1,3],[1,2,2,1]],
  lowX:  [[-1,4,-1,4],[2,2,2,2],[-1,4,-1,4],[1,1,1,1]],
  lowY:  [[1,1,1,1],[-1,4,-1,4],[2,2,2,2],[-1,4,-1,4]]
}
var SpinCheckJ = {
  highX: [[1,2],[2,2],[1,0],[0,0]],
  highY: [[0,0],[1,2],[2,2],[1,0]],
  lowX:  [[0,2],[0,0],[2,0],[2,2]],
  lowY:  [[2,2],[0,2],[0,0],[2,0]]
}
var SpinCheckL = {
  highX: [[1,0],[2,2],[1,2],[0,0]],
  highY: [[0,0],[1,0],[2,2],[1,2]],
  lowX:  [[2,0],[0,0],[0,2],[2,2]],
  lowY:  [[2,2],[2,0],[0,0],[0,3]]
}
var SpinCheckS = {
  highX: [[0,2],[1,2],[2,0],[1,0]],
  highY: [[0,1],[2,0],[2,1],[0,2]],
  lowX:  [[0,-1],[1,2],[-1,3],[1,0]],
  lowY:  [[0,1],[-1,3],[2,1],[3,-1]]
}
var SpinCheckT = {
  highX: [[0,2],[2,2],[0,2],[0,0]],
  highY: [[0,0],[0,2],[2,2],[0,2]],
  lowX:  [[0,2],[0,0],[0,2],[2,2]],
  lowY:  [[2,2],[0,2],[0,0],[0,2]]
}
var SpinCheckZ = {
  highX: [[2,0],[2,1],[0,2],[0,1]],
  highY: [[0,1],[2,0],[2,1],[0,2]],
  lowX:  [[-1,3],[2,1],[3,-1],[0,1]],
  lowY:  [[0,1],[-1,3],[2,1],[3,-1]]
}

var WKTableSRSI_R = [
  [[0, 0], [-2, 0], [+1, 0], [-2, +1], [+1, -2]],
  [[0, 0], [-1, 0], [+2, 0], [-1, -2], [+2, +1]],
  [[0, 0], [+2, 0], [-1, 0], [+2, -1], [-1, +2]],
  [[0, 0], [+1, 0], [-2, 0], [+1, +2], [-2, -1]]];
var WKTableSRSI_L = [
  [[0, 0], [-1, 0], [+2, 0], [-1, -2], [+2, +1]],
  [[0, 0], [+2, 0], [-1, 0], [+2, -1], [-1, +2]],
  [[0, 0], [+1, 0], [-2, 0], [+1, +2], [-2, -1]],
  [[0, 0], [-2, 0], [+1, 0], [-2, +1], [+1, -2]]];
var WKTableSRSI_2 = [
  [[0, 0], [-1, 0], [-2, 0], [+1, 0], [+2, 0], [0, +1]],
  [[0, 0], [0, +1], [0, +2], [0, -1], [0, -2], [-1, 0]],
  [[0, 0], [+1, 0], [+2, 0], [-1, 0], [-2, 0], [0, -1]],
  [[0, 0], [0, +1], [0, +2], [0, -1], [0, -2], [+1, 0]]];
var WKTableSRSX_R = [
  [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
  [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
  [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
  [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]]];
var WKTableSRSX_L = [
  [[0, 0], [+1, 0], [+1, -1], [0, +2], [+1, +2]],
  [[0, 0], [+1, 0], [+1, +1], [0, -2], [+1, -2]],
  [[0, 0], [-1, 0], [-1, -1], [0, +2], [-1, +2]],
  [[0, 0], [-1, 0], [-1, +1], [0, -2], [-1, -2]]];
var WKTableSRSX_2 = [
  [[0, 0], [+1, 0], [+2, 0], [+1, +1], [+2, +1], [-1, 0], [-2, 0], [-1, +1], [-2, +1], [0, -1], [+3, 0], [-3, 0]],
  [[0, 0], [0, +1], [0, +2], [-1, +1], [-1, +2], [0, -1], [0, -2], [-1, -1], [-1, -2], [+1, 0], [0, +3], [0, -3]],
  [[0, 0], [-1, 0], [-2, 0], [-1, -1], [-2, -1], [+1, 0], [+2, 0], [+1, -1], [+2, -1], [0, +1], [-3, 0], [+3, 0]],
  [[0, 0], [0, +1], [0, +2], [+1, +1], [+1, +2], [0, -1], [0, -2], [+1, -1], [+1, -2], [-1, 0], [0, +3], [0, -3]]];
var WKTableSRSI = [WKTableSRSI_R, WKTableSRSI_L, WKTableSRSI_2];
var WKTableSRSX = [WKTableSRSX_R, WKTableSRSX_L, WKTableSRSX_2];
var WKTableSRS = [WKTableSRSI, WKTableSRSX, WKTableSRSX, WKTableSRSX, WKTableSRSX, WKTableSRSX, WKTableSRSX];

var WKTableCultris = [[0, 0], [-1, 0], [+1, 0], [0, +1], [-1, +1], [+1, +1], [-2, 0], [+2, 0], [0, -1]];

var WKTableDRS_R = [[0, 0], [+1, 0], [-1, 0], [0, +1], [+1, +1], [-1, +1], [0, -1]];
var WKTableDRS_L = [[0, 0], [-1, 0], [+1, 0], [0, +1], [-1, +1], [+1, +1], [0, -1]];
var WKTableDRS = [WKTableDRS_R, WKTableDRS_L, WKTableDRS_L];

var WKTableDX_R = [[[0, 0], [-1, -1]], [[0, 0], [+1, -1]], [[0, 0], [+1, +1]], [[0, 0], [-1, +1]]];
var WKTableDX_L = [[[0, 0], [+1, -1]], [[0, 0], [+1, +1]], [[0, 0], [-1, +1]], [[0, 0], [-1, -1]]];
var WKTableDX_2 = [[[0, 0], [0, -2]], [[0, 0], [-2, 0]], [[0, 0], [0, +2]], [[0, 0], [+2, 0]]];
var WKTableDX = [WKTableDX_R, WKTableDX_L, WKTableDX_2];

var OffsetSRS = [
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]]];
var OffsetARS = [
  [[0, 0], [0, 0], [0, -1], [+1, 0]],
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[0, +1], [-1, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [+1, 0]]];
var OffsetDRS = [
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [0, 0]]];
var OffsetQRS = [
  [[0, 0], [0, 0], [0, -1], [+1, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, -1], [+1, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, -1], [+1, 0]]];
var OffsetAtari = [
  [[0, -1], [-1, 0], [0, -2], [0, 0]],
  [[0, 0], [-1, 0], [0, -1], [0, 0]],
  [[0, 0], [-1, 0], [0, -1], [0, 0]],
  [[-2, 0], [-2, 0], [-2, 0], [-2, 0]],
  [[0, 0], [-1, 0], [0, -1], [0, 0]],
  [[0, 0], [-1, 0], [0, -1], [0, 0]],
  [[0, 0], [-1, 0], [0, -1], [0, 0]]];
var OffsetNBlox = [
  [[0, 0], [-1, 0], [0, -1], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[0, +1], [0, 0], [0, 0], [+1, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, 0], [0, 0], [+1, 0]]];
var OffsetNintendo = [
  [[0, +1], [0, 0], [0, 0], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[+1, +1], [+1, 0], [+1, 0], [+2, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, +1], [+1, 0], [+1, 0], [+2, 0]]];
var OffsetMS = [
  [[0, 0], [0, 0], [0, -1], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[+1, +1], [0, +1], [+1, 0], [+1, +1]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, +1], [0, +1], [+1, 0], [+1, +1]]];
var OffsetE60 = [
  [[0, 0], [0, 0], [0, -1], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[+1, +1], [+1, 0], [+1, 0], [+2, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, +1], [+1, 0], [+1, 0], [+2, 0]]];
var OffsetJJSRS = [
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, 0], [+1, 0], [+1, 0], [+1, 0]]];
var Offset5000 = [
  [[0, +1], [-1, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, -1], [+1, 0]],
  [[0, +1], [-1, 0], [0, -1], [+1, 0]],
  [[0, 0], [0, 0], [0, -1], [+1, 0]]];
var OffsetPlus = [
  [[0, 0], [0, 0], [0, -1], [+1, 0]],
  [[+1, +1], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, +1], [+1, 0], [+1, 0], [+1, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[+1, +1], [0, 0], [+1, 0], [+1, 0]],
  [[+1, +1], [+1, 0], [+1, 0], [+1, 0]],
  [[+1, +1], [+1, 0], [+1, 0], [+2, 0]]];
var OffsetDX = [
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]],
  [[0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, +1], [0, +1], [0, +1], [0, +1]]];

//x, y, r
var InitInfoSRS = [[0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]];
var InitInfoARS = [[0, 0, 0], [0, 0, 2], [0, 0, 2], [0, +1, 0], [0, +1, 0], [0, 0, 2], [0, +1, 0]];
var InitInfoDRS = [[0, +1, 0], [0, 0, 2], [0, 0, 2], [0, +1, 0], [0, +1, 0], [0, 0, 2], [0, +1, 0]];
var InitInfoQRS = [[0, 0, 0], [0, 0, 1], [0, 0, 3], [0, 0, 0], [0, 0, 0], [0, 0, 2], [0, 0, 0]];
var InitInfoAtari = [[+1, 0, 0], [+1, 0, 2], [+1, 0, 2], [0, +1, 0], [+1, +1, 0], [+1, 0, 2], [+1, +1, 0]];
var InitInfoNBlox = [[0, 0, 0], [0, 0, 2], [0, 0, 2], [0, +1, 0], [0, +1, 0], [0, 0, 2], [0, +1, 0]];
var InitInfoNintendo = [[0, 0, 0], [+1, 0, 2], [+1, 0, 2], [0, +1, 0], [+1, +1, 0], [+1, 0, 2], [+1, +1, 0]];
var InitInfoMS = [[0, 0, 0], [+1, 0, 2], [+1, 0, 2], [0, +1, 0], [+1, +1, 0], [+1, 0, 2], [+1, +1, 0]];
var InitInfoE60 = [[0, 0, 0], [+1, 0, 2], [+1, 0, 2], [0, +1, 0], [+1, +1, 0], [+1, 0, 2], [+1, +1, 0]];
var InitInfoJJSRS = [[0, 0, 0], [+1, 0, 0], [+1, 0, 0], [0, 0, 0], [+1, 0, 0], [+1, 0, 0], [+1, 0, 0]];
var InitInfo5000 = [[0, 0, 3], [0, 0, 1], [+1, 0, 3], [0, 0, 0], [0, 0, 0], [0, -1, 2], [0, 0, 0]];
var InitInfoPlus = [[0, 0, 0], [+1, 0, 2], [+1, 0, 2], [0, +1, 0], [+1, +1, 0], [+1, 0, 2], [+1, +1, 0]];
var InitInfoDX = [[0, 0, 0], [0, 0, 2], [0, 0, 2], [0, +1, 0], [0, +1, 0], [0, 0, 2], [0, +1, 0]];

var ColorSRS = [1, 2, 3, 4, 5, 6, 7];
var ColorARS = [7, 2, 3, 4, 6, 1, 5];
var ColorQRS = [7, 1, 3, 4, 5, 6, 2];
var ColorTengen = [7, 3, 6, 2, 5, 4, 1];
var ColorAtari = [7, 4, 6, 2, 1, 5, 3];
var ColorNBlox = [3, 6, 2, 7, 1, 4, 5];
var ColorC2 = [5, 2, 6, 4, 1, 7, 9];
var ColorNintendo = [9, 2, 7, 9, 2, 9, 7];
var ColorMS = [7, 6, 4, 1, 2, 8, 5];
var ColorE60 = [5, 5, 5, 5, 5, 5, 5];
var ColorIBM = [7, 9, 6, 2, 5, 3, 1];
var ColorJJSRS = [5, 1, 3, 4, 7, 6, 2];
var Color5000 = [7, 6, 8, 4, 5, 1, 2];
var ColorDX = [9, 7, 2, 4, 3, 5, 6];

//SRS, C2, ARS, QRS, DRS
var RotSys = [
  {
    initinfo: InitInfoSRS,
    offset: OffsetSRS,
    color: ColorSRS,
  },
  {
    initinfo: InitInfoSRS,
    offset: OffsetSRS,
    color: ColorC2,
  },
  {
    initinfo: InitInfoARS,
    offset: OffsetARS,
    color: ColorARS,
  },
  {
    initinfo: InitInfoDRS,
    offset: OffsetDRS,
    color: ColorARS,
  },
  {
    initinfo: InitInfoQRS,
    offset: OffsetQRS,
    color: ColorQRS,
  },
  {
    initinfo: InitInfoAtari,
    offset: OffsetAtari,
    color: ColorAtari,
  },
  {
    initinfo: InitInfoAtari,
    offset: OffsetAtari,
    color: ColorTengen,
  },
  {
    initinfo: InitInfoNBlox,
    offset: OffsetNBlox,
    color: ColorNBlox,
  },
  {
    initinfo: InitInfoNintendo,
    offset: OffsetNintendo,
    color: ColorNintendo,
  },
  {
    initinfo: InitInfoMS,
    offset: OffsetMS,
    color: ColorMS,
  },
  {
    initinfo: InitInfoE60,
    offset: OffsetE60,
    color: ColorE60,
  },
  {
    initinfo: InitInfoE60,
    offset: OffsetE60,
    color: ColorIBM,
  },
  {
    initinfo: InitInfoJJSRS,
    offset: OffsetJJSRS,
    color: ColorJJSRS,
  },
  {
    initinfo: InitInfo5000,
    offset: Offset5000,
    color: Color5000,
  },
  {
    initinfo: InitInfoPlus,
    offset: OffsetPlus,
    color: ColorARS,
  },
  {
    initinfo: InitInfoDX,
    offset: OffsetDX,
    color: ColorDX,
  }
];

// Define shapes and spawns.
var PieceI = {
  index: 0,
  tetro: TetroI,
  rect: RectI,
  spin: SpinCheckI
};
var PieceJ = {
  index: 1,
  tetro: TetroJ,
  rect: RectJ,
  spin: SpinCheckJ
};
var PieceL = {
  index: 2,
  tetro: TetroL,
  rect: RectL,
  spin: SpinCheckL
};
var PieceO = {
  index: 3,
  tetro: TetroO,
  rect: RectO
};
var PieceS = {
  index: 4,
  tetro: TetroS,
  rect: RectS,
  spin: SpinCheckS
};
var PieceT = {
  index: 5,
  tetro: TetroT,
  rect: RectT,
  spin: SpinCheckT
};
var PieceZ = {
  index: 6,
  tetro: TetroZ,
  rect: RectZ,
  spin: SpinCheckZ
};

var pieces = [PieceI, PieceJ, PieceL, PieceO, PieceS, PieceT, PieceZ];

// Finesse data
// index x orientatio x column = finesse
// finesse[0][0][4] = 1
// TODO double check these.
var finesse = [
  [
    [1, 2, 1, 0, 1, 2, 1],
    [2, 2, 2, 2, 1, 1, 2, 2, 2, 2],
    [1, 2, 1, 0, 1, 2, 1],
    [2, 2, 2, 2, 1, 1, 2, 2, 2, 2]
  ],
  [
    [1, 2, 1, 0, 1, 2, 2, 1],
    [2, 2, 3, 2, 1, 2, 3, 3, 2],
    [2, 3, 2, 1, 2, 3, 3, 2],
    [2, 3, 2, 1, 2, 3, 3, 2, 2]
  ],
  [
    [1, 2, 1, 0, 1, 2, 2, 1],
    [2, 2, 3, 2, 1, 2, 3, 3, 2],
    [2, 3, 2, 1, 2, 3, 3, 2],
    [2, 3, 2, 1, 2, 3, 3, 2, 2]
  ],
  [
    [1, 2, 2, 1, 0, 1, 2, 2, 1],
    [1, 2, 2, 1, 0, 1, 2, 2, 1],
    [1, 2, 2, 1, 0, 1, 2, 2, 1],
    [1, 2, 2, 1, 0, 1, 2, 2, 1]
  ],
  [
    [1, 2, 1, 0, 1, 2, 2, 1],
    [2, 2, 2, 1, 1, 2, 3, 2, 2],
    [1, 2, 1, 0, 1, 2, 2, 1],
    [2, 2, 2, 1, 1, 2, 3, 2, 2]
  ],
  [
    [1, 2, 1, 0, 1, 2, 2, 1],
    [2, 2, 3, 2, 1, 2, 3, 3, 2],
    [2, 3, 2, 1, 2, 3, 3, 2],
    [2, 3, 2, 1, 2, 3, 3, 2, 2]
  ],
  [
    [1, 2, 1, 0, 1, 2, 2, 1],
    [2, 2, 2, 1, 1, 2, 3, 2, 2],
    [1, 2, 1, 0, 1, 2, 2, 1],
    [2, 2, 2, 1, 1, 2, 3, 2, 2]
  ]
];

/**
 * Gameplay specific vars.
 */
var gravityUnit = 1.0 / 64;
var gravity;
var gravityArr = (function () {
  var array = [];
  array.push(0);
  for (var i = 1; i < 64; i *= 2)
    array.push(i / 64);
  for (var i = 1; i <= 20; i += 19)
    array.push(i);
  return array;
})();

var lockDelayLimit = void 0;

var mySettings = {
  DAS: 10,
  ARR: 2,
  Gravity: 0,
  'Soft Drop': 6,
  'Lock Delay': 30,
  RotSys: 0,
  Next: 6,
  Size: 0,
  Sound: 1,
  Volume: 50,
  MusicVol: 50,
  Soundbank: 12,
  NextSound: 1,
  NextType: 3,
  Voice: 0,
  Voicebank: 2,
  Block: 2,
  Ghost: 1,
  Grid: 1,
  Outline: 1,
  DASCut: 0,
  NextSide: 0,
  Messages: 1,
  MatrixSway: 1,
  IRSMode: 1,
  IHSMode: 1,
  InitialVis: 1,
  Monochrome: 0,
};

var settings = mySettings; // initialized by reference; replaced when game starts and replay

var settingName = {
  DAS: "DAS",
  ARR: "ARR",
  Gravity: "Gravity",
  'Soft Drop': "Soft Drop Speed",
  'Lock Delay': "Lock Delay",
  RotSys: "Rotation System",
  Next: "Next Window Count",
  Size: "Game Size",
  Sound: "Sound",
  Volume: "SFX Volume",
  MusicVol: "Music Volume",
  Soundbank: "Soundbank",
  NextSound: "Next Sound Indicator",
  NextType: "Next Soundbank",
  Voice: "Enable Voice",
  Voicebank: "Voice Set",
  Block: "Block Skin",
  Ghost: "Ghost Type",
  Grid: "Grid",
  Outline: "Outline",
  DASCut: "DAS Cut",
  NextSide: "Next Queue Side",
  Messages: "Game Messages",
  MatrixSway: "Matrix Sway",
  IRSMode: "IRS Mode",
  IHSMode: "IHS Mode",
  InitialVis: "Initial Visuals",
  Monochrome: "Monochrome"
};
var gravityArray = [];
var sdArray = [];
var setting = {
  DAS: range(0, 31),
  ARR: range(0, 11),
  Gravity: (function () {
    var array = [];
    array.push('Auto');
    array.push('0G');
    for (var i = 1; i < 64; i *= 2)
      array.push('1/' + (64 / i) + 'G');
    for (var i = 1; i <= 20; i += 19)
      array.push(i + 'G');
    gravityArray = array;
    return array;
  })(),
  'Soft Drop': (function () {
    var array = [];
    for (var i = 1; i < 64; i *= 2)
      array.push('1/' + (64 / i) + 'G');
    for (var i = 1; i <= 20; i += 19)
      array.push(i + 'G');
    sdArray = array;
    return array;
  })(),
  'Lock Delay': range(0, 101),
  RotSys: ['Super', 'C2', 'Arika*', 'DTET', 'QQ', 'Atari', 'Tengen', 'N-Blox', 'Nintendo', 'MS', 'E-60', 'IBM PC', 'JJ', '5000', 'Plus', 'DX'],
  Next: ['-', '1', '2', '3', '4', '5', '6'],
  Size: ['Full', 'Small', 'Medium', 'Large', 'Larger'],
  Sound: ['Off', 'On'],
  Volume: range(0, 101),
  MusicVol: range(0, 101),
  Soundbank: ['PPT', 'TGM3', 'NullPM', 'Yotipo', 'TOJ', 'Retro', 'Friends', 'T99'],
  NextSound: ['Off', 'On'],
  NextType: ['TGM3', 'NullPM'],
  Voice: ['Off', 'On'],
  Voicebank: ['Alexey', 'Friends', 'TOJ'],
  Block: ['Bevelled', 'Flat', 'Glossy', 'Arika', 'Aqua', 'Arcade', 'N-Blox', 'Bone', 'Retro', 'Friends', 'T99', '.com'],
  Ghost: ['Normal', 'Colored', 'Off', 'Hidden'],
  Grid: ['Off', 'On'],
  Outline: ['Off', 'On', 'Hidden', 'Only'],
  DASCut: ['Off', 'On'],
  NextSide: ['Right', 'Left'],
  Messages: ['Right', 'Left'],
  MatrixSway: ['Off', 'On'],
  IRSMode: ['Off', 'On'],
  IHSMode: ['Off', 'On'],
  InitialVis: ['Off', 'On'],
  Monochrome: ['Off', 'On']
};
var arrRowGen = {
  'simple': function (arr, offset, range, width) {
    var holex = ~~(rng.next() * range) + offset;
    for (var x = 0; x < width; x++) {
      arr[holex + x] = 0;
    }
  },
  'simplemessy': function (arr, ratio) {
    var hashole = false;
    for (var x = 0; x < stack.width; x++) {
      if (rng.next() >= ratio) {
        hashole = true;
        arr[x] = 0;
      }
    }
    if (hashole === false) {
      arr[~~(rng.next() * 10)] = 0;
    }
  },
};

var arrStages = [
  {
    begin: 0,
    delay: 60 * 5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 7, 4)
    }
  },
  {
    begin: 5,
    delay: 60 * 7,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 7, 4)
    }
  },
  {
    begin: 20,
    delay: 60 * 5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 7, 4)
    }
  },
  {
    begin: 40,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simple(arr, 2, 3, 4)
    }
  },
  {
    begin: 50,
    delay: 60 * 2,
    gen: function (arr) {
      arrRowGen.simple(arr, 4, 1, 2)
    }
  },
  {
    begin: 70,
    delay: 60 * 5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },
  {
    begin: 80,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },
  {
    begin: 90,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },

  {
    begin: 100,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 120,
    delay: 60 * 3.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 150,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 7, 4)
    }
  },
  {
    begin: 170,
    delay: 60 * 3.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 7, 4)
    }
  },

  {
    begin: 200,
    delay: 60 * 3.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 220,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 250,
    delay: 60 * 2.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },

  {
    begin: 300,
    delay: 60 * 3.5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.9)
    }
  },
  {
    begin: 320,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.9)
    }
  },
  {
    begin: 350,
    delay: 60 * 3.5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.8)
    }
  },
  {
    begin: 390,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.8)
    }
  },
  {
    begin: 400,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.6)
    }
  },
  {
    begin: 430,
    delay: 60 * 5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.4)
    }
  },
  {
    begin: 450,
    delay: 60 * 7,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.1)
    }
  },

  {
    begin: 470,
    delay: 60 * 7,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.4)
    }
  },
  {
    begin: 500,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.8)
    }
  },
  {
    begin: 550,
    delay: 60 * 2.5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.8)
    }
  },
  {
    begin: 600,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.6)
    }
  },
  {
    begin: 650,
    delay: 60 * 2.5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.6)
    }
  },
  {
    begin: 700,
    delay: 60 * 3.5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.4)
    }
  },
  {
    begin: 750,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.4)
    }
  },
  {
    begin: 780,
    delay: 60 * 2.5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.4)
    }
  },
  {
    begin: 800,
    delay: 60 * 2,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.9)
    }
  },
  {
    begin: 900,
    delay: 60 * 1.75,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 950,
    delay: 60 * 1.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },

  {
    begin: 1000,
    delay: 60 * 5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.0)
    }
  },
  {
    begin: 1020,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.0)
    }
  },
  {
    begin: 1050,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simple(arr, 1, 1, 8)
    }
  },
  {
    begin: 1100,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simple(arr, 2, 1, 6)
    }
  },
  {
    begin: 1150,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simple(arr, 3, 1, 4)
    }
  },
  {
    begin: 1200,
    delay: 60 * 2,
    gen: function (arr) {
      arrRowGen.simple(arr, 4, 1, 2)
    }
  },
  {
    begin: 1210,
    delay: 60 * 1.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 4, 1, 2)
    }
  },
  {
    begin: 1210,
    delay: 60 * 1,
    gen: function (arr) {
      arrRowGen.simple(arr, 4, 1, 2)
    }
  },
  {
    begin: 1250,
    delay: 60 * 2,
    gen: function (arr) {
      arrRowGen.simple(arr, 9, 1, 1)
    }
  },
  {
    begin: 1260,
    delay: 60 * 0.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 9, 1, 1)
    }
  },
  {
    begin: 1300,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.0)
    }
  },
  {
    begin: 1350,
    delay: 60 * 3,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.1)
    }
  },
  {
    begin: 1400,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.15)
    }
  },
  {
    begin: 1450,
    delay: 60 * 4,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.2)
    }
  },
  {
    begin: 1480,
    delay: 60 * 5,
    gen: function (arr) {
      arrRowGen.simplemessy(arr, 0.2)
    }
  },

  {
    begin: 1500,
    delay: 60 * 1.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },
  {
    begin: 1550,
    delay: 60 * 1.4,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },
  {
    begin: 1600,
    delay: 60 * 1.3,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },
  {
    begin: 1650,
    delay: 60 * 1.2,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 9, 2)
    }
  },
  {
    begin: 1700,
    delay: 60 * 1.3,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 1800,
    delay: 60 * 1.2,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 1850,
    delay: 60 * 1.15,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 1900,
    delay: 60 * 1.1,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 1950,
    delay: 60 * 1.05,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },

  {
    begin: 2000,
    delay: 60 * 1.0,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2050,
    delay: 60 * 0.95,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2100,
    delay: 60 * 0.9,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2150,
    delay: 60 * 0.85,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2180,
    delay: 60 * 0.8,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2190,
    delay: 60 * 1.0,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2200,
    delay: 60 * 0.8,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2300,
    delay: 60 * 0.75,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2400,
    delay: 60 * 0.7,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2450,
    delay: 60 * 0.6,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },
  {
    begin: 2500,
    delay: 60 * 0.5,
    gen: function (arr) {
      arrRowGen.simple(arr, 0, 10, 1)
    }
  },

];

var sprintRanks = [
  {
    t: 600,
    u: "修仙去吧",
    b: "Zen"
  },
  {
    t: 540,
    u: "求进9分钟",
    b: "9 min...?"
  },
  {
    t: 480,
    u: "求进8分钟",
    b: "8 min...?"
  },
  {
    t: 420,
    u: "求进7分钟",
    b: "7 min...?"
  },
  {
    t: 360,
    u: "求进6分钟",
    b: "6 min...?"
  },
  {
    t: 300,
    u: "求进5分钟",
    b: "5 min...?"
  },
  {
    t: 240,
    u: "终于……",
    b: "Finally..."
  },
  {
    t: 210,
    u: "<small>你一定是在逗我</small>",
    b: "Too slow."
  },
  {
    t: 180,
    u: "渣渣",
    b: "Well..."
  },
  {
    t: 160,
    u: "<small>速度速度加快</small>",
    b: "Go faster."
  },
  {
    t: 140,
    u: "<small>还能再给力点么</small>",
    b: "Any more?"
  },
  {
    t: 120,
    u: "2分钟？",
    b: "Beat 2 min."
  },
  {
    t: 110,
    u: "不难嘛",
    b: "So easy."
  },
  {
    t: 100,
    u: "新世界",
    b: "New world."
  },
  {
    t: 90,
    u: "超越秒针",
    b: "1 drop/sec!"
  },
  {
    t: 80,
    u: "恭喜入门",
    b: "Not bad."
  },
  {
    t: 73,
    u: "渐入佳境",
    b: "Going deeper."
  },
  {
    t: 69,
    u: "就差10秒",
    b: "10 sec faster."
  },
  {
    t: 63,
    u: "还有几秒",
    b: "Approaching."
  },
  {
    t: 60,
    u: "最后一点",
    b: "Almost there!"
  },
  {
    t: 56,
    u: "1分钟就够了",
    b: "1-min Sprinter!"
  },
  {
    t: 53,
    u: "并不是沙包",
    b: "<small>No longer rookie.</small>"
  },
  {
    t: 50,
    u: "50不是梦",
    b: "Beat 50."
  },
  {
    t: 48,
    u: "每秒2块",
    b: "2 drops/sec!"
  },
  {
    t: 45,
    u: "很能打嘛",
    b: "u can tetris."
  },
  {
    t: 42,
    u: "有点厉害",
    b: "Interesting."
  },
  {
    t: 40,
    u: "于是呢？",
    b: "So?"
  },
  {
    t: 38,
    u: "高手",
    b: "Good."
  },
  {
    t: 35,
    u: "停不下来",
    b: "Unstoppable."
  },
  {
    t: 33,
    u: "触手",
    b: "Octopus"
  },
  {
    t: 31,
    u: "每秒3块",
    b: "3 drops/sec!"
  },
  {
    t: 30,
    u: "别这样",
    b: "Noooo"
  },
  {
    t: 29,
    u: "你赢了",
    b: "You win."
  },
  {
    t: 27,
    u: "这不魔法",
    b: "Magic."
  },
  {
    t: 25,
    u: "闪电",
    b: "Lightning!"
  },
  {
    t: 24,
    u: "每秒4块",
    b: "4 drops/sec!"
  },
  {
    t: 23,
    u: "神兽",
    b: "Alien."
  },
  {
    t: 22,
    u: "神兽他妈",
    b: "Beats Alien."
  },
  {
    t: 21,
    u: "拯救地球",
    b: "<small>Save the world?</small>"
  },
  {
    t: 20,
    u: "你确定？",
    b: "r u sure?"
  },
  {
    t: 19,
    u: "5块每秒",
    b: "5pps"
  },
  {
    t: 18,
    u: "……",
    b: "..."
  },
  {
    t: 16.66,
    u: "…………",
    b: "......"
  },
  {
    t: 14.28,
    u: "6块每秒",
    b: "6pps"
  },
  {
    t: 12.50,
    u: "7块每秒",
    b: "7pps"
  },
  {
    t: 11.11,
    u: "8块每秒",
    b: "8pps"
  },
  {
    t: 10.00,
    u: "9块每秒",
    b: "9pps"
  },
  {
    t: 9.00,
    u: "10块每秒",
    b: "10pps"
  },
  {
    t: 0.00,
    u: "←_←",
    b: "→_→"
  },
  {
    t: -1 / 0,
    u: "↑_↑",
    b: "↓_↓"
  }
];

var frame;
var frameSkipped;

/**
 * for dig challenge mode
 */

var frameLastRise;
var frameLastHarddropDown;

/**
 * for dig zen mode
 */

var digZenBuffer;
var lastPiecesSet;

/**
 * Pausing variables
 */

var startPauseTime;
var pauseTime;

/**
 * 0 = Normal
 * 1 = win
 * 2 = countdown
 * 3 = game not played
 * 9 = loss
 */
var gameState = 3;

var paused = false;
var lineLimit;

var replay;
var watchingReplay = false;
var toGreyRow;
var gametype;
var gameparams;
//TODO Make dirty flags for each canvas, draw them all at once during frame call.
// var dirtyHold, dirtyActive, dirtyStack, dirtyPreview;
var lastX, lastY, lastPos, lastLockDelay, landed;

// Scoreing related status
var b2b;
var combo;
var level;
var leveltgm;
var leveltgmvisible;
var allclear;

// Stats
var lines;
var score;
var newScore;
var statsFinesse;
var piecesSet;
var startTime;
var scoreTime;
var scoreStartTime;
var digLines = [];

// Keys
var keysDown;
var lastKeys;
var released;

var binds = {
  pause: 27,
  moveLeft: 37,
  moveRight: 39,
  moveLeft3: 0,
  moveRight3: 0,
  moveDown: 40,
  hardDrop: 32,
  holdPiece: 77,
  rotRight: 38,
  rotLeft: 90,
  rot180: 16,
  retry: 82
};
var flags = {
  hardDrop: 1,
  moveRight: 2,
  moveLeft: 4,
  moveDown: 8,
  holdPiece: 16,
  rotRight: 32,
  rotLeft: 64,
  rot180: 128,
  moveRight3: 256,
  moveLeft3: 512,
};

function resize() {
  var a = $$('a');
  var b = $$('b');
  var c = $$('c');
  var d = $$('d');
  var content = $$('content');
  /*
  if (settings.NextSide === 1) {
    content.innerHTML = "";
    content.appendChild(c);
    content.appendChild(b);
    content.appendChild(d);
  } else {
    content.innerHTML = "";
    content.appendChild(d);
    content.appendChild(b);
    content.appendChild(c);
  }
  */
  // TODO Finalize this.
  // Aspect ratio: 1.024
  var padH = 12;
  var screenHeight = window.innerHeight - padH * 2;
  var screenWidth = ~~(screenHeight * 1.0);
  if (screenWidth > window.innerWidth)
    screenHeight = ~~(window.innerWidth / 1.0);

  cellSize = Math.max(~~(screenHeight / 20), 10);
  if (settings.Size === 1 && cellSize >= 16) cellSize = 16;
  else if (settings.Size === 2 && cellSize >= 24) cellSize = 24;
  else if (settings.Size === 3 && cellSize >= 32) cellSize = 32;
  else if (settings.Size === 4 && cellSize >= 48) cellSize = 48;

  var pad = (window.innerHeight - (cellSize * 20 + 2));
  var padFinal = Math.min(pad / 2, padH);
  //console.log(pad);
  content.style.padding =
    //"0 0";
    //(pad / 2) + 'px' + ' 0';
    (padFinal) + 'px' + ' 0';

  stats.style.bottom =
    //(pad) + 'px';
    //(pad / 2) + 'px';
    (pad - padFinal) + 'px';
  //(pad - padH) + 'px';

  // Size elements
  a.style.padding = '0 0.5rem ' + ~~(cellSize / 2) + 'px';

  stackCanvas.width = activeCanvas.width = bgStackCanvas.width = cellSize * 10;
  stackCanvas.height = activeCanvas.height = bgStackCanvas.height = cellSize * 20;
  b.style.width = stackCanvas.width + 'px';
  b.style.height = stackCanvas.height + 'px';

  holdCanvas.width = cellSize * 4;
  holdCanvas.height = cellSize * 3;
  a.style.width = holdCanvas.width + 'px';
  a.style.height = holdCanvas.height + 'px';

  previewCanvas.width = cellSize * 4;
  previewCanvas.height = stackCanvas.height - cellSize * 2;
  c.style.width = previewCanvas.width + 'px';
  c.style.height = b.style.height;

  // Scale the text so it fits in the thing.
  // TODO get rid of extra font sizes here.
  msgdiv.style.lineHeight = b.style.height;
  msg.style.fontSize = ~~(stackCanvas.width / 6) + 'px';
  msg.style.lineHeight = msg.style.fontSize;
  stats.style.fontSize = ~~(stackCanvas.width / 11) + 'px';
  document.documentElement.style.fontSize = ~~(stackCanvas.width / 16) + 'px';

  for (var i = 0, len = h3.length; i < len; i++) {
    h3[i].style.lineHeight = (cellSize * 2) + 'px';
    h3[i].style.fontSize = stats.style.fontSize;
  }
  stats.style.width = d.clientWidth + 'px';

  timeCanvas.width = d.clientWidth;
  timeCanvas.height = timeCanvas.clientHeight || timeCanvas.offsetHeight || timeCanvas.getBoundingClientRect().height;


  timeCtx.font = '1em Roboto Mono, "Trebuchet MS"';
  timeCtx.textAlign = "center";
  timeCtx.textBaseline = "middle";

  touchButtonsLayout();

  // Redraw graphics
  makeSprite();

  if (settings.Grid === 1)
    bg(bgStackCtx);

  //if (gameState === 0) {
  try {
    piece.draw();
    stack.draw();
    
    preview.draw();
    if (hold.piece !== void 0) {
      hold.draw();
    }
    statistics();
    statisticsStack();
  } catch (e) {}
  //}
}
addEventListener('resize', resize, false);
addEventListener('load', resize, false);

var scoreNes = 0;
var nontetNes = 0;
var tetNes = 0;
var tetRateNes = 0;

function scoreNesRefresh() {
  if (scoreNes > 999999) {
    scoreNes = 999999
  }
  document.getElementById("nesscore").innerHTML = scoreNes.toString()
}

function tetRateNesRefresh() {
  if ((tetRateNes <= 0.25 && ((tetNes > 0) || (nontetNes > 3))) && gameparams.proMode == true) {
    document.getElementById("nesrate").style.color = "#ff0000";
    document.getElementById("nesrate").classList.add("drought-flash");
  } else {
    document.getElementById("nesrate").style.color = "#ffffff";
    document.getElementById("nesrate").classList.remove("drought-flash");
  }
  document.getElementById("nesrate").innerHTML = Math.floor(tetRateNes * 100).toString() + "%"
}
/**
 * ========================== Model ===========================================
 */

/**
 * Resets all the settings and starts the game.
 */

function init(gt, params) {
  try {
    sound.killbgm()
  } catch (e) {
    
  }
  
  
  document.getElementById("ivalue").style.color = "#ffffff";
  document.getElementById("linevector").classList.remove("drought-flash");
  document.getElementById("linevector").src = "tetr_js/linevector.svg";
  document.getElementById("level").classList.remove("level-flash");
  
  leveltgm = 0;
  leveltgmvisible = 0;
  scoreNes = 0;
  newScore = 0;
  tetRateNes = 0;
  tetNes = 0;
  nontetNes = 0;
  scoreNesRefresh();
  tetRateNesRefresh();
  lineDrought = 0;
  lineAmount = 0;
  makeSprite();



  if (gt === 'replay') {
    watchingReplay = true;
    if (params !== void 0) {
      try {
        if (typeof params !== "string")
          throw "wtf";
        if (params === "" || params.slice(0, 1) !== "{")
          throw "please paste replay data, correctly..."
        replay = JSON.parse(params);
        if (typeof replay !== "object")
          throw "json parse fail";
        if ((replay.gametype === void 0) ||
          (replay.keys === void 0) ||
          (replay.settings === void 0) ||
          (replay.seed === void 0)
        ) {
          throw "something's missing...";
        }
        replay.keys = keysDecode(replay.keys);
        if (replay.keys === null)
          throw "keys decode fail"
      } catch (e) {
        alert("invalid replay data... 回放数据有误...\n" + e.toString());
        return;
      }
    }
    gametype = replay.gametype;
    gameparams = replay.gameparams;
    settings = replay.settings; // by reference
    rng.seed = replay.seed;
  } else {
    watchingReplay = false;
    settings = ObjectClone(mySettings); // by value: prevent from being modified when paused
    gametype = gt;
    gameparams = params || {};
//setup game parameters
    if (gametype === 1) {
      switch (gameSettings.marathon.limit.val) {
        case 0:
          gameparams.marathonLimit = 150;
          break;
        case 1:
          gameparams.marathonLimit = 200;
          break;
        case 2:
          gameparams.marathonLimit = undefined;
          break;
        case 3:
          gameparams.marathonLimit = 300;
          break;
      }
      gameparams.entryDelay = gameSettings.marathon.delay.val;
      if (gameSettings.marathon.nograv.val == 1) {
        gameparams.noGravity = true;
      } else {
        gameparams.noGravity = false;
      }
      if (gameSettings.marathon.invisible.val == 1) {
        gameparams.invisibleMarathon = true;
      }
      if (gameSettings.marathon.cap.val == 1) {
        gameparams.levelCap = 1;
      }
    } else if (gametype === 6) {
      gameparams.delayStrictness = gameSettings.master.lock.val;
    } else if (gametype === 8) {
      if (gameSettings.retro.type.val == 1) {
        gameparams.bType = true
      }
      if (gameSettings.retro.level.val >= 16) {
        gameparams.proMode = true
      }
      if (gameSettings.retro.drop.val == 1) {
        gameparams.allowHardDrop = true
      }
      if (gameSettings.retro.skin.val == 1) {
        gameparams.retroSkin = true
      }
      gameparams.startingLevel = gameSettings.retro.level.val;
    } else if (gametype === 0) {
      gameparams.pieceSet = gameSettings.sprint.piece.val;
      gameparams.backFire = gameSettings.sprint.backfire.val;
      switch (gameSettings.sprint.limit.val) {
        case 0:
          lineLimit = 40;
          break;
        case 1:
          lineLimit = 100;
          break;
        case 2:
          lineLimit = 200;
          break;
      }
    } else if (gametype === 4) {
      if (gameSettings.dig.checker.val == 1) {
        gameparams.digraceType = "checker"
      } else {
        gameparams.digraceType = "easy"
      }
    } else if (gametype === 3) {
      if (gameSettings.survival.zen.val == 1) {
        gametype = 7;
      }
      gameparams.digOffset = ( 500 * gameSettings.survival.slevel.val)
    } else if (gametype === 9) {
      if (gameSettings.grades.rule.val == 1) {
        gameparams.classicRule = false;
      } else {
        gameparams.classicRule = true;
      }
    }

    var seed = ~~(Math.random() * 2147483645) + 1;
    rng.seed = seed;

    replay = {};
    replay.keys = {};
    // TODO Make new seed and rng method.
    replay.seed = seed;
    replay.gametype = gametype;
    replay.gameparams = gameparams;
    replay.settings = settings;
  }
  sound.init();
  if (gametype === 6) {
    if (gameparams.delayStrictness === 2) {
      sound.loadbgm("masterstrict")
      sound.loadsidebgm("masterstrictdire")
    } else {
      sound.loadbgm("master")
    }
    
  } else if (gametype === 1) {
    sound.loadbgm("marathon")
    sound.loadbgm("marathon2")
    sound.loadbgm("marathon3")
  } else if (gametype === 0 || gametype === 4 || gametype === 5) {
    sound.loadbgm("sprint")
  } else if (gametype === 3 || gametype === 7) {
    sound.cutsidebgm()
    sound.loadbgm("survival")
    sound.loadsidebgm("survivaldire")
  } else if (gametype === 8) {
    if (gameparams.proMode == false) {
      sound.loadbgm("retro")
    } else {
      sound.cutsidebgm()
      sound.loadbgm("retropro")
      sound.loadsidebgm("retroprodrought")
    }
  } else if (gametype === 9) {
    sound.loadbgm("grade1")
    sound.loadbgm("grade2")
    sound.loadbgm("grade3")
  }
  if (gametype === void 0) {
    gametype = 0;
    sound.loadbgm("sprint")
  }//sometimes happens.....
    

  if (gametype === 0) {
         switch (gameSettings.sprint.limit.val) {
        case 0:
          lineLimit = 40;
          break;
        case 1:
          lineLimit = 100;
          break;
        case 2:
          lineLimit = 200;
          break;
      } 
  }// sprint
//    lineLimit = 40;
  else if (gametype === 5) // score attack
    lineLimit = 200;
  else if (gametype === 8 && gameparams.bType == true)
    lineLimit = 25;
  else
    lineLimit = 0;
  
  
  if (gameparams.tournament === true) {
      document.getElementById("b").classList.add("tournament");
  } else {
      document.getElementById("b").classList.remove("tournament");
  }

  //html5 mobile device sound



  //Reset
  column = 0;
  keysDown = 0;
  lastKeys = 0;
  released = 255;
  //TODO Check if needed.
  piece = new Piece();

  frame = 0;
  frameSkipped = 0;
  lastPos = 'reset';
  stack.new(10, 20, 4);
  toGreyRow = stack.height - 1;
  hold.piece = void 0;
  if (settings.Gravity === 0) gravity = gravityUnit;

  preview.init()
  //preview.draw();

  b2b = 0;
  combo = 0;
  if (gametype == 8) {
    level = gameparams.startingLevel
  } else {
    level = 0;
  }

  allclear = 0;
  statsFinesse = 0;
  lines = 0;
  score = bigInt(0);
  piecesSet = 0;

  clear(stackCtx);
  clear(activeCtx);
  clear(holdCtx);

  digLines = [];
  if (gametype === 3) {
    frameLastRise = 0;
    frameLastHarddropDown = 0;
  }
  if (gametype === 4) {
    // Dig Race
    // make ten random numbers, make sure next isn't the same as last? t=rnd()*(size-1);t>=arr[i-1]?t++:; /* farter */
    //TODO make into function or own file.
    if (gameparams["digraceType"] === void 0 || gameparams["digraceType"] === "checker") {
      // harder digrace: checkerboard
      digLines = range(stack.height - 10, stack.height);
      $setText(statsLines, 10);
      for (var y = stack.height - 1; y > stack.height - 10 - 1; y--) {
        for (var x = 0; x < stack.width; x++) {
          if ((x + y) & 1)
            stack.grid[x][y] = 8;
        }
      }
    } else if (gameparams["digraceType"] === "easy") {
      var begin = ~~(rng.next() * stack.width);
      var dire = (~~(rng.next() * 2)) * 2 - 1;
      digLines = range(stack.height - 10, stack.height);
      $setText(statsLines, 10);
      for (var y = stack.height - 1; y > stack.height - 10 - 1; y--) {
        for (var x = 0; x < stack.width; x++) {
          if ((begin + dire * y + x + stack.width * 2) % 10 !== 0)
            stack.grid[x][y] = 8;
        }
      }
    }
    //stack.draw(); //resize
  }
  if (gametype === 7) {
    lastPiecesSet = 0;
    digZenBuffer = 0;
  }
  if (gameparams.noGravity == true) {
    settings.Gravity = 1;
  } else if (gametype === 1) {
    settings.Gravity = 0;
  }
  if (gametype === 8) {
    settings.Next = 1;
    settings.RotSys = 8;
    settings["Lock Delay"] = 80;
    settings.DAS = 16;
    settings.ARR = 6;
    settings["Soft Drop"] = 5;
    settings.Ghost = 2;
    if (gameparams.retroSkin == true) {
      settings.Block = 8;
    }

    settings.Outline = 0;
    settings.Grid = 0;
    settings.Gravity = 0;
  } else if (gametype === 9) {
    piece.areLimit = 25;
    lineARE = 40;
    lineAREb = 0;
    settings.Next = 3;
    settings.DAS = 14;
    settings["Lock Delay"] = 30;
    if (gameparams.classicRule === true) {
      settings.RotSys = 2;
      settings.Block = 3;
    } else {
      settings.RotSys = 0;
      settings.Block = 2;
    }

  }
  menu();

  // Only start a loop if one is not running already.
  // don't keep looping when not played
  //  console.log(paused,gameState);
  if (paused || gameState === 3) {
    //    console.log("start inloop",inloop);
    inloop = true;
    requestAnimFrame(gameLoop);
  }
  startTime = Date.now();
  startPauseTime = 0;
  pauseTime = 0;
  scoreTime = 0;
  paused = false;
  statisticsStack();
  preview.draw;
  gameState = 2;

  resize();
}

function range(start, end, inc) {
  inc = inc || 1;
  var array = [];
  for (var i = start; i < end; i += inc) {
    array.push(i);
  }
  return array;
}

/**
 * Add divisor method so we can do clock arithmetics. This is later used to
 *  determine tetromino orientation.
 */
Number.prototype.mod = function (n) {
  return ((this % n) + n) % n;
};

/**
 * Shim.
 */
window.requestAnimFrame = (function () {
  return window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    };
})();

function pause() {
  if (gameState === 0 || gameState === 4) {
    paused = true;
    startPauseTime = Date.now();
    $setText(msg, "Paused");
    menu(4);
  }
}

function unpause() {
  paused = false;
  pauseTime += (Date.now() - startPauseTime);
  $setText(msg, '');
  menu();
  //  console.log("start inloop", inloop);
  inloop = true;
  requestAnimFrame(gameLoop);
}

/**
 * Park Miller "Minimal Standard" PRNG.
 */
//TODO put random seed method in here.
var rng = new(function () {
  this.seed = 1;
  this.next = function () {
    // Returns a float between 0.0, and 1.0
    return (this.gen() / 2147483647);
  }
  this.gen = function () {
    return this.seed = (this.seed * 16807) % 2147483647;
  }
})();

function scorestring(s, n) {
  var strsplit = s.split("");
  var spacetoggle = 0;
  for (var i = strsplit.length - 1 - 3; i >= 0; i -= 3) {
    strsplit[i] += (spacetoggle === n - 1 ? " " : "\xA0");
    spacetoggle = (spacetoggle + 1) % n;
  }
  return strsplit.join("");
}

function updateScoreTime() {
  scoreTime = Date.now() - scoreStartTime - pauseTime;
}

/**
 * Draws the stats next to the tetrion.
 */
var displayTime

function statistics() {

  var time = scoreTime || 0;
  var seconds = ((time % 60000) / 1000).toFixed(2);
  var minutes = ~~(time / 60000);
  displayTime =
    (minutes < 10 ? '0' : '') + minutes +
    (seconds < 10 ? ':0' : ':') + seconds;
  var fsbl = 30; /* frameskip bar length */
  var skipL = frameSkipped % (fsbl * 2),
    skipR = frameSkipped % (fsbl * 2);
  skipL = (skipL - fsbl < 0) ? 0 : (skipL - fsbl);
  skipR = (skipR > fsbl) ? fsbl : skipR;
  skipL = skipL / fsbl * timeCanvas.width;
  skipR = skipR / fsbl * timeCanvas.width;

  timeCtx.clearRect(0, 0, timeCanvas.width, timeCanvas.height);
  timeCtx.fillText(displayTime, timeCanvas.width / 2, timeCanvas.height / 2);
  timeCtx.fillRect(skipL, timeCanvas.height - 0.2, skipR, timeCanvas.height);
}

/**
 * Draws the stats about the stack next to the tetrion.
 */
// /* farter */
var lineAmount = 0;

function statisticsStack() {
  $setText(statsPiece, piecesSet);

  if (gametype === 8) {
    document.getElementById("score").style.display = "none";
    document.getElementById("score-label").style.display = "block";
    document.getElementById("nesscore").style.display = "block";
    document.getElementById("nesratetr").style.display = "block";
  } else if (gametype === 9) {
    document.getElementById("score").style.display = "none";
    document.getElementById("score-label").style.display = "none";
  } else {
    document.getElementById("score").style.display = "block";
    document.getElementById("score-label").style.display = "block";
    document.getElementById("nesscore").style.display = "none";
    document.getElementById("nesratetr").style.display = "none";
  }

  if (gametype === 0 || gametype === 5) {
    $setText(statsLines, lineLimit - lines);
    $setText(statsLevel, "");
  } else if (gametype === 1 || gametype === 7) {
    $setText(statsLines, lines);
    if (gameparams.noGravity != true) {
      document.getElementById("level").innerHTML = "<b>LEVEL</b> " + (level + 1);
    }
  } else if (gametype === 8) {
    $setText(statsLines, lines);
    document.getElementById("level").innerHTML = "<b>LEVEL</b> " + (level);
    if (lineDrought < 13) {
      $setText(statsIpieces, lineAmount)
    }
    if (gameparams.bType == true) {
      $setText(statsLines, lineLimit - lines);
    }


  } else if (gametype === 6) {
    $setText(statsLines, lines);
    document.getElementById("level").innerHTML = "<b>LEVEL</b> M" + (level + 1);

  } else if (gametype === 3) {
    if (gameparams["digOffset"] || gameparams["digOffset"] !== 0) {
      $setText(statsLevel, gameparams["digOffset"] + "+");
    } else {
      $setText(statsLevel, "");
    }
    $setText(statsLines, lines);

  } else if (gametype === 9) {
    $setText(statsLines, lines);
    $setText(statsLevel, leveltgmvisible + "/" + (Math.floor((leveltgm / 100) % 10) + 1) * 100);
  }
  //else if (gametype === 4){
  //  $setText(statsLines, digLines.length);
  //}
  else {
    $setText(statsLines, lines);
    $setText(statsLevel, "");
  }
  if (gametype !== 8) {
    
    document.getElementById("holdtext").innerHTML = "<span class='white-border-span'>Hold</span>";
  } else {
    document.getElementById("holdtext").innerHTML = "";
  }
  if (gameparams.proMode == true) {
    $setText(promode, "");
  } else {
    $setText(promode, "");
  }
  if (gametype === 8) {
    document.getElementById("lineshower").style.display = "block";

  } else {
    document.getElementById("lineshower").style.display = "none";
  }

  if (gametype === 6) {
//    document.getElementById("rainbow").style.display = "block";
  } else {
    document.getElementById("rainbow").style.display = "none";
  }

  if (gametype === 8 && gameparams.retroSkin == true) {
    makeSprite();
    switch (parseInt((level + '').charAt(level.toString().length - 1))) {
      case 0:
        nes[9] = ['#0058f8', '#ffffff'];
        nes[2] = ['#0058f8', '#ffffff00'];
        nes[7] = ['#3ebeff', '#ffffff00'];
        break;
      case 1:
        nes[9] = ['#00a800', '#ffffff'];
        nes[2] = ['#00a800', '#ffffff00'];
        nes[7] = ['#80d010', '#ffffff00'];
        break;
      case 2:
        nes[9] = ['#db00cd', '#ffffff'];
        nes[2] = ['#db00cd', '#ffffff00'];
        nes[7] = ['#f878f8', '#ffffff00'];
        break;
      case 3:
        nes[9] = ['#0058f8', '#ffffff'];
        nes[2] = ['#0058f8', '#ffffff00'];
        nes[7] = ['#5bdb57', '#ffffff00'];
        break;
      case 4:
        nes[9] = ['#e7005b', '#ffffff'];
        nes[2] = ['#e7005b', '#ffffff00'];
        nes[7] = ['#58f898', '#ffffff00'];
        break;
      case 5:
        nes[9] = ['#58f898', '#ffffff'];
        nes[2] = ['#58f898', '#ffffff00'];
        nes[7] = ['#6b88ff', '#ffffff00'];
        break;
      case 6:
        nes[9] = ['#f83800', '#ffffff'];
        nes[2] = ['#f83800', '#ffffff00'];
        nes[7] = ['#7f7f7f', '#ffffff00'];
        break;
      case 7:
        nes[9] = ['#6b47ff', '#ffffff'];
        nes[2] = ['#6b47ff', '#ffffff00'];
        nes[7] = ['#ab0023', '#ffffff00'];
        break;
      case 8:
        nes[9] = ['#0058f8', '#ffffff'];
        nes[2] = ['#0058f8', '#ffffff00'];
        nes[7] = ['#f83800', '#ffffff00'];
        break;
      case 9:
        nes[9] = ['#f83800', '#ffffff'];
        nes[2] = ['#f83800', '#ffffff00'];
        nes[7] = ['#ffa347', '#ffffff00'];
        break;
    }
  } else {
    nes = [
    ['#c1c1c1', '#ffffff00'],
    ['#3ebeff', '#ffffff'],
    ['#0058f8', '#ffffff00'],
    ['#f83800', '#ffffff00'],
    ['#ffa347', '#ffffff'],
    ['#80d010', '#ffffff00'],
    ['#db00cd', '#ffffff'],
    ['#ab0023', '#ffffff00'],
    ['#898989', '#ffffff00'],
    ['#0058f8', '#ffffff'],
  ];
  }
  var light = ['#ffffff', '#EFB08C', '#EDDD82', '#8489C7', '#FFDB94', '#EFAFC5', '#98DF6E', '#6FC5C5', '#9A7FD1', '#78D4A3'];

//  statsScore.style.color = (b2b === 0 ? '' : light[b2b % 10]);
//  statsScore.style.textShadow = (combo === 0 ? '' : ('0 0 0.5em ' + light[(combo - 1) % 10]));
//  $setText(statsScore, scorestring(score.toString(), 2));
  $setText(statsScore, Math.floor(newScore).toLocaleString());
}
// ========================== View ============================================

/**
 * Draws grid in background.
 */
function bg(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = '#1c1c1c';
  for (var x = -1; x < ctx.canvas.width + 1; x += cellSize) {
    ctx.fillRect(x, 0, 2, ctx.canvas.height);
  }
  for (var y = -1; y < ctx.canvas.height + 1; y += cellSize) {
    ctx.fillRect(0, y, ctx.canvas.width, 2);
  }
}

/**
 * Draws a pre-rendered mino.
 */
function drawCell(x, y, color, ctx, darkness) {
  x = Math.floor(x * cellSize);
  y = Math.floor(y * cellSize);
  ctx.drawImage(spriteCanvas, color * cellSize, 0, cellSize, cellSize, x, y, cellSize, cellSize);
  if (darkness !== void 0) {
    //ctx.globalCompositeOperation = 'source-atop';
    ctx.fillStyle = 'rgba(0,0,0,' + darkness + ')';
    ctx.fillRect(x, y, cellSize, cellSize);
    //ctx.globalCompositeOperation = 'source-over';
  }
}

/**
 * Pre-renders all mino types in all colors.
 */
var nes = [
    ['#c1c1c1', '#ffffff00'],
    ['#3ebeff', '#ffffff'],
    ['#0058f8', '#ffffff00'],
    ['#f83800', '#ffffff00'],
    ['#ffa347', '#ffffff'],
    ['#80d010', '#ffffff00'],
    ['#db00cd', '#ffffff'],
    ['#ab0023', '#ffffff00'],
    ['#898989', '#ffffff00'],
    ['#0058f8', '#ffffff'],
  ];

function makeSprite() {
  var tetrjs = [
    ['#EEEEEE', '#E0E0E0', '#BDBDBD'],
    ['#26C6DA', '#00BCD4', '#00ACC1'],
    ['#42A5F5', '#2196F3', '#1E88E5'],
    ['#FFA726', '#FF9800', '#FB8C00'],
    ['#FFEE58', '#FFEB3B', '#FDD835'],
    ['#66BB6A', '#4CAF50', '#43A047'],
    ['#AB47BC', '#9C27B0', '#8E24AA'],
    ['#EF5350', '#F44336', '#E53935'],
    ['#616161', '#424242', '#212121'],
    ['#EEEEEE', '#E0E0E0', '#BDBDBD'],
  ]
  var shaded = [
    // 0         +10        -10        -20
    ['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
    ['#25bb9b', '#4cd7b6', '#009f81', '#008568'],
    ['#3397d9', '#57b1f6', '#007dbd', '#0064a2'],
    ['#e67e23', '#ff993f', '#c86400', '#a94b00'],
    ['#efc30f', '#ffdf3a', '#d1a800', '#b38e00'],
    ['#9ccd38', '#b9e955', '#81b214', '#659700'],
    ['#9c5ab8', '#b873d4', '#81409d', '#672782'],
    ['#e64b3c', '#ff6853', '#c62c25', '#a70010'],
    ['#898989', '#a3a3a3', '#6f6f6f', '#575757'],
    ['#c1c1c1', '#dddddd', '#a6a6a6', '#8b8b8b'],
  ];
  var glossy = [
    //25         37         52         -21        -45
    ['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
    ['#7bffdf', '#9fffff', '#ccffff', '#008165', '#00442e'],
    ['#6cdcff', '#93feff', '#c2ffff', '#00629f', '#002c60'],
    ['#ffc166', '#ffe386', '#ffffb0', '#aa4800', '#650500'],
    ['#ffff6a', '#ffff8c', '#ffffb8', '#b68a00', '#714f00'],
    ['#efff81', '#ffffa2', '#ffffcd', '#6b9200', '#2c5600'],
    ['#dc9dfe', '#ffbeff', '#ffe9ff', '#5d287e', '#210043'],
    ['#ff9277', '#ffb497', '#ffe0bf', '#a7000a', '#600000'],
    ['#cbcbcb', '#ededed', '#ffffff', '#545454', '#1f1f1f'],
    ['#ffffff', '#ffffff', '#ffffff', '#888888', '#4d4d4d'],
  ];
  var tgm = [
    ['#ababab', '#5a5a5a', '#9b9b9b', '#626262'],
    ['#00e8f0', '#0070a0', '#00d0e0', '#0080a8'],
    ['#00a8f8', '#0000b0', '#0090e8', '#0020c0'],
    ['#f8a800', '#b84000', '#e89800', '#c85800'],
    ['#e8e000', '#886800', '#d8c800', '#907800'],
    ['#78f800', '#007800', '#58e000', '#008800'],
    ['#f828f8', '#780078', '#e020e0', '#880088'],
    ['#f08000', '#a00000', '#e86008', '#b00000'],
    ['#7b7b7b', '#303030', '#6b6b6b', '#363636'],
    ['#ababab', '#5a5a5a', '#9b9b9b', '#626262'],
  ];
  var friends = [
    ['#aeaeae', '#808080', '#909090', '#737373', '#666666', '#373737'],
    ['#5fcefe', '#09aef7', '#21beff', '#0f9bd7', '#098cc4', '#02586c'],
    ['#4786e2', '#2159de', '#3177df', '#2141c6', '#1b46a9', '#012476'],
    ['#feae5f', '#ff7900', '#fc942e', '#e35b02', '#db5802', '#993300'],
    ['#fed678', '#ffb618', '#ffc729', '#e39f02', '#ec8e02', '#996600'],
    ['#9fe732', '#63c710', '#84d718', '#59b101', '#559d0d', '#025c01'],
    ['#db60cf', '#c529a6', '#d33ab9', '#af298a', '#9a2183', '#660066'],
    ['#fe9292', '#f72039', '#fe4e71', '#d70f37', '#c70e33', '#9e0c29'],
    ['#494949', '#353535', '#3c3c3c', '#303030', '#2a2a2a', '#171717'],
    ['#aeaeae', '#808080', '#909090', '#737373', '#666666', '#373737'],
  ];
  var t99 = [
    ['#909090', '#d8d6d6', '#5d5d5d', '#9ea09f', '#797979'],
    ['#00e5ff', '#82ffff', '#00aaba', '#1ce7f7', '#00c2d3'],
    ['#1a00fa', '#4287ff', '#000092', '#202aee', '#0000c4'],
    ['#ff6d08', '#ffa76b', '#d14200', '#fb7325', '#f74800'],
    ['#ffdd0d', '#fff45c', '#d59b00', '#f5c81b', '#f2b200'],
    ['#69ff0c', '#a8ff6f', '#13c500', '#62fc1e', '#2fe900'],
    ['#b400fd', '#ea78fe', '#70009a', '#bf20f0', '#7f00c8'],
    ['#ff093b', '#ff7094', '#ba0625', '#fb0b3f', '#ef0020'],
    ['#5e5e5e', '#a6a4a4', '#3c3c3c', '#303030', '#2a2a2a'],
    ['#909090', '#d8d6d6', '#2b2b2b', '#6d6f6f', '#474747'],
  ];

  var tetcom = [
    ['#bdbdbd', '#7f7f7f', '#e2e2e2', '#333333'],
    ['#32808c', '#006274', '#00dff7', '#012c33'],
    ['#28568d', '#003374', '#008bf3', '#021c3c'],
    ['#926a2f', '#744300', '#f9af00', '#331e00'],
    ['#8d8128', '#746600', '#f6e300', '#332e01'],
    ['#218939', '#007419', '#00f84b', '#00330b'],
    ['#7b2f92', '#580074', '#d300f9', '#270033'],
    ['#8c3232', '#740000', '#f70000', '#330000'],
    ['#3e3e3e', '#2d2d2d', '#606060', '#000000'],
    ['#bdbdbd', '#7f7f7f', '#e2e2e2', '#333333'],
  ];
  var ppt = [
    // border    top side  lr side     down side  cntr fill  lit fill  drk fill
    ['#687070', '#e8e8e8', '#c8ccc8', '#b8b8b8', '#d5d5d5', '#f0f0f0', '#c0c4c0'],
    ['#086c70', '#d0fcf8', '#008cd8', '#05709d', '#00a4d8', '#00b4d0', '#0094d0'],
    ['#001060', '#80d4f8', '#004cb8', '#0038a0', '#005cb8', '#0098d0', '#0044a8'],
    ['#703000', '#f8dcb0', '#f05800', '#c85110', '#f87400', '#f8a400', '#f85c00'],
    ['#b86000', '#f8f4d8', '#f8b818', '#f8a810', '#f8c800', '#f8e458', '#f8b000'],
    ['#104c28', '#c0fc78', '#78c428', '#509828', '#68bc28', '#78d828', '#50a820'],
    ['#680088', '#f8a8f8', '#982c98', '#802c98', '#902c90', '#a82c98', '#802480'],
    ['#600800', '#e89c68', '#a01418', '#850b00', '#d82430', '#e86868', '#c51923'],
    ['#131616', '#6d6d6d', '#474747', '#3f433f', '#4c4c4c', '#868686', '#393c39'],
    ['#687070', '#e8e8e8', '#c8ccc8', '#b8b8b8', '#d5d5d5', '#f0f0f0', '#c0c4c0'],
  ];

  spriteCanvas.width = cellSize * 10;
  spriteCanvas.height = cellSize;
  for (var i = 0; i < 10; i++) {
    let iCurrent = i;
    var x = i * cellSize;
    if (settings.Monochrome == 1) {
      i = 0;
    }
    
    if (settings.Block === 0) {
      // Shaded
      spriteCtx.fillStyle = shaded[i][1];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      spriteCtx.fillStyle = shaded[i][3];
      spriteCtx.fillRect(x, cellSize / 2, cellSize, cellSize / 2);

      spriteCtx.fillStyle = shaded[i][0];
      spriteCtx.beginPath();
      spriteCtx.moveTo(x, 0);
      spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
      spriteCtx.lineTo(x, cellSize);
      spriteCtx.fill();

      spriteCtx.fillStyle = shaded[i][2];
      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize, 0);
      spriteCtx.lineTo(x + cellSize / 2, cellSize / 2);
      spriteCtx.lineTo(x + cellSize, cellSize);
      spriteCtx.fill();
    } else if (settings.Block === 1) {
      // Flat
      spriteCtx.fillStyle = tetrjs[i][1];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);
    } else if (settings.Block === 2) {
      // Glossy
      var k = Math.max(~~(cellSize * 0.1), 1);

      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
      grad.addColorStop(0.5, glossy[i][3]);
      grad.addColorStop(1, glossy[i][4]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
      grad.addColorStop(0, glossy[i][2]);
      grad.addColorStop(0.5, glossy[i][1]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

      var grad = spriteCtx.createLinearGradient(x + k, k, x + cellSize - k, cellSize - k);
      grad.addColorStop(0, shaded[i][0]);
      grad.addColorStop(0.5, glossy[i][0]);
      grad.addColorStop(0.5, shaded[i][0]);
      grad.addColorStop(1, glossy[i][0]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

    } else if (settings.Block === 3) {
      // Arika
      var k = Math.max(~~(cellSize * 0.125), 1);

      spriteCtx.fillStyle = tgm[i][1];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);
      spriteCtx.fillStyle = tgm[i][0];
      spriteCtx.fillRect(x, 0, cellSize, ~~(cellSize / 2));

      var grad = spriteCtx.createLinearGradient(x, k, x, cellSize - k);
      grad.addColorStop(0, tgm[i][2]);
      grad.addColorStop(1, tgm[i][3]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

      var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
      grad.addColorStop(0, tgm[i][0]);
      grad.addColorStop(1, tgm[i][3]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, k, k, cellSize - k);

      var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize - k);
      grad.addColorStop(0, tgm[i][2]);
      grad.addColorStop(1, tgm[i][1]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + cellSize - k, 0, k, cellSize - k);
    } else if (settings.Block === 4) {
      // Aqua
      var k = Math.max(~~(cellSize * 0.1), 1);

      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
      grad.addColorStop(0.5, glossy[i][3]);
      grad.addColorStop(1, glossy[i][4]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      var grad = spriteCtx.createLinearGradient(x, k, x, cellSize);
      grad.addColorStop(0, shaded[i][0]);
      grad.addColorStop(0.1, glossy[i][2]);
      grad.addColorStop(0.4, shaded[i][0]);
      grad.addColorStop(0.5, shaded[i][2]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);
    } else if (settings.Block === 5) {
      // Arcade
      var k = Math.max(~~(cellSize * 0.1), 1);

      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
      grad.addColorStop(0.5, tgm[i][3]);
      grad.addColorStop(1, tgm[i][1]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize, cellSize);
      grad.addColorStop(0, glossy[i][2]);
      grad.addColorStop(0.5, glossy[i][1]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x, 0, cellSize - k, cellSize - k);

      var grad = spriteCtx.createLinearGradient(x + k, k, x + cellSize - k, cellSize - k);
      grad.addColorStop(0, tgm[i][2]);
      grad.addColorStop(0.3, tgm[i][2]);
      grad.addColorStop(0.4, tgm[i][0]);
      grad.addColorStop(0.7, tgm[i][0]);
      grad.addColorStop(0.87, tgm[i][1]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

      spriteCtx.fillStyle = tgm[i][1];
      spriteCtx.fillRect(x + 1.5 * k, 1.5 * k, cellSize / 8, cellSize / 8);
    } else if (settings.Block === 6) {
      // N-Blox
      var k = Math.max(~~(cellSize * 0.1), 1);

      spriteCtx.fillStyle = glossy[i][4];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      var grad = spriteCtx.createLinearGradient(x + cellSize - k, k, x + k, cellSize - k);
      grad.addColorStop(0, glossy[i][0]);
      grad.addColorStop(0.5, glossy[i][0]);
      grad.addColorStop(0.5, shaded[i][0]);
      grad.addColorStop(1, shaded[i][0]);
      spriteCtx.fillStyle = grad;
      spriteCtx.fillRect(x + k, k, cellSize - k * 2, cellSize - k * 2);

      spriteCtx.fillStyle = shaded[i][1];
      spriteCtx.fillRect(x + cellSize / 5.5, 0 + cellSize / 5.5, cellSize / 1.64, cellSize / 1.64);

    } else if (settings.Block === 7) {
      // Bone
      var k = Math.max(~~(cellSize * 0.1), 1);

      spriteCtx.fillStyle = "#000";
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      spriteCtx.fillStyle = shaded[i][1];
      spriteCtx.fillRect(x + cellSize / 7.5, 0 + cellSize / 7.5, cellSize / 1.4, cellSize / 1.4)

      spriteCtx.fillStyle = "#000";
      spriteCtx.fillRect(x + cellSize / 3.5, 0 + cellSize / 3.5, cellSize / 2.44, cellSize / 2.44);

      spriteCtx.fillStyle = "#000";
      spriteCtx.fillRect(x + cellSize / 2.7, 0 + cellSize / 8, cellSize / 4.14, cellSize / 1.2);

    } else if (settings.Block === 8) {
      // Retro
      spriteCtx.fillStyle = "#000";
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      spriteCtx.fillStyle = nes[i][0];
      spriteCtx.fillRect(x, 0, cellSize / 1.125, cellSize / 1.125);

      spriteCtx.fillStyle = "#fff";
      spriteCtx.fillRect(x, 0, cellSize / 8, cellSize / 8);

      spriteCtx.fillStyle = "#fff";
      spriteCtx.fillRect(x + cellSize / 8, 0 + cellSize / 8, cellSize / 8, cellSize / 4);

      spriteCtx.fillStyle = "#fff";
      spriteCtx.fillRect(x + cellSize / 8, 0 + cellSize / 8, cellSize / 4, cellSize / 8);

      spriteCtx.fillStyle = nes[i][1];
      spriteCtx.fillRect(x + cellSize / 8, 0 + cellSize / 8, cellSize / 1.6, cellSize / 1.6);
    } else if (settings.Block === 9) {
      // Friends
      spriteCtx.fillStyle = friends[i][5];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);

      spriteCtx.fillStyle = friends[i][1];
      spriteCtx.fillRect(x + cellSize / 18, 0 + cellSize / 18, cellSize / 1.125, cellSize / 1.125);

      spriteCtx.fillStyle = "#fff";
      spriteCtx.fillRect(x + cellSize / 18, 0 + cellSize / 18, cellSize / 9, cellSize / 9);

      spriteCtx.fillStyle = friends[i][0];
      spriteCtx.fillRect(x + cellSize / 6, 0 + cellSize / 18, cellSize / 1.5, cellSize / 18);

      spriteCtx.fillStyle = friends[i][0];
      spriteCtx.fillRect(x + cellSize / 18, 0 + cellSize / 6, cellSize / 18, cellSize / 1.5);

      spriteCtx.fillStyle = friends[i][4];
      spriteCtx.fillRect(x + cellSize / 1.125, 0 + cellSize / 6, cellSize / 18, cellSize / 1.5);

      spriteCtx.fillStyle = friends[i][4];
      spriteCtx.fillRect(x + cellSize / 6, 0 + cellSize / 1.125, cellSize / 1.5, cellSize / 18);

      spriteCtx.fillStyle = friends[i][2];
      spriteCtx.fillRect(x + cellSize / 4.5, 0 + cellSize / 4.5, cellSize / 1.8, cellSize / 1.8);

      spriteCtx.fillStyle = friends[i][3];
      spriteCtx.fillRect(x + cellSize / 3.6, 0 + cellSize / 3.6, cellSize / 2.25, cellSize / 2.25);
    } else if (settings.Block === 10) {
      // T99
      spriteCtx.fillStyle = t99[i][0];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);
//
      var grad = spriteCtx.createLinearGradient(x, 0, x + cellSize / 7, cellSize / 2);
      grad.addColorStop(0, "#FFFFFFEE");
      grad.addColorStop(1, "#FFFFFF66");
      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize / 8, cellSize / 8);
      spriteCtx.lineTo(x + cellSize / 8, cellSize / 2);
      spriteCtx.quadraticCurveTo(x + cellSize / 1.5, cellSize / 4, x + cellSize / (8 / 7), cellSize / 4);
      spriteCtx.lineTo(x + cellSize / (8 / 7), cellSize / 8);
      spriteCtx.fillStyle = grad;
      spriteCtx.fill();

      spriteCtx.fillStyle = t99[i][1];
      spriteCtx.fillRect(x, 0, cellSize, cellSize / 8);

      spriteCtx.fillStyle = t99[i][2];
      spriteCtx.fillRect(x, cellSize / (8 / 7), cellSize, cellSize / 8);
//
      spriteCtx.beginPath();
      spriteCtx.moveTo(x, 0);
      spriteCtx.lineTo(x, cellSize);
      spriteCtx.lineTo(x + cellSize / 8, cellSize / (8 / 7));
      spriteCtx.lineTo(x + cellSize / 8, cellSize / 8);
      spriteCtx.fillStyle = t99[i][3];
      spriteCtx.fill();

      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize, 0);
      spriteCtx.lineTo(x + cellSize, cellSize);
      spriteCtx.lineTo(x + cellSize / (8 / 7), cellSize / (8 / 7));
      spriteCtx.lineTo(x + cellSize / (8 / 7), cellSize / 8);
      spriteCtx.fillStyle = t99[i][4];
      spriteCtx.fill();
    } else if (settings.Block === 11) {
      // .com
      spriteCtx.fillStyle = tetcom[i][0];
      roundRect(spriteCtx, x, 0, cellSize, cellSize, cellSize / 12, true, false)
      spriteCtx.fillStyle = tetcom[i][1];
      roundRect(spriteCtx, x + cellSize / 18, 0 + cellSize / 18, cellSize / 1.125, cellSize / 1.125, cellSize / 12, true, false)
      
      
      var grd = spriteCtx.createRadialGradient(x + cellSize / 2, 0 + cellSize, cellSize / 32, x + cellSize / 2, 0 + cellSize / 1.5, cellSize);
      grd.addColorStop(0, tetcom[i][2]);
      grd.addColorStop(1, tetcom[i][3]);
      spriteCtx.fillStyle = grd;
      spriteCtx.fillRect(x + cellSize / (16/2.5), 0 + cellSize / (16/2.5), cellSize / (16/11), cellSize / (16/11));
      
      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize / (16/2.5), 0 + cellSize / (16/2.5))
      spriteCtx.bezierCurveTo(x + cellSize / (16/2.5), cellSize / 2, x + cellSize / (16/13.5), cellSize / 2, x + cellSize / (16/13.5), cellSize / (16/2.5));
      var grad = spriteCtx.createLinearGradient(x, 0, x, cellSize / 2);
      grad.addColorStop(0, "#FFFFFF44");
      grad.addColorStop(1, "#FFFFFF88");
      spriteCtx.fillStyle = grad;
      spriteCtx.fill();
      
      var grad = spriteCtx.createLinearGradient(x + cellSize / 2, 0, x + cellSize / (16 / 5), cellSize / 2);
      grad.addColorStop(.65, "#FFFFFF00");
      grad.addColorStop(.8, "#FFFFFF");
      spriteCtx.fillStyle = grad;
      spriteCtx.fill();
    } else if (settings.Block === 12) {
      // PPT
      spriteCtx.fillStyle = ppt[i][0];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);
      
      spriteCtx.fillStyle = ppt[i][4];
      spriteCtx.fillRect(x + cellSize / 16, cellSize / 16, cellSize / (16 / 14), cellSize / (16 / 14));
      
      var grd = spriteCtx.createRadialGradient(x + cellSize / 2, 0 + cellSize, cellSize / 64, x + cellSize / 2, 0 + cellSize, cellSize / 2);
      grd.addColorStop(0, ppt[i][5]);
      grd.addColorStop(1, ppt[i][6]);
      spriteCtx.fillStyle = grd;
      spriteCtx.fillRect(x + cellSize / 16, cellSize / 2, cellSize / (16 / 14), cellSize / (16 / 7));
      
      var grd = spriteCtx.createLinearGradient(x, 0, x, cellSize / 2)
      grd.addColorStop(0.2, ppt[i][6]);
      grd.addColorStop(1, ppt[i][4]);
      spriteCtx.fillStyle = grd;
      spriteCtx.fillRect(x + cellSize / 16, cellSize / 16, cellSize / (16 / 14), cellSize / (16 / 7));
      
      spriteCtx.fillStyle = ppt[i][1];
      spriteCtx.fillRect(x + cellSize / 32, cellSize / 32, cellSize / (32 / 30), cellSize / (32 / 3));

      spriteCtx.fillStyle = ppt[i][3];
      spriteCtx.fillRect(x + cellSize / 32, cellSize / (32 / 28), cellSize / (32 / 30), cellSize / (32 / 3));
//
      
      
      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize / 34, cellSize / 32);
      spriteCtx.lineTo(x + cellSize / 34, cellSize / (32 / 31));
      spriteCtx.lineTo(x + cellSize / 8, cellSize / (8 / 7));
      spriteCtx.lineTo(x + cellSize / 8, cellSize / 8);
      spriteCtx.fillStyle = ppt[i][2];
      spriteCtx.fill();

      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize / (34 / 33), cellSize / 32);
      spriteCtx.lineTo(x + cellSize / (34 / 33), cellSize / (32 / 31));
      spriteCtx.lineTo(x + cellSize / (8 / 7), cellSize / (8 / 7));
      spriteCtx.lineTo(x + cellSize / (8 / 7), cellSize / 8);
      spriteCtx.fillStyle = ppt[i][2];
      spriteCtx.fill();
    } else if (settings.Block === 13) {
      // Tetr.js
      spriteCtx.fillStyle = tetrjs[i][2];
      spriteCtx.fillRect(x, 0, cellSize, cellSize);
      spriteCtx.beginPath();
      spriteCtx.moveTo(x + cellSize / 16, cellSize / 16);
      spriteCtx.lineTo(x + cellSize / 16, cellSize / (16 / 10));
      spriteCtx.quadraticCurveTo(x + cellSize / (16 / 8), cellSize / (16 / 5), x + cellSize / (16 / 15), cellSize / (16 / 4));
      spriteCtx.lineTo(x + cellSize / (16 / 15), cellSize / (16 / 1));
      spriteCtx.fillStyle = tetrjs[i][0];
      spriteCtx.fill();
      
    }
    i = iCurrent;
  }
}


/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object 
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
  ctx.closePath();
  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

}


/**
 * Clear canvas.
 */
function clear(ctx) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Draws a 2d array of minos.
 */
function draw(tetro, cx, cy, ctx, color, darkness) {
  for (var x = 0, len = tetro.length; x < len; x++) {
    for (var y = 0, wid = tetro[x].length; y < wid; y++) {
      if (tetro[x][y]) {
        drawCell(x + cx, y + cy, color !== void 0 ? color : tetro[x][y], ctx, darkness);
      }
    }
  }
}

// ========================== Controller ======================================

function keyUpDown(e) {
  // TODO send to menu or game depending on context.
  if ([32, 37, 38, 39, 40].indexOf(e.keyCode) !== -1)
    e.preventDefault();
  //TODO if active, prevent default for binded keys
  //if (bindsArr.indexOf(e.keyCode) !== -1)
  //  e.preventDefault();
  if (e.type === "keydown" && e.keyCode === binds.pause) {
    if (paused) {
      unpause();
    } else {
      pause();
    }
  }
  if (e.type === "keydown" && e.keyCode === binds.retry) {
    init(gametype, gameparams);
  }
  if (!watchingReplay) {
    if (e.type === "keydown") {
      if (e.keyCode === binds.moveLeft) {
        keysDown |= flags.moveLeft;
      } else if (e.keyCode === binds.moveRight) {
        keysDown |= flags.moveRight;
      } else if (e.keyCode === binds.moveDown) {
        keysDown |= flags.moveDown;
      } else if (e.keyCode === binds.hardDrop) {
        keysDown |= flags.hardDrop;
      } else if (e.keyCode === binds.rotRight) {
        keysDown |= flags.rotRight;
      } else if (e.keyCode === binds.rotLeft) {
        keysDown |= flags.rotLeft;
      } else if (e.keyCode === binds.rot180) {
        keysDown |= flags.rot180;
      } else if (e.keyCode === binds.moveLeft3) {
        keysDown |= flags.moveLeft3;
      } else if (e.keyCode === binds.moveRight3) {
        keysDown |= flags.moveRight3;
      } else if (e.keyCode === binds.holdPiece) {
        keysDown |= flags.holdPiece;
      }
    } else if (e.type === "keyup") {
      if (e.keyCode === binds.moveLeft && keysDown & flags.moveLeft) {
        keysDown ^= flags.moveLeft;
      } else if (e.keyCode === binds.moveRight && keysDown & flags.moveRight) {
        keysDown ^= flags.moveRight;
      } else if (e.keyCode === binds.moveDown && keysDown & flags.moveDown) {
        keysDown ^= flags.moveDown;
      } else if (e.keyCode === binds.hardDrop && keysDown & flags.hardDrop) {
        keysDown ^= flags.hardDrop;
      } else if (e.keyCode === binds.rotRight && keysDown & flags.rotRight) {
        keysDown ^= flags.rotRight;
      } else if (e.keyCode === binds.rotLeft && keysDown & flags.rotLeft) {
        keysDown ^= flags.rotLeft;
      } else if (e.keyCode === binds.rot180 && keysDown & flags.rot180) {
        keysDown ^= flags.rot180;
      } else if (e.keyCode === binds.moveLeft3 && keysDown & flags.moveLeft3) {
        keysDown ^= flags.moveLeft3;
      } else if (e.keyCode === binds.moveRight3 && keysDown & flags.moveRight3) {
        keysDown ^= flags.moveRight3;
      } else if (e.keyCode === binds.holdPiece && keysDown & flags.holdPiece) {
        keysDown ^= flags.holdPiece;
      }
    }
  }
}
addEventListener('keydown', keyUpDown, false);
addEventListener('keyup', keyUpDown, false);
var matrix = {};
matrix.position = {
  horizontal: 0,
  vertical: 0
};
matrix.velocity = {
  right: 0,
  left: 0,
  down: 0
};
const RIGHT = 'right';
const LEFT = 'left';
const DOWN = 'down';
const HORIZONTAL = 'horizontal';
const VERTICAL = 'vertical';

function shiftMatrix(direction) {
  if (settings.MatrixSway == 1) {
    if (direction === RIGHT) {
      matrix.velocity.left = 0;
      matrix.velocity.right = 1;
    } else if (direction === LEFT) {
      matrix.velocity.right = 0;
      matrix.velocity.left = 1;
    } else if (direction === DOWN) {
      matrix.velocity.down = 1;
    }
  }

}
const POSITIVE = 'positive'
const NEGATIVE = 'negative'

function updateMatrixPosition() {
  function matrixReturn(direction, type, sign) {
    if (matrix.velocity[direction] > 1) {
      matrix.velocity[direction] = 1;
    }
    if (matrix.position[type] < 0.5 && matrix.position[type] > -0.5) {
      if (sign === POSITIVE) {
        matrix.position[type] += 0.2;
      } else {
        matrix.position[type] -= 0.2;
      }


    }
    matrix.velocity[direction] -= 0.2;
    if (matrix.velocity[direction] < 0) {
      matrix.velocity[direction] = 0;
    }
  }

  if (matrix.velocity.right === 0 && matrix.velocity.left === 0) {
    matrix.position.horizontal /= 1.1;
  } else if (matrix.velocity.right !== 0) {
    matrixReturn(RIGHT, HORIZONTAL, POSITIVE);
  } else if (matrix.velocity.left !== 0) {
    matrixReturn(LEFT, HORIZONTAL, NEGATIVE);
  }

  if (matrix.velocity.down === 0) {
    matrix.position.vertical /= 1.1;
  } else {
    matrixReturn(DOWN, VERTICAL, POSITIVE);
  }
  if (Math.abs(matrix.position.horizontal) < 0.01) {
    matrix.position.horizontal = 0;
  }
  if (matrix.position.vertical < 0.01) {
    matrix.position.vertical = 0;
  }

  document.getElementById("b").style.transform = "translate(" + matrix.position.horizontal / 3 + "em, " + matrix.position.vertical / 3 + "em)"
//  elements.statsDiv.style.transform = "translate(" + matrix.position.horizontal + "em, " + matrix.position.vertical + "em)"
}



// ========================== Loop ============================================

//TODO Cleanup gameloop and update.
/**
 * Runs every frame.
 */
function update() {
  //TODO Das preservation broken.
  if (lastKeys !== keysDown && !watchingReplay) {
    replay.keys[frame] = keysDown;
  } else if (frame in replay.keys) {
    keysDown = replay.keys[frame];
  }
  
  //if (piece.dead) {
  //  piece.new(preview.next());
  //}

  do { // for breaking
    if (!(lastKeys & flags.holdPiece) && flags.holdPiece & keysDown) {
      piece.hold(); // may cause death
    }
    if (gameState === 9) {
      
      break;
    }

    if (flags.rotLeft & keysDown && !(lastKeys & flags.rotLeft)) {
      piece.rotate(-1);
      piece.finesse++;
    } else if (flags.rotRight & keysDown && !(lastKeys & flags.rotRight)) {
      piece.rotate(1);
      piece.finesse++;
    } else if (flags.rot180 & keysDown && !(lastKeys & flags.rot180)) {
      if (gametype !== 8 || true) {
        piece.rotate(2);
        piece.finesse++;
      }

    }

    piece.checkShift();

    if (flags.moveDown & keysDown) {
      piece.shiftDown();
      //piece.finesse++;
      
    }
    if (!(lastKeys & flags.hardDrop) && flags.hardDrop & keysDown) {
      frameLastHarddropDown = frame;
      piece.hardDrop();
    }

    piece.update(); // may turn to locked, even lock out death.
    if (gameState === 9) {
      break;
    }

    if (gametype === 3) { //Dig
      var fromLastRise = frame - frameLastRise;
      var fromLastHD = (flags.hardDrop & keysDown) ? (frame - frameLastHarddropDown) : 0;

      var arrRow = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
      var curStage = 0,
        objCurStage;

      while (curStage < arrStages.length && arrStages[curStage].begin <= lines + (gameparams["digOffset"] || 0)) {
        curStage++;
      }
      curStage--;
      objCurStage = arrStages[curStage];
      //      console.log(objCurStage.delay - fromLastRise)
      //      rise display
      if (fromLastRise >= objCurStage.delay || (fromLastHD >= 20 && fromLastRise >= 15)) {
        //IJLOSTZ
        var arrRainbow = [
          2, -1, 1, 5, 4, 3, 7, 6, -1, 8,
          8, 8, 8, 6, 6, 2, 1, 5, 8, -1,
          7, 7, -1, 8, 8];
        var idxRainbow, flagAll, colorUsed;
        idxRainbow = ~~(objCurStage.begin / 100);
        flagAll = (~~(objCurStage.begin / 50)) % 2;
        if (idxRainbow >= arrRainbow.length) {
          idxRainbow = arrRainbow.length - 1;
        }
        colorUsed = arrRainbow[idxRainbow];
        for (var x = 0; x < stack.width; x += (flagAll === 1 ? 1 : (stack.width - 1))) {
          if (colorUsed === -1) {
            arrRow[x] = ~~(rng.next() * 8 + 1);
          } else {
            arrRow[x] = colorUsed;
          }
        }

        objCurStage.gen(arrRow);
        stack.rowRise(arrRow, piece);
        frameLastRise = frame;
        sound.playse("garbage");
        let topOut = false;
        for (var test in stack.grid) {
          if (stack.grid[test][0] != undefined) {
            topOut = true;
          }

        }
        if (topOut) {
          piece.dead = true;
          gameState = 9;
          $setText(msg, 'TOP OUT!');
          menu(3);
          sound.playse("gameover");
          sound.playvox("lose");
          return;
        }
      }
    } else if (gametype === 7) { //dig zen
      for (; lastPiecesSet < piecesSet; lastPiecesSet++) {
        digZenBuffer++;
        var piecePerRise = [
          8, 6.5, 4, 3.5, 10 / 3,
          3, 2.8, 2.6, 2.4, 2.2,
          2][level > 10 ? 10 : level];
        if (digZenBuffer - piecePerRise > -0.000000001) {
          digZenBuffer -= piecePerRise;
          if (Math.abs(digZenBuffer) < -0.000000001) {
            digZenBuffer = 0;
          }
          var arrRow = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
          arrRow[~~(rng.next() * 10)] = 0;

          stack.rowRise(arrRow, piece);
          sound.playse("garbage");
        }
      }
    }
  } while (false) // break when game over

  updateScoreTime();

  if (lastKeys !== keysDown) {
    lastKeys = keysDown;
  }
}

var inloop = false; //debug
function gameLoop() {

  //if (frame % 60 == 0) console.log("running");
  var fps = 60;
  updateMatrixPosition();
  if (lockflash > 0) {
    if (piece.tetro != undefined) {
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          if (lockflashTetro[i][j] > 0) {
            stackCtx.fillStyle = "#ffffff"
            stackCtx.fillRect((lockflashX + i) * cellSize, (Math.floor(lockflashY + j) - 4) * cellSize, cellSize, cellSize);

          }
        }
      }
    }
    lockflash--;
  } else if (lockflashOn) {
      stack.draw();
    
      lockflash = 0;
      lockflashOn = false;
    }
  if ((gameState !== 0 && gameState !== 4 && gameState !== 2) || (killAllbgm == true)) {
    sound.killbgm();
    alarm = false
    sound.stopse("alarm")
    document.getElementById("bgStack").classList.remove("alarm");
  }
  if (gametype === 0) {
    if (scoreTime >= parseInt(Cookies.get('sprint40pb')) + 100) {
      timeCtx.fillStyle = "#f00";
      document.getElementById("time").classList.add("drought-flash");
    } else {
      timeCtx.fillStyle = "#fff";
      document.getElementById("time").classList.remove("drought-flash");
    }
  } else {
    timeCtx.fillStyle = "#fff";
    document.getElementById("time").classList.remove("drought-flash");
  }


  if (!paused && gameState !== 3) {
    requestAnimFrame(gameLoop);

    var repeat = ~~((Date.now() - startTime - pauseTime) / 1000 * fps) - frame;
    if (repeat > 1) {
      frameSkipped += repeat - 1;
    } else if (repeat <= 0) {
      frameSkipped += repeat - 1;
    }

    for (var repf = 0; repf < repeat; repf++) {
      //TODO check to see how pause works in replays.


      if (gameState === 0) {
        // Playing

        update();

      } else if (gameState === 2 || gameState === 4) {

        if (lastKeys !== keysDown && !watchingReplay) {
          replay.keys[frame] = keysDown;
        } else if (frame in replay.keys) {
          keysDown = replay.keys[frame];
        }
        // DAS Preload
        if (keysDown & flags.moveLeft) {
//                    if (gameparams.classicTuning !== true) {
          piece.shiftDelay = settings.DAS;
//                    }

          piece.shiftReleased = false;
          piece.shiftDir = -1;
        } else if (keysDown & flags.moveRight) {
//                    if (gameparams.classicTuning !== true) {
          piece.shiftDelay = settings.DAS;
//                    }
          piece.shiftReleased = false;
          piece.shiftDir = 1;
        } else {
          piece.shiftDelay = 0;
          piece.shiftReleased = true;
          piece.shiftDir = 0;
        }
        if (settings.IRSMode != 0) {
          if (flags.rotLeft & keysDown && !(lastKeys & flags.rotLeft)) {

            let amt = 3;
            if (settings.IRSMode == 3) {
              piece.irsDir = (((piece.irsDir + 1) + amt) % 4) - 1;
            } else {
              piece.irsDir = -1;
            }
            if (settings.InitialVis == 1) {
              sound.playse("rotate")
              preview.draw()
            }
          } else if (flags.rotRight & keysDown && !(lastKeys & flags.rotRight)) {
            let amt = 1;
            if (settings.IRSMode == 3) {
              piece.irsDir = (((piece.irsDir + 1) + amt) % 4) - 1;
            } else {
              piece.irsDir = amt;
            }
            if (settings.InitialVis == 1) {
              sound.playse("rotate")
              preview.draw()
            }
          } else if (flags.rot180 & keysDown && !(lastKeys & flags.rot180)) {
            let amt = 2;
            if (settings.IRSMode == 3) {
              piece.irsDir = (((piece.irsDir + 1) + amt) % 4) - 1;
            } else {
              piece.irsDir = amt;
            }

            if (settings.InitialVis == 1) {
              sound.playse("rotate")
              preview.draw()
            }
          } else if (piece.irsDir != 0 && (flags.rotLeft & keysDown) == 0 && (flags.rotRight & keysDown) == 0 && (flags.rot180 & keysDown) == 0 && settings.IRSMode == 2) {
            piece.irsDir = 0;
            if (settings.InitialVis == 1) {
              sound.playse("rotate")
              preview.draw()
            }
          }
        }
        if (!(lastKeys & flags.holdPiece) && flags.holdPiece & keysDown && piece.ihs == false && settings.IHSMode != 0) {
          if (gametype !== 8) {
            piece.ihs = true;
            document.getElementById("irs-indicator").style.display = "none";
            if (settings.InitialVis == 1) {
              hold.draw();
              preview.draw();
            }
          }

        } else if (piece.ihs == true && (flags.holdPiece & keysDown) !== 16 && settings.IHSMode == 2) {
          if (gametype !== 8) {
            piece.ihs = false;
            document.getElementById("ihs-indicator").style.display = "none";
            if (settings.InitialVis == 1) {
              hold.draw();
              preview.draw();
            }
          }
        }
        if (lastKeys !== keysDown) {
          lastKeys = keysDown;
        }
        if (gameState === 2) {

          // Count Down
          if (piece.irsDir !== 0) {
            document.getElementById("irs-indicator").style.display = "block";
          }
          if (piece.ihs === true) {
            document.getElementById("ihs-indicator").style.display = "block";
          }
          if (gameparams.delayStrictness === 2) {
            document.getElementById("myVideo").style.display = "block";            document.getElementById("strict-ind").style.display = "block";

          } else {
            document.getElementById("myVideo").style.display = "none";            document.getElementById("strict-ind").style.display = "none";

          }
          var time1;
          var time2;
          if (gameparams.tournament === true) {
            time1 = 10;
            time2 = 20;
          } else {
            time1 = 5;
            time2 = 10;
          }
          if (frame === 0) {
            statisticsStack();
            makeSprite();

            playedLevelingbgmGrades = [false, false]
            playedLevelingbgmMarathon = [false, false]
            killAllbgm = true
            $setText(msg, 'READY');
            if (navigator.language.substring(0, 2) == "es") {
              $setText(msg, 'LISTOS');
            } else if (navigator.language.substring(0, 2) == "fr") {
                $setText(msg, `PRÊT?`);
            }
            clearTetrisMessage();
            document.getElementById("msgdiv").classList.remove("startanim")
            if (gameparams.tournament === true) {
              sound.playse("tourneyready")
            } else {
              sound.playse("ready")
            }
            clearRows = [];
            sound.killbgm();
          } else if (frame === ~~(fps * time1 / 6)) {
            killAllbgm = false
            if (gameparams.tournament === true) {
              $setText(msg, 'START!');
              sound.playse("tourneystart")
              
              document.getElementById("msgdiv").classList.add("startanim")
            } else {
              $setText(msg, 'GO!');
              if (navigator.language.substring(0, 2) == "es") {
                $setText(msg, '¡YA!');
              } else if (navigator.language.substring(0, 2) == "fr") {
                $setText(msg, `C'EST PARTI!`);
              }
              sound.playse("go")
            }
            preview.draw;
            sound.killbgm();
          } else if (frame === ~~(fps * time2 / 6)) {
            document.getElementById("msgdiv").classList.remove("startanim")
            $setText(msg, '');
            scoreStartTime = Date.now();
            if (gametype === 6) {
              if (gameparams.delayStrictness === 2) {
                sound.playbgm("masterstrict")
                sound.playsidebgm("masterstrictdire")
              } else {
                sound.playbgm("master")
              }
            } else if (gametype === 1) {
              sound.playbgm("marathon")
            } else if (gametype === 0 || gametype === 4 || gametype === 5) {
              sound.playbgm("sprint")
            } else if (gametype === 3 || gametype === 7) {
              sound.cutsidebgm()
              sound.playbgm("survival")
              sound.playsidebgm("survivaldire")
            } else if (gametype === 8) {
              if (gameparams.proMode == false) {
                sound.playbgm("retro")
              } else {
                sound.cutsidebgm()
                sound.playbgm("retropro")
                sound.playsidebgm("retroprodrought")
              }
            } else if (gametype === 9) {
              sound.playbgm("grade1")
            }
            sound.lowersidebgm()
          }
          scoreTime = 0;
        } else {
          // are
          if (lineClear == 4) {
            if (gametype === 8 && gameSettings.retro.flash.val === 1) {
              if ((piece.are % 2) == 0) {
                document.body.style.backgroundColor = "white";
              } else {
                document.body.style.backgroundColor = "black";
              }
            }

          }
          if (piece.irsDir !== 0) {
            document.getElementById("irs-indicator").style.display = "block";
          }
          if (piece.ihs === true) {
            document.getElementById("ihs-indicator").style.display = "block";
          }
          if (piece.are >= lineARE) {
            stack.clearLines()
          }
          piece.are++;
          updateScoreTime();
        }
        if (
          (gameState === 2 && frame >= fps * time2 / 6) ||
          (gameState === 4 && piece.are >= piece.areLimit)
        ) {
          document.body.style.backgroundColor = "black";
          gameState = 0;
          // console.time("123");
          if (piece.ihs && gametype !== 8) {
            soundCancel = 1
            piece.index = preview.next();
            sound.playse("initialhold");
            piece.hold();
          } else {
            piece.new(preview.next());
          }
          piece.draw();
          // console.timeEnd("123");
          // console.log(frame);
          updateScoreTime();
        }

      } else if (gameState === 9 || gameState === 1) {
        document.getElementById("stack").classList.remove("invisible-replay")
      document.getElementById("stack").classList.remove("invisible")
        if (toGreyRow >= stack.hiddenHeight) {
          /**
           * Fade to grey animation played when player loses.
           */
          if (frame % 2) {
            for (var x = 0; x < stack.width; x++) {
              /* farter */ //WTF gamestate-1
              if (stack.grid[x][toGreyRow])
                stack.grid[x][toGreyRow] =
                (gameState === 9 ? 8 : 0);
            }
            stack.draw();
            
            toGreyRow--;
          }
        } else {
          //clear(activeCtx);
          //piece.dead = true;
          //          trysubmitscore(); disabled score submissions because they don't work
          gameState = 3;
        }
      }
      frame++;
    }

    statistics();

    // TODO improve this with 'dirty' flags.
    /* farter */ // as you draw for lock delay brightness gradient... give this up..

    if (piece.x !== lastX ||
      Math.floor(piece.y) !== lastY ||
      piece.pos !== lastPos ||
      piece.lockDelay !== lastLockDelay ||
      piece.dirty) {
      piece.draw();
    }
    lastX = piece.x;
    lastY = Math.floor(piece.y);
    lastPos = piece.pos;
    lastLockDelay = piece.lockDelay;
    piece.dirty = false;

    if (stack.dirty) {
      stack.draw();

    }
    if (preview.dirty) {
      preview.draw();
    }

  } else {
    //    console.log("stop inloop",inloop)
    inloop = false;
  }
}
// called after piece lock, may be called multple times when die-in-one-frame

function checkWin() {
  if (gametype === 0 || (gametype === 8 && gameparams.bType == true)) { // 40L
    if (lines >= lineLimit) {
      gameState = 1;
      if (gameparams && gameparams.backFire) {
        msg.innerHTML = "GREAT!";
      } else {
        var rank = null;
        var time = (Date.now() - scoreStartTime - pauseTime) / 1000;
        for (var i in sprintRanks) {
          if (time > sprintRanks[i].t) {
            rank = sprintRanks[i];
            break;
          }
        }
        if (gametype !== 8) {
          msg.innerHTML = "<small>" + rank.b + "</small>";
        }

      }
      piece.dead = true;
      menu(3);
      sound.playse("endingstart");
      sound.playvox("win");
      //      console.log(scoreTime)
      if ((scoreTime < parseInt(Cookies.get('sprint40pb')) || Cookies.get('sprint40pb') == undefined) && (gameparams.recordPB == true) && (watchingReplay == false)) {

        Cookies.set('sprint40pb', scoreTime, {
          expires: 1460
        });
        Cookies.set('sprint40pbvisual', displayTime, {
          expires: 1460
        });
      }
      updateSprint40PB()
    }
  } else {
    var isend = false;
    if (gametype === 1) { // Marathon
      if (settings.Gravity !== 0 && lines >= 200 && gameparams.noGravity != true) { // not Auto, limit to 200 Lines
//        isend = true;
      } else if ((gameparams.marathonLimit != undefined) && lines >= gameparams.marathonLimit) {
        isend = true;
      }
    } else if (gametype === 5) { // Score Attack
      if (lines >= lineLimit) { // not Auto, limit to 200 Lines
        isend = true;
      }
    } else if (gametype === 4) { // Dig race
      if (digLines.length === 0) {
        isend = true;
      }
    } else if (gametype === 6) { // 20G
      if (lines >= 300) { // 200 + 100
        isend = true;
      }
    } else if (gametype === 7) { // dig zen
      if (lines >= 400) { // 300 + 100
        isend = true;
      }
    }
    if (isend) {
      gameState = 1;
      $setText(msg, 'GREAT!');
      piece.dead = true;
      menu(3);
      sound.playse("endingstart");
      sound.playvox("win");
    }
  }
}

var playername = void 0;

function requireplayername() {
  if (playername === void 0)
    playername = prompt("Enter your name for leaderboard\n('cancel' = anonymous):\n请输入上榜大名：", "");
  if (playername === null)
    playername = "anonymous";
  if (playername === "")
    playername = "unnamed";
}

function trysubmitscore() {
  if (watchingReplay)
    return;
  var obj = {
    req: "ranking"
  };
  var time = scoreTime;

  if (gametype === 0) // 40L
    obj.mode = "sprint" +
    (gameparams && gameparams.pieceSet ? ["", "noi", "alli"][gameparams.pieceSet] : "") +
    (gameparams && gameparams.backFire ? ["", "bf1", "bf2", "bf3"][gameparams.backFire] : "");
  else if (gametype === 3) // dig
    obj.mode = "dig" + (gameparams && gameparams.digOffset ? gameparams.digOffset : "");
  else if (gametype === 4) // dig race
    obj.mode = "digrace" + (gameparams && gameparams.digraceType ? gameparams.digraceType : "checker");
  else if (gametype === 1) // marathon
    obj.mode = "marathon";
  else if (gametype === 5) // score attack
    obj.mode = "score";
  else if (gametype === 6) // 20g
    obj.mode = "marathon20g";
  else if (gametype === 7) // dig zen
    obj.mode = "digzen";
  else
    return;

  if (
    (gametype === 0 && gameState === 1) ||
    (gametype === 3 && gameState === 9) ||
    (gametype === 4 && gameState === 1) ||
    (gametype === 1 && settings.Gravity === 0) ||
    (gametype === 5) ||
    (gametype === 6) ||
    (gametype === 7) ||
    false
  ) {
    requireplayername();
    obj.lines = lines;
    obj.time = time;
    obj.score = score.toString();
    obj.name = playername;
    obj.replay = curreplaydata();

    submitscore(obj);
  } else {
    submitscore(obj);
  }
}
function showTetrisMessage(contents) {
  if (settings.Messages == 1) {
    document.getElementById("clear").innerHTML = contents
    document.getElementById("clear").classList.remove("flyaway");
    void document.getElementById("clear").offsetWidth;
    document.getElementById("clear").classList.add("flyaway");

    let comboname;
    if (settings.Voice == 1 && settings.Voicebank == 2) {
      comboname = "REN";
    } else {
      comboname = "COMBO"
    }

    if (combo < 2) {
      document.getElementById("renmsg").innerHTML = ""
    } else if (combo > 19) {
      document.getElementById("renmsg").innerHTML = "<b>" + (combo - 1) + "</b> " + comboname
      document.getElementById("rendiv").style["animation-duration"] = "0.041s"
    } else {
      document.getElementById("renmsg").innerHTML = "<b>" + (combo - 1) + "</b> " + comboname
      document.getElementById("rendiv").style["animation-duration"] = 0.5 - (0.485 * ((combo - 2) / 18)) + "s"
    }
    if (b2b <= 0) {
      document.getElementById("b2bmsg").innerHTML = "";
    } else {
      document.getElementById("b2bmsg").innerHTML = "<b>" + b2b + "</b> STREAK"
      document.getElementById("b2bdiv").classList.remove("b2b-fade");
      void document.getElementById("b2bdiv").offsetWidth;
      document.getElementById("b2bdiv").classList.add("b2b-fade");
    }
  }
}
function sendClearTetrisMessage(spin, mini) {
  let pieceName = ["I", "J", "L", "O", "S", "T", "Z"][piece.index];
  let message = "";
  if (b2b > 1 && (lineClear > 3 || spin)) {
    message += "<b>BACK-TO</b>-BACK<br>"
  }
  if (spin) {
    message += pieceName + "-<b>SPIN</b> ";
  }
  if (mini) {
    message += "MINI "
  }
  message += ["SINGLE", "DOUBLE", "TRIPLE", "TETRIS"][lineClear - 1];
  if (b2b > 1 && (lineClear > 3 || spin)) {
    message += "<br>" + b2b + "<b> STREAK!</b></small>"
  }
  
  showTetrisMessage(message);
}

function clearTetrisMessage() {
  document.getElementById("clear").innerHTML = ""
  document.getElementById("renmsg").innerHTML = ""
  document.getElementById("b2bmsg").innerHTML = ""
}

function tryreplaydata() {
  /*
    var strreplay = prompt("Paste replay data here: 在此贴入录像数据：");
    if (strreplay === null)
      return;
  */
  var strreplay = replaydata.value;
  init('replay', strreplay);
}

function showreplaydata(strreplay) {
  /*
  var objblob = new Blob([strreplay],{type:"text/plain"});
  var url=URL.createObjectURL(objblob);
  window.open(url);
  */
  replaydata.value = strreplay;
  replaydata.select();
  menu(6, 1);
}

function curreplaydata() {
  //var strreplay = Compress(JSON.stringify(replay));
  var objKeys = replay.keys;
  replay.keys = keysEncode(replay.keys);
  var strreplay = JSON.stringify(replay);
  replay.keys = objKeys;
  //strreplay = strreplay + Compress(strreplay);
  return strreplay;
}

function retroSettings() {

}