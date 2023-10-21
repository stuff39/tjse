function Preview() {
  grabBag = this.gen();
}
Preview.prototype.init = function () {
  //XXX fix ugly code lolwut /* farter */
  while (1) {
    this.grabBag = this.gen();
    break;
    //if ([3,4,6].indexOf(this.grabBag[0]) === -1) break;
  }
  if (this.grabBag.length <= 7) {
    this.grabBag.push.apply(this.grabBag, this.gen());
  }
  this.dirty = true;
  this.draw();
}
Preview.prototype.next = function () {
  var next;
  next = this.grabBag.shift();
  if (this.grabBag.length <= 7) {
    this.grabBag.push.apply(this.grabBag, this.gen());
  }
  this.dirty = true;
  return next;
  //TODO Maybe return the next piece?
}
/**
 * Creates a "grab bag" of the 7 tetrominos.
 */
Preview.prototype.gen = function () {
  if (gametype === 8) { //if retro mode
    var pieceList = void 0;
    if (gameparams && gameparams.pieceSet) {
      switch (gameparams.pieceSet) {
        case 1:
          pieceList = [1, 2, 3, 4, 5, 6];
          break;
        case 2:
          pieceList = [0, 0, 0, 0, 0, 0, 0];
          break;
      }
    } else {
      pieceList = [0, 1, 2, 3, 4, 5, 6];
    }
    //return pieceList.sort(function() {return 0.5 - rng.next()});
    /* farter */ // proven random shuffle algorithm
    var rerollAllowed = true
    for (var i = 0; i < 101; i++) {

      if (rerollAllowed == true) {
        var rand = ~~((8) * rng.next());
      } else {
        var rand = ~~((7) * rng.next());
      }
      if ((rand === 7 || rand == pieceList[(i - 1)]) && rerollAllowed == true) {
        i--
        rerollAllowed = false
      } else {
        pieceList[i] = rand;
        rerollAllowed = true
      }

    }
    return pieceList;
  } else if (gametype === 9) {
    let pieces = [0, 1, 2, 3, 4, 5, 6];
    let order = [];
    var piecelist = [];

    // Create 35 pool.
    let pool = pieces.concat(pieces, pieces, pieces, pieces);

    // First piece special conditions
    const firstPiece = ['0', '1', '2', '5', ][Math.floor(Math.random() * 4)];
    piecelist.push(firstPiece);

    let history = ['4', '6', '4', firstPiece];

    for (j = 0; j < 100; j++) {
      let roll;
      let i;
      let piece;

      // Roll For piece
      for (roll = 0; roll < 6; ++roll) {
        i = Math.floor(Math.random() * 35);
        piece = pool[i];
        if (history.includes(piece) === false || roll === 5) {
          break;
        }
        if (order.length) pool[i] = order[0];
      }

      // Update piece order
      if (order.includes(piece)) {
        order.splice(order.indexOf(piece), 1);
      }
      order.push(piece);

      pool[i] = order[0];

      // Update history
      history.shift();
      history[3] = piece;

      piecelist.push(piece);
    }
    return piecelist
  } else {
    var pieceList = void 0;
    if (gameparams && gameparams.pieceSet) {
      switch (gameparams.pieceSet) {
        case 1:
          pieceList = [1, 2, 3, 4, 5, 6];
          break;
        case 2:
          pieceList = [0, 0, 0, 0, 0, 0, 0];
          break;
      }
    } else {
      pieceList = [0, 1, 2, 3, 4, 5, 6];

    }
    //return pieceList.sort(function() {return 0.5 - rng.next()});
    /* farter */ // proven random shuffle algorithm
    for (var i = 0; i < pieceList.length - 1; i++) {
      var temp = pieceList[i];
      var rand = ~~((pieceList.length - i) * rng.next()) + i;
      pieceList[i] = pieceList[rand];
      pieceList[rand] = temp;
    }
    return pieceList;
  }

}
/**
 * Draws the piece preview.
 */
Preview.prototype.draw = function () {
  clear(previewCtx);

  var drawCount = (settings["Next"] === void 0) ? 6 : settings["Next"];
  if (gameState === 0) {

  }
  var holdPush = false
  for (var i = 0; i < drawCount; i++) {
    var p = this.grabBag[i];
    var initInfo = RotSys[settings.RotSys].initinfo[p];
    var r = initInfo[2];
    var rect = pieces[p].rect;
    if (i == 0) {
      if (piece.ihs == true) {
        if (hold.piece == null) {
          p = this.grabBag[i + 1];
        } else {
          p = hold.piece
        }
        
      }
      switch (piece.irsDir) {
        case -1: //left
          draw(
            pieces[p].tetro[(r + 3) % 4],
            -rect[r][0] + (4 - rect[r][2] + rect[r][0]) / 2,
            -rect[r][1] + (3 - rect[r][3] + rect[r][1]) / 2 + i * 3,
            previewCtx,
            RotSys[settings.RotSys].color[p]
          );
          break;
        case 0: //nothing
          draw( 
            pieces[p].tetro[r],
            -rect[r][0] + (4 - rect[r][2] + rect[r][0]) / 2,
            -rect[r][1] + (3 - rect[r][3] + rect[r][1]) / 2 + i * 3,
            previewCtx,
            RotSys[settings.RotSys].color[p]
          );
          document.getElementById("irs-indicator").style.display = "none";
          break;
        case 1: //right
          draw(
            pieces[p].tetro[(r + 1) % 4],
            -rect[r][0] + (4 - rect[r][2] + rect[r][0]) / 2,
            -rect[r][1] + (3 - rect[r][3] + rect[r][1]) / 2 + i * 3,
            previewCtx,
            RotSys[settings.RotSys].color[p]
          );
          break;
        case 2: //180
          draw(
            pieces[p].tetro[(r + 2) % 4],
            -rect[r][0] + (4 - rect[r][2] + rect[r][0]) / 2,
            -rect[r][1] + (3 - rect[r][3] + rect[r][1]) / 2 + i * 3,
            previewCtx,
            RotSys[settings.RotSys].color[p]
          );
          break;
      }

    } else {
      if (piece.ihs == true && hold.piece == null) {
        p = this.grabBag[i + 1];
      }
      draw(
        pieces[p].tetro[r],
        -rect[r][0] + (4 - rect[r][2] + rect[r][0]) / 2,
        -rect[r][1] + (3 - rect[r][3] + rect[r][1]) / 2 + i * 3,
        previewCtx,
        RotSys[settings.RotSys].color[p]
      );
    }


    //if(p===0)console.log(-rect[r][0], (4 - rect[r][2] + rect[r][0]) / 2);
  }
  this.dirty = false;
}
var preview = new Preview();