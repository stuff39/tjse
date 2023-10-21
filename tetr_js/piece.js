var usedHardDrop = false;
var spinY = 0;
var spinX = 0;
var rotationFailed = false;
function Piece() {
  this.x;
  this.y;
  this.pos = 0;
  this.tetro;
  this.index;
  this.gravity = gravityUnit;
  this.lockDelay = 0;
  this.lockDelayLimit = 30;
  this.are = 0;
  this.areLimit = 0;
  this.irsDir = 0;
  this.ihs = false;
  this.shiftDelay = 0;
  this.shiftDir = 0;
  this.shiftReleased = false;
  this.arrDelay = 0;
  this.held = false;
  this.finesse = 0;
  this.dirty = false;
  this.dead = true;
  this.rotateLimit = 0;
  this.moveLimit = 0;
  this.delayCounting = false;
}

var lineARE = 0;
var lineAREb = 0;
var lineDrought = 0;
/**
 * Removes last active piece, and gets the next active piece from the grab bag.
 */
Piece.prototype.new = function(index) {
  // TODO if no arguments, get next grabbag piece
  //console.log("new irs"+this.irsDir+", ihs"+this.ihs);
  document.getElementById("irs-indicator").style.display = "none";
  document.getElementById("ihs-indicator").style.display = "none";
  
  this.pos = RotSys[settings.RotSys].initinfo[index][2];
  this.x = ~~((stack.width - 4) / 2) + RotSys[settings.RotSys].initinfo[index][0];
  if (gametype === 8 || gametype === 9) {
    this.y = stack.hiddenHeight - 1 + RotSys[settings.RotSys].initinfo[index][1];
  } else {
    
    this.y = stack.hiddenHeight + RotSys[settings.RotSys].initinfo[index][1];

  }
  this.rotateLimit = 0;
  this.moveLimit = 0;
  this.delayCounting = false;
  this.index = index;
  this.tetro = [];
  this.held = false;
  document.getElementById("a").classList.remove("greyed");
  this.ihs = false;
  this.finesse = 0;
  this.dirty = true;
  this.dead = false;
  this.lockDelay = 0;
  classicRuleDelayLast = 0;
  
  if (settings.NextSound == 1) {
    sound.playse("piece"+preview.grabBag[0])
  }
  if (index == 0 && gametype === 8) {
    
    lineDrought = 0
    lineAmount++
    document.getElementById("ivalue").style.color = "#ffffff";
    document.getElementById("linevector").classList.remove("drought-flash");
    document.getElementById("linevector").src="tetr_js/linevector.svg";
    $setText(statsIpieces, lineAmount)
  } else {
    lineDrought++;
    if (lineDrought >= 13) {
      if (gameparams.proMode == true) {
        sound.raisesidebgm()
      }
      
      document.getElementById("ivalue").style.color = "#ff0000";
      document.getElementById("linevector").classList.add("drought-flash");
      document.getElementById("linevector").src="linevectorred.svg";
      if (lineDrought < 25) {
//        sound.playse("drought")
      } else {
//        sound.playse("droughtintense")
      }
      $setText(statsIpieces, lineDrought);
    } else {
      if (gameparams.proMode == true) {
        sound.lowersidebgm()
      }
      
    }
  }
  // TODO Do this better. Make clone object func maybe.
  //for property in pieces, this.prop = piece.prop
  if (this.irsDir !== 0) {
    sound.playse("initialrotate");
    var curPos = this.pos;
    var newPos = (this.pos+this.irsDir).mod(4);
    var offsetX =
      RotSys[settings.RotSys].offset[this.index][newPos][0] -
      RotSys[settings.RotSys].offset[this.index][curPos][0];
    var offsetY =
      RotSys[settings.RotSys].offset[this.index][newPos][1] -
      RotSys[settings.RotSys].offset[this.index][curPos][1];
    this.tetro = pieces[index].tetro[newPos];
    if (!this.moveValid(offsetX, offsetY, this.tetro)) {
      this.tetro = pieces[index].tetro[curPos];
    } else {
      this.x += offsetX;
      this.y += offsetY;
      this.pos = newPos;
    }
    this.irsDir = 0;
  } else {
    this.tetro = pieces[index].tetro[this.pos];
  }

  this.lockDelayLimit = setting['Lock Delay'][settings['Lock Delay']];
  if (gametype === 6) { //Death
    this.gravity = 20;
    if (level < 20) {
      this.lockDelayLimit = [
        30, 25, 22, 20, 20, 18, 17, 17, 15, 15,
        13, 13, 13, 13, 13, 12, 12, 12, 11, 11
      ][level];
    } else {
      this.lockDelayLimit = 11;
    }
  } else if (settings.Gravity !== 0) {
    this.gravity = gravityArr[settings.Gravity - 1];
  } else if (gametype === 1) { //Marathon
//    if (level < 20) {
//      this.gravity = [
//        1/63, 1/50, 1/39, 1/30, 1/22, 1/16, 1/12, 1/8,  1/6,  1/4,
//         1/3,  1/2,  1,  465/256,  731/256,  1280/256,    1707/256,   14,    19,    20
//        ]
//        [level];
//    } else {
//       this.gravity = 20;
//       this.lockDelayLimit = ~~(30 * Math.pow(0.93, (Math.pow(level-20, 0.8)))); // magic!
//    }
    if (level < 18) {
      let x = (level + 1);
      this.gravity = (1 / ((( 0.8 - (( x - 1 ) * 0.007 )) ** ( x - 1 )) * 60))
    } else if (level < 19) {
        this.gravity = 19.99;
    } else {
       this.gravity = 20;
       this.lockDelayLimit = ~~(30 * Math.pow(0.93, (Math.pow(level-19, 0.8)))); // magic!
    }
   
  } else if (gametype === 8) { //Classic
    if ( level <= 29 ) {
       this.gravity = [
        1/48, 1/43, 1/38, 1/33, 1/28, 1/23, 1/18, 1/13,  1/8,  1/6,
         1/5,  1/5,  1/5,  1/4,  1/4,  1/4, 1/3,  1/3,   1/3,  1/2,
             1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1/2, 1
        ]
        [level];
    } else {
      this.gravity = 1;
    }
     
             
  } else if (gametype === 9) { //tgm
    var base = 1/65536
    const speedTableTGM = [
      {level:0, speed:(base * 1024)},
      {level:30, speed:(base * 1536)},
      {level:35, speed:(base * 2048)},
      {level:40, speed:(base * 2560)},
      {level:50, speed:(base * 3072)},
      {level:60, speed:(base * 4096)},
      {level:70, speed:(base * 8192)},
      {level:80, speed:(base * 12288)},
      {level:90, speed:(base * 16384)},
      {level:100, speed:(base * 20480)},
      {level:120, speed:(base * 24576)},
      {level:140, speed:(base * 28672)},
      {level:160, speed:(base * 32768)},
      {level:170, speed:(base * 36865)},
      {level:200, speed:(base * 1024)},
      {level:220, speed:(base * 8192)},
      {level:230, speed:(base * 16384)},
      {level:233, speed:(base * 24576)},
      {level:236, speed:(base * 32768)},
      {level:239, speed:(base * 40960)},
      {level:243, speed:(base * 49152)},
      {level:247, speed:(base * 57344)},
      {level:251, speed:(1)},
      {level:300, speed:(2)},
      {level:330, speed:(3)},
      {level:360, speed:(4)},
      {level:400, speed:(5)},
      {level:420, speed:(4)},
      {level:450, speed:(3)},
      {level:500, speed:(20)},
      {level:9999999999999, speed:(20)}];
    
    var speedI = 0;
    while (leveltgm > speedTableTGM[speedI].level) {
      if (leveltgm < speedTableTGM[speedI + 1].level) {
        piece.gravity = speedTableTGM[speedI].speed;
      }
      speedI++;
    }

    if (leveltgm < 100) { //ghost visiblity
      settings.Ghost = 1;
    } else {
      settings.Ghost = 2;
    }
    
    const miscTableTGM = [
      {level:0, are:25, areline:40, arelineb:0, das:14, lockdelay:30},
      {level:500, are:25, areline:25, arelineb:0, das:8, lockdelay:30},
      {level:600, are:25, areline:16, arelineb:-9, das:8, lockdelay:30},
      {level:700, are:16, areline:12, arelineb:-4, das:8, lockdelay:30},
      {level:800, are:12, areline:6, arelineb:-6, das:8, lockdelay:30},
      {level:900, are:12, areline:6, arelineb:-6, das:6, lockdelay:17},
      {level:1000, are:6, areline:6, arelineb:0, das:6, lockdelay:17},
      {level:1100, are:5, areline:6, arelineb:0, das:6, lockdelay:15},
      {level:1200, are:4, areline:6, arelineb:0, das:6, lockdelay:15},
      {level:99999999999999, are:4, areline:6, das:6, lockdelay:15}];
    
    var miscI = 0;
    while (leveltgm > miscTableTGM[miscI].level) {
      if (leveltgm < miscTableTGM[miscI + 1].level) {
        piece.areLimit = miscTableTGM[miscI].are;
        lineARE = miscTableTGM[miscI].areline;
        lineAREb = miscTableTGM[miscI].arelineb;
        settings.DAS = miscTableTGM[miscI].das;
        settings["Lock Delay"] = miscTableTGM[miscI].lockdelay;
      }
      miscI++;
    }
  }
    else { 
    this.gravity = gravityUnit;
  }
  if (gametype === 0){
    if(this.lockDelayLimit < 8) {
      this.lockDelayLimit = 8;
    }
  }
  
  // Check for blockout.
  let blockOut = false;
  if (!this.moveValid(0, 0, this.tetro)) {
    if (gametype === (8 || 9)) {
      blockOut = true;
    } else {
      if (!this.moveValid(0, -1, this.tetro)) {
        if (!this.moveValid(0, -2, this.tetro)) {
          blockOut = true;
        } else {
          piece.y -= 2;
        }
      } else {
        piece.y -= 1;
      }
    }


  }
  if (blockOut == true) {
    if (gametype !== (8 || 9)) {
      piece.y -= 2;
    }
    gameState = 9;
    $setText(msg, 'BLOCK OUT!');
    if (gameparams.tournament == true) {
      $setText(msg, 'GAME SET');
    }
    menu(3);
    sound.playse("gameover");
    sound.playvox("lose");
    return;
  }

  //real 20G
  if(this.gravity >= 20) {
    this.checkFall();
  }
  landed = !this.moveValid(0, 1, this.tetro);
  if (flags.moveDown & keysDown) {
    var grav = gravityArr[settings['Soft Drop'] + 1];
    if (grav >= 20) // 20G softdrop = 20G gravity
      this.y += this.getDrop(grav);
    //piece.finesse++;
  }
  // die-in-one-frame!
  if(landed && (this.lockDelay >= this.lockDelayLimit)) {
    this.checkLock();
  }
  this.delayCounting = false;
}
Piece.prototype.tryKickList = function(kickList, rotated, newPos, offsetX, offsetY) {
  let failedRotations = 0;
  rotationFailed = false;

  for (var k = 0, len = kickList.length; k < len; k++) {
    if (this.moveValid(
      offsetX + kickList[k][0],
      offsetY + kickList[k][1],
      rotated
    )) {
      this.x += offsetX + kickList[k][0];
      this.y += offsetY + kickList[k][1];
      this.tetro = rotated;
      this.pos = newPos;
      this.finesse++;
      break;
    } else {
      failedRotations++;
    }
  }
  if (failedRotations >= (kickList.length)) {
    rotationFailed = true;
  }
}
Piece.prototype.rotate = function(direction) {
  if (this.delayCounting === true) {
    this.rotateLimit++
  }
sound.playse("rotate");
  
  // Goes thorugh kick data until it finds a valid move.
  var curPos = this.pos.mod(4);
  var newPos = (this.pos + direction).mod(4);
  // Rotates tetromino.
  var rotated = pieces[this.index].tetro[newPos];
  var offsetX =
    RotSys[settings.RotSys].offset[this.index][newPos][0] -
    RotSys[settings.RotSys].offset[this.index][curPos][0];
  var offsetY =
    RotSys[settings.RotSys].offset[this.index][newPos][1] -
    RotSys[settings.RotSys].offset[this.index][curPos][1];
  if (settings.RotSys === 2 || settings.RotSys === 14) { //ARS, Plus
    var kickList = [];
    if (this.index === PieceI.index) {
      if(curPos === 1 || curPos === 3)
        kickList = [[ 0, 0],[+1, 0],[-1, 0],[+2, 0]];
      else
        kickList = [[ 0, 0],[ 0,-1],[ 0,-2]];
    } else {
      if (newPos === 0 ||
        ((this.index === PieceS.index || this.index === PieceZ.index) && newPos === 2)
      )
        kickList = [[ 0, 0],[+1, 0],[-1, 0],[ 0,-1]];
      else
        kickList = [[ 0, 0],[+1, 0],[-1, 0]];
    }
    this.tryKickList(kickList, rotated, newPos, offsetX, offsetY);
  } else {
    var kickIndex = [ 1, -1 ,2].indexOf(direction); // kickDataDirectionIndex
    var kickList;
    if(settings.RotSys === 0)
      kickList = WKTableSRS[this.index][kickIndex][curPos];
    else if (settings.RotSys === 1)
      kickList = WKTableCultris;
    else if (settings.RotSys === 15)
      kickList = WKTableDX[kickIndex][curPos]
    else
      kickList = WKTableDRS[kickIndex];

    this.tryKickList(kickList, rotated, newPos, offsetX, offsetY);
  }
  spinX = Math.floor(piece.x);
  spinY = Math.floor(piece.y);
  spinCheck();
  if (settings.Soundbank == 0 && isSpin) {
    sound.playse("tspin0");
  }
  isSpin = false; 
  isMini = false;
}

