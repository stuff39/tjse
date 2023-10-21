var soundCancel = 0

function Hold() {

  this.piece = 0;
}
Hold.prototype.draw = function () {
  if (soundCancel == 0 && paused == false) {
    sound.playse("hold");
  }
  soundCancel = 0
//  holdElement = ;
  
  document.getElementById("hold").classList.remove("glow-flash-animation");
  void document.getElementById("hold").offsetWidth;
  document.getElementById("hold").classList.add("glow-flash-animation");
  
  clear(holdCtx);
  if (piece.ihs == true) {
    var p = preview.grabBag[0];
  } else {
    document.getElementById("ihs-indicator").style.display = "none";
    var p = this.piece;
  }
//  var p = this.piece;
  
  var initInfo = RotSys[settings.RotSys].initinfo[p];
  if (pieces[p] != undefined) {
  var rect = pieces[p].rect;
    draw(
      pieces[p].tetro[initInfo[2]],
      -rect[initInfo[2]][0] + (4 - rect[initInfo[2]][2] + rect[initInfo[2]][0]) / 2,
      -rect[initInfo[2]][1] +
      (3 - rect[initInfo[2]][3] + rect[initInfo[2]][1]) / 2,
      holdCtx,
      RotSys[settings.RotSys].color[p]
    );
  }
}
var hold = new Hold();