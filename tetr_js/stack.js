var alarm = false
var alarmtest = false
var clearRows = []
var levelCheck
var lockflashX = 0;
var lockflashY = 0;
var lockflashTetro;
var lockflash = 0;
var lockflashOn = false;
function Stack() {
  //this.grid;
}
/**
 * Creates a matrix for the playfield.
 */
Stack.prototype.new = function (x, y, hy) {
  var cells = new Array(x);
  for (var i = 0; i < x; i++) {
    cells[i] = new Array(hy + y);
  }
  this.width = x;
  this.height = hy + y;
  this.hiddenHeight = hy;
  this.grid = cells;

  this.dirty = true;
}


var classicLineClear = 0;
var lineClear = 0;
/**
 * Adds tetro to the stack, and clears lines if they fill up.
 */
function testSpace(x, y) {

  if (stack.grid[x] !== undefined) {
    if (y < 24) {
      if (stack.grid[x][y] !== undefined) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  } else {
    return true;

  }
}
var isSpin = false;
var isMini = false;
function spinCheck() {
  isSpin = false;
  isMini = false;
  if (piece.index !== 0 && piece.index !== 3) {
    
    let spinCheckCount = 0;
    for (var i = 0; i < pieces[piece.index].spin.highX[0].length; i++) {
      if ((testSpace(piece.x + pieces[piece.index].spin.highX[piece.pos][i], piece.y + pieces[piece.index].spin.highY[piece.pos][i])) == true) {
        spinCheckCount++;
      }
    }
    if (spinCheckCount < 2) {
      isMini = true;
    }
    for (var i = 0; i < pieces[piece.index].spin.lowX[0].length; i++) {
      if ((testSpace(piece.x + pieces[piece.index].spin.lowX[piece.pos][i], piece.y + pieces[piece.index].spin.lowY[piece.pos][i])) == true) {
        spinCheckCount++;
      }
    }
    if (spinCheckCount >= 3 && spinX == piece.x && spinY == piece.y && !rotationFailed) {
      isSpin = true;
    }
  } else if (piece.index == 0) {
    let spinCheckCount = 0;
    for (var i = 0; i < 2; i++) {
      if ( ((testSpace(piece.x + pieces[piece.index].spin.highX[piece.pos][i], piece.y + pieces[piece.index].spin.highY[piece.pos][i])) == true) || ((testSpace(piece.x + pieces[piece.index].spin.highX[piece.pos][i + 2], piece.y + pieces[piece.index].spin.highY[piece.pos][i + 2])) == true)) {
        spinCheckCount++;
      }
    }
    if (spinCheckCount < 2) {
      isMini = true;
    }
    for (var i = 0; i < 2; i++) {
      if ( ((testSpace(piece.x + pieces[piece.index].spin.lowX[piece.pos][i], piece.y + pieces[piece.index].spin.lowY[piece.pos][i])) == true) || ((testSpace(piece.x + pieces[piece.index].spin.lowX[piece.pos][i + 2], piece.y + pieces[piece.index].spin.lowY[piece.pos][i + 2])) == true ) ) {
        spinCheckCount++;
      }
    }
    if (spinCheckCount >= 3 && spinX == piece.x && spinY == piece.y && !rotationFailed) {
      isSpin = true;
    }
  }
}
Stack.prototype.addPiece = function (tetro) {
  shiftMatrix(DOWN)
  document.getElementById("a").classList.remove("greyed");
  lineClear = 0;
  
  var once = false;
  lockflashX = piece.x;
  lockflashY = piece.y;
  lockflashTetro = tetro;
  lockflash = 2;
  lockflashOn = true;
  var bottomRow = []; // for backfire
  for (var x = 0; x < this.width; x++) {
    bottomRow.push(this.grid[x][this.height - 1]);
  }

  // spin check
  /*
  if (
    !piece.moveValid(-1, 0, piece.tetro) &&
    !piece.moveValid(1, 0, piece.tetro) &&
    !piece.moveValid(0, -1, piece.tetro)
  ) {
    isSpin = true;
  }
  */

  spinCheck();

  // Add the piece to the stack.
  var range = [];
  var valid = false;
  for (var x = 0; x < tetro.length; x++) {
    for (var y = 0; y < tetro[x].length; y++) {
      if (tetro[x][y] && y + piece.y >= 0) {
        this.grid[x + piece.x][y + piece.y] = RotSys[settings.RotSys].color[piece.index];
        // Get column for finesse
        if (!once || x + piece.x < column) {
          column = x + piece.x;
          once = true;
        }
        // Check which lines get modified
        if (range.indexOf(y + piece.y) === -1) {
          range.push(y + piece.y);
          // This checks if any cell is in the play field. If there
          //  isn't any this is called a lock out and the game ends.
          if (y + piece.y >= this.hiddenHeight) valid = true;
        }
      }
    }
  }

  // Lock out
  if (!valid) {
    gameState = 9;
    $setText(msg, 'LOCK OUT!');
    menu(3);
    sound.playse("gameover");
    sound.playvox("lose");
    return;
  }

  // Check modified lines for full lines.
  range = range.sort(function (a, b) {
    return a - b
  });
  for (var row = range[0], len = row + range.length; row < len; row++) {
    var count = 0;
    for (var x = 0; x < this.width; x++) {
      if (this.grid[x][row]) count++;
    }
    // Clear the line. This basically just moves down the stack.
    // TODO Ponder during the day and see if there is a more elegant solution.
    if (count === this.width) {
      lineClear++; // NOTE stats
      var rowInDig = digLines.indexOf(row);
      if (rowInDig !== -1) {
        for (var y = 0; y < rowInDig; y++) {
          digLines[y]++;
        }
        digLines.splice(rowInDig, 1);
      }
      clearRows.push(row)
      for (var y = row; y >= row; y--) {
        for (var x = 0; x < this.width; x++) {
          this.grid[x][y] = 0
        }
      }
      //      for (var y = row; y >= 1; y--) {
      //        for (var x = 0; x < this.width; x++) {
      //          this.grid[x][y] = this.grid[x][y - 1];
      //        }
      //      }

      for (var x = 0; x < this.width; x++) {
        this.grid[x][0] = void 0;
      }

    }
  }
  if (lineClear !== 0) {
    lockflash = 0;
    lockflashOn = false;
  }
  if (piece.areLimit == 0 && (gameparams.entryDelay == (!(1 || 2)) || gameparams.entryDelay == undefined)) {
    stack.clearLines()
  }
  if (gametype === 9) {
    levelCheck = leveltgm
  }
  var scoreAdd = bigInt(level + 1);
  var garbage = 0;
  
  var pieceName = ["I", "J", "L", "O", "S", "T", "Z"][piece.index]
  if (gametype === 8) {
    if (lineClear !== 0) {
      switch (lineClear) {
        case 1:
          scoreNes += (40 * (level + 1));
          nontetNes += lineClear
          showTetrisMessage("SINGLE");
          break;
        case 2:
          scoreNes += (100 * (level + 1));
          nontetNes += lineClear
          showTetrisMessage("DOUBLE");
          break;
        case 3:
          scoreNes += (300 * (level + 1));
          nontetNes += lineClear
          showTetrisMessage("TRIPLE");
          break;
        case 4:
          scoreNes += (1200 * (level + 1));
          tetNes += lineClear
          showTetrisMessage("TETRIS");
          break;

      }
      scoreNesRefresh();
      tetRateNes = tetNes / (tetNes + nontetNes)
      tetRateNesRefresh();

      sound.playse("erase", lineClear);
      sound.playvox("erase", lineClear);
    }
  } else {
    if (lineClear !== 0) {
      //console.log("C"+combo+" B"+b2b)
      if (isSpin) {
        scoreAdd = scoreAdd.mul(
          bigInt([800, 1200, 1600, 2000][lineClear - 1])
          .mul(bigInt(2).pow(b2b + combo))
        );

        garbage = [[2, 4, 6, 8], [3, 6, 9, 12]][b2b != 0 ? 1 : 0][lineClear - 1];
        if (piece.index == 5) {
          if (b2b > 0) {
            sound.playvox("b2b_tspin", lineClear);

          } else {
            sound.playvox("tspin", lineClear);

          }
        } else {
          sound.playvox("erase", lineClear);
        }
        if (b2b > 0) {
          sound.playse("b2b_tspin", lineClear);
          
        } else {
          
          sound.playse("tspin", lineClear);

        }
        if (isMini) {
          newScore += ([0, 200, 400, 600, 800][lineClear] * (level + 1));
        } else {
          if (b2b > 0) {
            
            newScore += (([400, 800, 1200, 1600, 3000][lineClear] * (level + 1)) * 1.5);
          } else {
            
            newScore += ([400, 800, 1200, 1600, 3000][lineClear] * (level + 1));
          }
        }
        

        b2b += 1;
      } else if (lineClear === 4) {
        scoreAdd = scoreAdd.mul(
          bigInt(800)
          .mul(bigInt(2).pow(b2b + combo))
        );

        garbage = [4, 5][b2b != 0 ? 1 : 0];
        if (b2b > 0) {
          newScore += ((800 * (level + 1)) * 1.5);
          sound.playvox("b2b_erase", lineClear);
          sound.playse("b2b_erase", lineClear);
        } else {
          newScore += (800 * (level + 1));
          sound.playvox("erase", lineClear);
          sound.playse("erase", lineClear);
        }
        b2b += 1;



      } else {
        scoreAdd = scoreAdd.mul(
          bigInt([100, 300, 500, 800][lineClear - 1])
          .mul(bigInt(2).pow(combo))
        );
        newScore += ([100, 300, 500, 800][lineClear - 1] * (level + 1));
        b2b = 0;
        document.getElementById("b2bmsg").innerHTML = "";

        garbage = [0, 1, 2, 4][lineClear - 1];
        sound.playse("erase", lineClear);
        sound.playvox("erase", lineClear);
      }
      garbage += ~~(combo / 2); //[0,0,1,1,2,2,3,3,4,4,5,5,6,6,...]
      if (combo < 1) {

      } else if (combo < 5) {
        sound.playvox("ren1");
      } else if (combo < 10) {
        sound.playvox("ren2");
      } else {
        sound.playvox("ren3");
      }
      if (combo > 0) {
        if (combo > 7 && settings.Soundbank == 6) {
          sound.playse("ren/ren", 7);
        } else if (combo > 4 && settings.Soundbank == 9) {
          sound.playse("ren/ren", 4);
        } else if (combo > 20) {
          sound.playse("ren/ren", 20);
        } else {
          sound.playse("ren/ren", combo);
        }
      }

      combo += 1;
      if (combo > 1) {
        newScore += (50 * (combo - 1) * level)
      }


      if (gametype === 9) {
        if (lineClear == 1) {
          leveltgm += 1
          leveltgmvisible += 1
        } else if (lineClear == 2) {
          leveltgm += 2
          leveltgmvisible += 2
        } else if (lineClear == 3) {
          leveltgm += 4
          leveltgmvisible += 4
        } else if (lineClear == 4) {
          leveltgm += 6
          leveltgmvisible += 6
        }
      }

      //      switch (lineClear) {
      //        case 1:
      //          if (isSpin) {
      //            if (b2b > 1) {
      //            showTetrisMessage("<b>BACK-TO</b>-BACK<br>" + pieceName + "-<b>SPIN</b> SINGLE<br><small>" + b2b + "<b> STREAK!</b></small>");
      //          } else {
      //            showTetrisMessage(pieceName + "-<b>SPIN</b> SINGLE");
      //          }
      //          } else {
      //            showTetrisMessage("SINGLE");
      //          }
      //          break;
      //        case 2:
      //          if (isSpin) {
      //            if (b2b > 1) {
      //            showTetrisMessage("<b>BACK-TO</b>-BACK<br>" + pieceName + "-<b>SPIN</b> DOUBLE<br><small>" + b2b + "<b> STREAK!</b></small>");
      //          } else {
      //            showTetrisMessage(pieceName + "-<b>SPIN</b> DOUBLE");
      //          }
      //          } else {
      //            showTetrisMessage("DOUBLE");
      //          }
      //          break;
      //        case 3:
      //          if (isSpin) {
      //            if (b2b > 1) {
      //            showTetrisMessage("<b>BACK-TO</b>-BACK<br>" + pieceName + "-<b>SPIN</b> TRIPLE<br><small>" + b2b + "<b> STREAK!</b></small>");
      //          } else {
      //            showTetrisMessage(pieceName + "-<b>SPIN</b> TRIPLE");
      //          }
      //          } else {
      //            showTetrisMessage("TRIPLE");
      //          }
      //          
      //          break;
      //        case 4:
      //          if (b2b > 1) {
      //            showTetrisMessage("<b>BACK-TO</b>-BACK<br>TETRIS<br><small>" + b2b + "<b> STREAK!</b></small>");
      //          } else {
      //            showTetrisMessage("TETRIS");
      //          }
      //          
      //          break;
      //      }
      sendClearTetrisMessage(isSpin, (isMini && isSpin));
    } else {
      if (isSpin) {
        let miniText = "";
        scoreAdd = scoreAdd.mul(
          bigInt(2).pow(bigInt(b2b))
          .mul(bigInt(400))
        );
        if (settings.Soundbank != 0 && lineClear == 0) {
          sound.playse("tspin", lineClear);
        }
        
        if (isMini) {
          miniText = " MINI";
        }
        showTetrisMessage(pieceName + "-<b>SPIN</b>" + miniText);
        if (!isMini) {
          newScore += ([400, 800, 1200, 1600][lineClear] * (level + 1));
        } else {
          newScore += (100 * (level + 1));
        }
        if (piece.index == 5) {

          sound.playvox("tspin", lineClear)

        }

      } else {
        scoreAdd = bigInt(0);
      }
      if (combo > 1) {
        if (settings.Voice == 1 && settings.Voicebank == 2) {
          showTetrisMessage("<b>" + (combo - 1) + "</b>" + " REN!");
        } else {
          showTetrisMessage("<b>" + (combo - 1) + "</b>" + " COMBO!");
        }

      }
      if (combo > 10) {
        sound.playse("bravo")
      }

      combo = 0;
      document.getElementById("renmsg").innerHTML = "";
    }
  }
  lines += lineClear;
  if (gametype !== 9) {
    levelCheck = level
  }
  
  
  if (gametype === 1 || gametype === 6) {
    if (gameparams.levelCap == 1) {
      level = Math.min(~~(lines / 10), 14);
    } else {
      level = ~~(lines / 10);
    }
  } else if (gametype === 7) {
    level = ~~(lines / 30);
  } else if (gametype === 8) {
    var startLevel = gameparams.startingLevel;
    var startingLines = Math.min((Math.max(100, startLevel * 10 - 50)), (startLevel * 10 + 10));
    level = ~~Math.max(((lines + 10 - startingLines + (startLevel * 10)) / 10), startLevel);
    makeSprite();
    stack.draw();
  }
  if (gametype !== 9) {
    if (levelCheck !== level) {
      sound.playse("levelup")
      document.getElementById("level").classList.remove("level-flash");
  void document.getElementById("level").offsetWidth;
  document.getElementById("level").classList.add("level-flash");
    }
    
  }
  if (gametype === 1) {
    if (gameparams.invisibleMarathon == true && level > 19) {
      if (watchingReplay) {
        document.getElementById("stack").classList.add("invisible-replay")
      } else {
        document.getElementById("stack").classList.add("invisible")
      }

    } else {
      document.getElementById("stack").classList.remove("invisible-replay")
      document.getElementById("stack").classList.remove("invisible")
    }
  }

  if (level >= 20 && gametype === 1) {
    if (playedLevelingbgmMarathon[1] === false) {
      sound.killbgm()
      sound.playbgm("marathon3")
      playedLevelingbgmMarathon[1] = true
    }
  } else if (level >= 10 && gametype === 1) {
    if (playedLevelingbgmMarathon[0] === false) {
      sound.killbgm()
      sound.playbgm("marathon2")
      playedLevelingbgmMarathon[0] = true
    }
  }

  if (leveltgm >= 700 && gametype === 9) {
    if (playedLevelingbgmGrades[1] === false) {
      sound.killbgm()
      sound.playbgm("grade3")
      playedLevelingbgmGrades[1] = true
    }
  } else if (leveltgm >= 500 && gametype === 9) {
    if (playedLevelingbgmGrades[0] === false) {
      sound.killbgm()
      sound.playbgm("grade2")
      playedLevelingbgmGrades[0] = true
    }
  }

  score = score.add(scoreAdd.mul(bigInt(16).pow(allclear)));
  makeSprite();
  stack.draw();
  var pc = true;
  for (var x = 0; x < this.width; x++)
    for (var y = 0; y < this.height; y++)
      if (this.grid[x][y])
        pc = false;
  if (pc) {
    score = score.add(bigInt(1000000).mul(bigInt(16).pow(allclear)));
    allclear++;
    sound.playse("bravo");
    showTetrisMessage("<b>PERFECT</b> CLEAR!")
    garbage += 10;
  }

  if (gameparams && gameparams.backFire) {
    if (gameparams.backFire === 1) {
      garbage = [0, 0, 1, 2, 4][lineClear];
    } else if (gameparams.backFire === 3) {
      garbage *= ~~(lines / 2);
    }
    if (garbage !== 0) {
      if (gameparams.backFire === 1) {
        for (var y = 0; y < garbage; y++) {
          this.rowRise(bottomRow, piece);
        }
      } else if (gameparams.backFire === 2 || gameparams.backFire === 3) {
        var hole = ~~(rng.next() * 10);
        var arrRow = [8, 8, 8, 8, 8, 8, 8, 8, 8, 8];
        arrRow[hole] = 0;
        for (var y = 0; y < garbage; y++) {
          this.rowRise(arrRow, piece);
        }
      }
    }
  }

  //if (scoreAdd.cmp(0) > 0)
  //console.log(scoreAdd.toString());

  statsFinesse += piece.finesse - finesse[piece.index][piece.pos][column];
  piecesSet++;
  if (gametype === 9) {
    if ((leveltgmvisible % 100) !== 99) {
      leveltgm++
      leveltgmvisible++
    }
    if (gametype === 9) {
      if (Math.floor((levelCheck / 100) % 10) !== Math.floor((leveltgm / 100) % 10)) {
        sound.playse("levelup")
      }
    }

    //        if (leveltgmvisible > 70 && scoreTime <= 52000) {
    //          console.log("Cool!")
    //          leveltgm += 100 //work on later
    //        } if (leveltgmvisible <= 100 && scoreTime >= 75000) {
    //              console.log("REGRET")     
    //          }
    //

    //Section COOL
    //    if (leveltgmvisible)

  }
  // NOTE Stats
  // TODO Might not need this (same for in init)
  column = 0;
  function checkAlarm(grid) {
    var clearPath = false;
    for (var i = 0; i < stack.width; i++) {
      var clearPathHeight;
      for (var j = 0; j <= stack.height; j++) {
        if (j == stack.height) {
          clearPath = true;
        }
        if (grid[i][j] !== undefined && grid[i][j] !== 0) {
          break;
        }

      }
      if (clearPath) {
        break;
      }
    }
    alarmtest = false
    for (var test in grid) {
      if (((grid[test][8] != undefined) && alarm == false && clearPath == false) || ((grid[test][11] != undefined) && alarm == true)) {

        alarmtest = true;
      }
    }
    if (clearPath && alarm == true) {
      alarmtest = false;
    }
    if (alarmtest == true && alarm == false) {
      alarm = true
      alarmtest = false
      sound.playse("alarm")
      document.getElementById("bgStack").classList.add("alarm");
      if (gametype === 3 || gametype === 7 || (gametype === 6 && gameparams.delayStrictness === 2)) {
        console.log("eee")
        sound.raisesidebgm()
      }
    } else if (alarmtest == false && alarm == true) {
      alarm = false
      sound.stopse("alarm")
      document.getElementById("bgStack").classList.remove("alarm");
      if (gametype === 3 || gametype === 7 || (gametype === 6 && gameparams.delayStrictness === 2)) {
        sound.lowersidebgm()
      }
    }
  }
  checkAlarm(stack.grid);
  this.dirty = true;
}
/**
 * Raise a garbage line. farter
 */
Stack.prototype.clearLines = function () {
  //  console.log("clearrow")

  clearRows.forEach(function (element) {
    for (var y = element; y >= 1; y--) {
      for (var x = 0; x < stack.width; x++) {
        stack.grid[x][y] = stack.grid[x][y - 1];
      }
    }
  });
  if (clearRows.length !== 0) {
    if (lineARE != 0) {
      sound.playse("linefall")
    }
    clearRows = []
    stack.draw()
  }

  
  
}
Stack.prototype.rowRise = function (arrRow, objPiece) {
  var isEmpty = true;
  for (var x = 0; x < this.width; x++) {
    for (var y = 0; y < this.height - 1; y++) {
      this.grid[x][y] = this.grid[x][y + 1];
    }
    if (arrRow[x])
      isEmpty = false;
    this.grid[x][this.height - 1] = arrRow[x];
  }
  var topout = false;
  for (var y = 0; y < digLines.length; y++) {
    digLines[y]--;
    if (digLines[y] < 0) { // top out, but only detecting added lines
      topout = true;
    }
  }
  if (topout) {
    gameState = 9;
    $setText(msg, 'TOP OUT!');
    menu(3);
    sound.playse("gameover");
    sound.playvox("lose");
  }
  if (!isEmpty) {
    digLines.push(this.height - 1);
  }
  if (!piece.dead) {
    if (!piece.moveValid(0, 0, piece.tetro)) {
      piece.y -= 1;
      if (piece.y + pieces[piece.index].rect[3] <= this.hiddenHeight - 2) { // the bottom is >=2 cell away from visible part
        gameState = 9;
        $setText(msg, 'OOPS!');
        menu(3);
        sound.playse("gameover");
        sound.playvox("lose");
      }
    }
    piece.dirty = true;
  }
  this.dirty = true;
}
/**
 * Draws the stack.
 */
Stack.prototype.draw = function () {
  clear(stackCtx);
  if (settings.Outline === 0 || settings.Outline === 1 ||
    (settings.Outline === 2 && (gameState === 9 || gameState === 1))
  ) {
    draw(this.grid, 0, -this.hiddenHeight, stackCtx, void 0, 0.3);
  }

  // Darken Stack
  // TODO wrap this with an option.
  // no fullscreen flush, see above
  //stackCtx.globalCompositeOperation = 'source-atop';
  //stackCtx.fillStyle = 'rgba(0,0,0,0.3)';
  //stackCtx.fillRect(0, 0, stackCanvas.width, stackCanvas.height);
  //stackCtx.globalCompositeOperation = 'source-over';

  if (settings.Outline === 1 || settings.Outline === 3) {
    var b = ~~(cellSize / 8);
    var c = cellSize;
    var hhc = this.hiddenHeight * c;
    var pi = Math.PI;
    var lineCanvas = document.createElement('canvas');
    lineCanvas.width = stackCanvas.width;
    lineCanvas.height = stackCanvas.height;

    var lineCtx = lineCanvas.getContext('2d');
    lineCtx.fillStyle = 'rgba(255,255,255,.5)';
    lineCtx.beginPath();
    for (var x = 0, len = this.width; x < len; x++) {
      for (var y = 0, wid = this.height; y < wid; y++) {
        if (this.grid[x][y]) {
          if (x < this.width - 1 && !this.grid[x + 1][y]) {
            lineCtx.fillRect(x * c + c - b, y * c - hhc, b, c);
          }
          if (x > 0 && !this.grid[x - 1][y]) {
            lineCtx.fillRect(x * c, y * c - hhc, b, c);
          }
          if (y < this.height - 1 && !this.grid[x][y + 1]) {
            lineCtx.fillRect(x * c, y * c - hhc + c - b, c, b);
          }
          if (!this.grid[x][y - 1]) {
            lineCtx.fillRect(x * c, y * c - hhc, c, b);
          }
          // Diags
          if (x < this.width - 1 && y < this.height - 1) {
            if (!this.grid[x + 1][y] && !this.grid[x][y + 1]) {
              lineCtx.clearRect(x * c + c - b, y * c - hhc + c - b, b, b);
              lineCtx.fillRect(x * c + c - b, y * c - hhc + c - b, b, b);
            } else if (!this.grid[x + 1][y + 1] && this.grid[x + 1][y] && this.grid[x][y + 1]) {
              lineCtx.moveTo(x * c + c, y * c - hhc + c - b);
              lineCtx.lineTo(x * c + c, y * c - hhc + c);
              lineCtx.lineTo(x * c + c - b, y * c - hhc + c);
              lineCtx.arc(x * c + c, y * c - hhc + c, b, 3 * pi / 2, pi, true);
            }
          }
          if (x < this.width - 1 && y > -this.hiddenHeight) {
            if (!this.grid[x + 1][y] && !this.grid[x][y - 1]) {
              lineCtx.clearRect(x * c + c - b, y * c - hhc, b, b);
              lineCtx.fillRect(x * c + c - b, y * c - hhc, b, b);
            } else if (!this.grid[x + 1][y - 1] && this.grid[x + 1][y] && this.grid[x][y - 1]) {
              lineCtx.moveTo(x * c + c - b, y * c - hhc);
              lineCtx.lineTo(x * c + c, y * c - hhc);
              lineCtx.lineTo(x * c + c, y * c - hhc + b);
              lineCtx.arc(x * c + c, y * c - hhc, b, pi / 2, pi, false);
            }
          }
          if (x > 0 && y < this.height - 1) {
            if (!this.grid[x - 1][y] && !this.grid[x][y + 1]) {
              lineCtx.clearRect(x * c, y * c - hhc + c - b, b, b);
              lineCtx.fillRect(x * c, y * c - hhc + c - b, b, b);
            } else if (!this.grid[x - 1][y + 1] && this.grid[x - 1][y] && this.grid[x][y + 1]) {
              lineCtx.moveTo(x * c, y * c - hhc + c - b);
              lineCtx.lineTo(x * c, y * c - hhc + c);
              lineCtx.lineTo(x * c + b, y * c - hhc + c);
              lineCtx.arc(x * c, y * c - hhc + c, b, pi * 2, 3 * pi / 2, true);
            }
          }
          if (x > 0 && y > -this.hiddenHeight) {
            if (!this.grid[x - 1][y] && !this.grid[x][y - 1]) {
              lineCtx.clearRect(x * c, y * c - hhc, b, b);
              lineCtx.fillRect(x * c, y * c - hhc, b, b);
            } else if (!this.grid[x - 1][y - 1] && this.grid[x - 1][y] && this.grid[x][y - 1]) {
              lineCtx.moveTo(x * c + b, y * c - hhc);
              lineCtx.lineTo(x * c, y * c - hhc);
              lineCtx.lineTo(x * c, y * c - hhc + b);
              lineCtx.arc(x * c, y * c - hhc, b, pi / 2, pi * 2, true);
            }
          }
        }
      }
    }
    lineCtx.fill();
    stackCtx.globalCompositeOperation = 'source-over';
    stackCtx.drawImage(lineCanvas, 0, 0);
    stackCtx.fillStyle = "#ffffff"
    
  }

  statisticsStack();

  this.dirty = false;
}
var stack = new Stack();