Piece.prototype.checkShift = function() {
  // Shift key pressed event.
  if (keysDown & flags.moveLeft && !(lastKeys & flags.moveLeft)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
    this.finesse++;
  } else if (keysDown & flags.moveRight && !(lastKeys & flags.moveRight)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
    
    this.finesse++;
  }
  // Shift key released event.
  if (this.shiftDir === 1 &&
  !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = -1;
  } else if (this.shiftDir === -1 &&
  !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 1;
  } else if (
  !(keysDown & flags.moveRight) && lastKeys & flags.moveRight && keysDown & flags.moveLeft) {
    this.shiftDir = -1;
  } else if (
  !(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft && keysDown & flags.moveRight) {
    this.shiftDir = 1;
  } else if ((!(keysDown & flags.moveLeft) && lastKeys & flags.moveLeft) ||
             (!(keysDown & flags.moveRight) && lastKeys & flags.moveRight)) {
    this.shiftDelay = 0;
    this.arrDelay = 0;
    this.shiftReleased = true;
    this.shiftDir = 0;
  }
  // Handle events
  /* farter */
  // here problem causes it taking 2 frames to move 1 grid even ARR=1
  var dascut = [false,true][(settings.DASCut || 0)]
  //if (dascut) {
  //  this.ShiftDir = 0;
  //  console.log("interrupt")
  //}
  if (this.shiftDir) {
    // 1. When key pressed instantly move over once.
    if (this.shiftReleased && settings.DAS !== 0) {
      this.shift(this.shiftDir);
      this.shiftDelay++;
      this.shiftReleased = false;
    // 2. Apply DAS delay
    } else if (this.shiftDelay < settings.DAS) {
      this.shiftDelay++;
    // 3. Once the delay is complete, move over once.
    //     Increment delay so this doesn't run again.
    // if arr=0, repeat here, not entering 4
    // but if dascut, let shiftdelay == das + 1 and arrdelay = 0 which is not < arr
    } else if (this.shiftDelay === settings.DAS) {
      this.shift(this.shiftDir);
      if (settings.ARR !== 0 || dascut) this.shiftDelay++;
    // 4. Apply ARR delay
    } else if (this.arrDelay < settings.ARR) {
      this.arrDelay++;
    // 5. If ARR Delay is full, move piece, and reset delay and repeat.
    /*
    } else if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
    */
      if (this.arrDelay === settings.ARR && settings.ARR !== 0) {
        this.shift(this.shiftDir);
//        console.log("moveright")
      }
    }
  }
  if (flags.moveLeft3 & keysDown && !(lastKeys & flags.moveLeft3)) {
    this.multiShift(-1, 3);
    this.finesse++;
  } else if (flags.moveRight3 & keysDown && !(lastKeys & flags.moveRight3)) {
    this.multiShift(1, 3);
    this.finesse++;
  }
}
Piece.prototype.shift = function(direction) {
  
  this.arrDelay = 0;
  if (settings.ARR === 0 && this.shiftDelay === settings.DAS) {
    
    while (true) {
      if (this.moveValid(direction, 0, this.tetro)) {
        if (direction == 1) {
          shiftMatrix(RIGHT);
        } else {
          shiftMatrix(LEFT);
        }
        this.x += direction;
        /* farter */ //instant das under 20G
        if(this.gravity >= 20) {
          this.checkFall();
        }
        if (flags.moveDown & keysDown) {
          var grav = gravityArr[settings['Soft Drop'] + 1];
          if (grav >= 20) // 20G softdrop vs. 20G das
            this.y += this.getDrop(grav);
          //piece.finesse++;
          
        }
      } else {
        break;
      }
    }
  } else if (this.moveValid(direction, 0, this.tetro)) {
    if (this.delayCounting == true) {
      this.moveLimit++
    }
    this.x += direction;
    sound.playse("move");
  } else {
    if (direction == 1) {
      shiftMatrix(RIGHT);
    } else {
      shiftMatrix(LEFT);
    }
  }
  if (!(this.moveValid(direction, 0, this.tetro)) && (gametype === 8)) {
    this.arrDelay = settings.ARR - 1;
    this.shiftDelay = settings.DAS + 1;
  }
}
Piece.prototype.multiShift = function(direction, count) {
  for (var i = 0; i < count && this.moveValid(direction, 0, this.tetro); ++i) {
    this.x += direction;
    if(this.gravity >= 20) {
      this.checkFall();
    }
    if (flags.moveDown & keysDown) {
      var grav = gravityArr[settings['Soft Drop'] + 1];
      if (grav >= 20) // 20G softdrop vs. 20G das
        this.y += this.getDrop(grav);
      //piece.finesse++;
    }
  }
}
Piece.prototype.shiftDown = function() {
  if (this.moveValid(0, 1, this.tetro)) {
    var grav = gravityArr[settings['Soft Drop'] + 1];
    if (grav > 1){
      
      this.y += this.getDrop(grav);
    }else{
      this.y += grav;
  }
  }
}
Piece.prototype.hardDrop = function() {
  if (gametype !== 8 || gameparams.allowHardDrop == true) {
    
    if (gameparams.classicRule === true) {
      usedHardDrop = false
    } else {
      sound.playse("harddrop");
      
      usedHardDrop = true
    }
    
    var distance = this.getDrop(2147483647);
    this.y += distance;
    score = score.add(bigInt(distance + this.lockDelayLimit - this.lockDelay));
    newScore += (distance * 2)
    scoreNes += (distance * 2)
    scoreNesRefresh();
    //statisticsStack();
    if (gameparams.classicRule !== true) {
      this.lockDelay = this.lockDelayLimit;
    }
    
  }
}
Piece.prototype.getDrop = function (distance) {
  if (gametype !== 8) {
    if (!this.moveValid(0, 0, this.tetro))
      return 0;
    for (var i = 1; i <= distance; i++) {
      if ((!this.moveValid(0, i, this.tetro)))
        return i - 1;
    }
    return i - 1;
  } else {
    if (!this.moveValid(0, 0, this.tetro))
      return 0;
    for (var i = 1; i <= distance; i++) {
      if ((!this.moveValid(0, i, this.tetro)))
        return i - 1;
    }
    return i - 1;
  }

}
Piece.prototype.hold = function () {
  if (gametype !== 8) {
    var temp = hold.piece;
    if (!this.held) {
      if (hold.piece !== void 0) {
        hold.piece = this.index;
        this.new(temp);
      } else {
        hold.piece = this.index;
        this.new(preview.next());
      }
      this.held = true;
      document.getElementById("a").classList.add("greyed");
      hold.draw();
      
    }
  }

}

var classicRuleDelayLast = 0;

/**
 * Checks if position and orientation passed is valid.
 *  We call it for every action instead of only once a frame in case one
 *  of the actions is still valid, we don't want to block it.
 */
Piece.prototype.moveValid = function(cx, cy, tetro) {
  cx = cx + this.x;
  cy = Math.floor(cy + this.y);

  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (tetro[x][y] && (
        (cx + x < 0 || cx + x >= stack.width || cy + y >= stack.height) ||
        (cy + y >=0 && stack.grid[cx + x][cy + y])
      )) {
        return false;
      }
    }
  }
  if (gametype === 9 || (gametype === 6 && (gameparams.delayStrictness == 1 || gameparams.delayStrictness == 2 ))) {
    if ((gameparams.classicRule !== true && gametype === 9) || gameparams.delayStrictness == 1) {
      if (landed) {
        
        this.delayCounting = true;
        if (this.moveLimit < 11 && this.rotateLimit < 8) {
          this.lockDelay = 0;
        } else {
          
        }
      } else {
        this.lockDelay = 0;
      }
    } else if (gameparams.classicRule == true || gameparams.delayStrictness == 2) {
      if (classicRuleDelayLast < Math.floor(this.y)) {
        this.lockDelay = 0;
      }
      if (classicRuleDelayLast < Math.floor(this.y)) {
        classicRuleDelayLast = Math.floor(this.y) 
      }
      
      
      
      if (landed) {
      } else {
//      this.lockDelay = 0;
    }
    }
    
  } else {
    this.lockDelay = 0;
  }
  
  return true;
}

Piece.prototype.checkFall = function() {
  var grav = this.gravity;
  if (grav > 1) {
    this.y += this.getDrop(grav);
  }
  else {
    this.y += grav;
  }
  /* farter */ // rounding problem
  if (Math.abs(this.y - Math.round(this.y))<0.000001)
    this.y = Math.round(this.y);
}

Piece.prototype.checkLock = function() {
  if (landed) {
    this.y = Math.floor(this.y); //@sega
    if (this.lockDelay >= this.lockDelayLimit) {
      this.dead = true;
      stack.addPiece(this.tetro);
      if (usedHardDrop === false) {
        if (gametype === 8) {
          scoreNes += Math.floor(classicSoftDrop);
          scoreNesRefresh();
          classicSoftDrop = 0;
          lastYFrame = 0;
        }
        sound.playse("lock");
        if (gameparams.classicRule == true) {
          this.lockDelay = 0;
        }
        
      }
      usedHardDrop = false
      this.dirty = true;
      if(gameState === 9){ // lockout! don't spawn next piece
        if (gameparams.tournament === true) {
          $setText(msg, 'GAME SET');
        }
        return;
      }else{
        this.held = false;
        /* farter */
        // Win?
        checkWin();
        if (gameState === 0 && piece.dead) { // still playing, then spawn the next piece
          // determine next ARE limit
          if (gametype === 6) { //Death
            if (level < 20) {
              this.areLimit = [
                18, 18, 18, 15, 15, 12, 12, 12, 12, 12,
                12, 12, 10, 10, 10,  8,  8,  8,  8,  8
              ][level];
            } else {
              this.lockDelayLimit = 11;
              this.areLimit = 6;
            }
            if (lineClear !== 0) {
              lineARE = this.areLimit
              this.areLimit += lineARE;
            } else {
              lineARE = 0
            }
          } else if (gametype === 8) {
            if (piece.y >= 21) {
              this.areLimit = 10
            } else if (piece.y >= 17) {
              this.areLimit = 12
            } else if (piece.y >= 13) {
              this.areLimit = 14
            } else if (piece.y >= 9) {
              this.areLimit = 16
            } else {
              this.areLimit = 18
            }
            if (lineClear !== 0) {
              lineARE = 17
              this.areLimit += lineARE;
            } else {
              lineARE = 0
            }
          } else if (gametype === 9) {
              if (lineClear !== 0) {
                this.areLimit += lineARE;
                this.areLimit += lineAREb;
              }
              } else if (gametype === 1) {
                
                if (gameparams.entryDelay == 1) {
                  lineARE = 12;
                  this.areLimit = 6;
                  if (lineClear !== 0) {
                    this.areLimit = 24;
                  }
                }
                if (gameparams.entryDelay == 2) {
                  lineARE = 40;
                  this.areLimit = 25;
                  if (lineClear !== 0) {
                    this.areLimit = 65;
                  }
                }
              }
          else {
            this.areLimit = 0;
          }
          if (this.areLimit === 0) { // IRS IHS not possible
            this.new(preview.next()); // may die-in-one-frame
            
          } else {
            gameState = 4;
            this.are = 0;
//            document.getElementById("irs-indicator").style.display = "none";
          }
        }
      }
      /* farter */
    }
  }
}
var lastYFrame = 0;
var classicSoftDrop = 0;
var classicGravTest = 0;
var classicStoredY = 0;
Piece.prototype.update = function () {
  landed = !this.moveValid(0, 1, this.tetro);
  
  if (!(this.moveLimit < 10 && this.rotateLimit < 8)) {
    this.lockDelay = this.lockDelayLimit;
  }
  
  if (gametype === 8) {
    if (flags.moveDown & keysDown) {
      
      if (lastYFrame !== 0) {
        classicSoftDrop += (piece.y - lastYFrame);
      }
      lastYFrame = piece.y
    } else {
      classicSoftDrop = 0;
    }
    if (landed) {
      
        if (flags.moveDown & keysDown) {
        classicGravTest += gravityArr[settings['Soft Drop']]
      }
        classicGravTest += classicStoredY;
        classicGravTest += this.gravity
        if (classicGravTest >= 1) {
          this.lockDelay = 99;
          classicGravTest = 0;
        }

    } else {
      this.y += this.gravity
      piece.y += classicGravTest;
      classicStoredY = piece.y % 1;
      classicGravTest = 0;
    }
  } else {
    if (flags.moveDown & keysDown) {
      
      if (lastYFrame !== 0 && (piece.y - lastYFrame) > 0) {
        newScore += (piece.y - lastYFrame);
        $setText(statsScore, Math.floor(newScore).toLocaleString())
      }
      lastYFrame = piece.y
    }
  }
//  if (gametype === 9) {
//    if (this.moveLimit < 10 && this.rotateLimit < 8) {
//          console.log("okay!" + piece.moveLimit + " " + piece.rotateLimit)
//          this.lockDelay = 0;
//        } else {
//          this.lockDelay = this.lockDelayLimit;
//        }
//  }
  
  
  if (this.moveValid(0, 1, this.tetro) && gametype !== 8) {
    this.checkFall();
  }

  if (landed) {
    if ((flags.moveDown & keysDown) && (gametype === 9)) {
      if (gameparams.classicRule == true) {
        this.lockDelay = this.lockDelayLimit;
      } else {
        this.lockDelay += 3;
      }
        
    
  }
    if (!gameparams.noGravity) {
      this.lockDelay++;
    }
    
  this.checkLock();
  }
}
var stepSEPlayed;
Piece.prototype.draw = function() {
  clear(activeCtx);
  if (!this.dead) {
    this.drawGhost();
    if (settings.Ghost !== 3) {
      var a = void 0;
      
      if (landed) {
        
        if (stepSEPlayed !== true && gametype !== 8) {
          sound.playse("step");
          stepSEPlayed = true;
        }
        
        a = this.lockDelay / this.lockDelayLimit;
        if (this.lockDelayLimit === 0)
          a = 0;
        a = Math.pow(a,2)*0.5;
      } else {
        stepSEPlayed = false
      }
      draw(this.tetro, this.x, Math.floor(this.y) - stack.hiddenHeight, activeCtx, RotSys[settings.RotSys].color[this.index], a);
    }
  }
}

Piece.prototype.drawGhost = function() {
  activeCtx.globalAlpha = 0.4;
  if (settings.Ghost === 0 && !landed) {
    draw(this.tetro, this.x,
         Math.floor(this.y + this.getDrop(2147483647)) - stack.hiddenHeight, activeCtx, 0);
  } else if (settings.Ghost === 1 && !landed) {
    draw(this.tetro, this.x,
         Math.floor(this.y + this.getDrop(2147483647)) - stack.hiddenHeight, activeCtx, RotSys[settings.RotSys].color[this.index]);
  }
  activeCtx.globalAlpha = 1;
}

var piece = new Piece();