'use strict';

var BOMB = '💣';
var FLAG = '🚩';
var BOMBED = '💥';
var LIVES = '❤❤❤';
var gBoard = [];
var gCurrDiff = 4;
var gGameTime;
var gInterval;
var isFirstMove = true;
var gIsGameOn = true;
var gUnOpenedCells;
var gTotalBombs;
var gFlagged = 0;
var gHintOn = false;
var gSafeClick = 3;



function init(difficulty = gCurrDiff) {
    gCurrDiff = difficulty;
    gIsGameOn = true;
    clearInterval(gInterval);
    isFirstMove = true;
    gBoard = createBoard(difficulty);
    renderBoard(gBoard);
    var elFace = document.querySelector('.smiley');
    elFace.innerText = '😀';
    LIVES = '❤❤❤';
    var elLiveCounter = document.querySelector('.life');
    elLiveCounter.innerText = LIVES;
    // console.log('bomb amount:', gTotalBombs);
    gFlagged = 0;
    if (localStorage.easy)
        getHighScore();
    else {
        localStorage.easy = 9999;
        localStorage.medium = 9999;
        localStorage.hard = 9999;
        getHighScore();
    }
    gUnOpenedCells = (gBoard.length ** 2) - gTotalBombs;
    var elTable = document.querySelector('table');
    elTable.style.fontSize = 0 + 'rem';
}
function createBoard(size) {
    var mat = [];

    for (var i = 0; i < size; i++) {
        mat[i] = [];
        for (var j = 0; j < size; j++) {
            var cell = {
                type: '',
                isFlagged: false,
                isShow: false,
                isBomb: false,
                isExtacted:false
            }
            mat[i][j] = cell;
        }
    }
    var bombAmount;
    // console.log(mat);
    switch (size) {
        case 4:
            bombAmount = 2;
            break;
        case 8:
            bombAmount = 12;
            break;
        case 12:
            bombAmount = 30;
            break;
        default:
            bombAmount = parseInt(size * 1.5);
            break;
    }
    gTotalBombs = bombAmount;
    while (bombAmount > 0) {
        i = getRandomIntInclusive(0, size - 1);
        j = getRandomIntInclusive(0, size - 1);

        if (mat[i][j].type === '') {
            mat[i][j].type = BOMB;
            bombAmount--;
            mat[i][j].isBomb = true;
        }

    }
    return mat;
}
function renderBoard(mat) {

    var strHTML = '';
    for (var i = 0; i < mat.length; i++) {
        strHTML += `<tr class="board-cell show-card ">\n`;
        for (var j = 0; j < mat.length; j++) {
            // console.log(`j`, j);
            // console.log(`i`, i);

            strHTML += `<td class="board-cell row${i} col${j} " onclick="cellClick(this, ${i}, ${j})" oncontextmenu="cellFlagged(this,${i},${j})">${gBoard[i][j].type}</td>`;
            // if (j===mat.length-1) continue;
        }
        strHTML += `</tr>`;
    }
    var elBoard = document.querySelector('.board-cell');
    elBoard.innerHTML = strHTML;
    // console.log(elBoard);
}
function cellClick(elClicked, row, col) {
    
    if ((gIsGameOn) && (!gBoard[row][col].isShow)&&(!gBoard[row][col].isFlagged)) {
        gBoard[row][col].isShow = true;
        if (isFirstMove) {
            if (gBoard[row][col].type === BOMB) {
                addBomb(gBoard);
                gBoard[row][col].type = '';
            }
            gGameTime = new Date().getTime();

            isFirstMove = false;
            gInterval = setInterval(showStopwatch, 50);
        }
        if (elClicked.innerText !== FLAG) {
            elClicked.style.fontSize = .83 + 'rem';
            if (gBoard[row][col].type === BOMB) {
                elClicked.innerText = BOMBED;
                elClicked.style.backgroundColor = 'red';
                var elLiveCounter = document.querySelector('.life');
                LIVES = LIVES.slice(0, -1);
                gFlagged++;
                var elSmiley = document.querySelector('.smiley');
                elSmiley.innerText = '🤯';
                elLiveCounter.innerText = LIVES;
                // console.log(LIVES);
                if (LIVES === '')
                    gameOver();
                // return;
            }
            else {
                var elSmiley = document.querySelector('.smiley')
                elSmiley.innerText = '😀';
                // if (!gBoard[row][col].isFlagged) {
                    var bombCount = countNeighboors(row, col);
                    if (bombCount) {
                        gUnOpenedCells--;
                        elClicked.innerText = bombCount;
                        colorizeCell(elClicked, bombCount);
                    }

                    else {

                        elClicked.style.backgroundColor = 'rgb(0, 204, 255)';
                        cellExtractor(row, col);
                        gUnOpenedCells--;
                    colorizeCell(elClicked,0);

                    
                }

            }
        }
    }

    
    console.log(gUnOpenedCells)
    if ((gFlagged === gTotalBombs) && (gUnOpenedCells === 0)&&gIsGameOn) {
        victoryMessage();
    }
    // console.log('Unclicked cells:', gUnOpenedCells)
}
function cellExtractor(row, col) {
gBoard[row][col].isExtacted=true;
    for (var i = row - 1; i <= row + 1; i++) {
        if ((i >= 0) && (i + 1 <= gBoard.length))
            for (var j = col - 1; j <= col + 1; j++) {
                if ((j >= 0) && (j + 1 <= gBoard.length))
                    if ((i !== row) || (j !== col)) {
                        var elCloseCell = document.querySelector('.row' + i + '.col' + j);
                        // console.log('elCloseCell', elCloseCell);
                        // console.log(i, j);
                        var cellNegs = countNeighboors(i, j);
                        if ((cellNegs===0)&&(!gBoard[i][j].isExtacted)) cellExtractor(i,j);
                        if (!gBoard[i][j].isShow) gUnOpenedCells--;
                        gBoard[i][j].isShow = true;
                        elCloseCell.innerText = cellNegs;
                        colorizeCell(elCloseCell, cellNegs);
                        elCloseCell.style.fontSize = 1 + 'rem';
                        // console.log('gUnOpenedCells in extractor:',gUnOpenedCells);


                    }

            }
    }
    

}


function colorizeCell(cellToColor, bombsNearby) {
    switch (bombsNearby) {
        case 1: cellToColor.style.backgroundColor = 'blue';
            break;
        case 2: cellToColor.style.backgroundColor = 'rgb(8, 128, 226)';
            break;
        case 3: cellToColor.style.backgroundColor = 'rgb(20, 212, 84)'
            break;
        case 4: cellToColor.style.backgroundColor = 'rgb(132, 238, 61)';
            break;
        case 5: cellToColor.style.backgroundColor = 'rgb(247, 243, 9)';
            break;
        case 6: cellToColor.style.backgroundColor = 'rgb(228, 94, 5)';
            break;
        case 7: cellToColor.style.backgroundColor = ' rgb(178, 10, 230)';
            break;
        case 8: cellToColor.style.backgroundColor = 'rgb(0,0,0)';
            break;
        case 0: cellToColor.style.backgroundColor = 'rgb(0, 204, 255)';
        cellToColor.innerText= '';
        break;
        default:
            cellToColor.style.backgroundColor = 'rgb(0, 204, 255)';
            break;
    }
    cellToColor.style.fontSize = 1+'rem';
}

function cellFlagged(elClicked, row, col) {
    if (isFirstMove) {
        isFirstMove = false;
        gGameTime = new Date().getTime();
        gInterval = setInterval(showStopwatch, 50);
        gIsGameOn=true;
    }
    if(gIsGameOn) {
        if (((elClicked.style.fontSize !== 1+'rem')&&(elClicked.style.fontSize !==.83+'rem')) || (elClicked.innerText === FLAG)) {
            if (elClicked.innerText !== FLAG) {
                elClicked.innerText = FLAG;
                gFlagged++;
                // console.log(gFlagged);
                elClicked.style.fontSize = .83 + 'rem';
                elClicked.style.backgroundColor='rgb(156, 79, 79)'
                gBoard[row][col].isFlagged = true;
            }
            else if (elClicked.innerText === FLAG) {
                elClicked.style.fontSize = 0 + 'rem';
                elClicked.style.backgroundColor='rgb(73, 73, 73)'
                gFlagged--;
                // console.log(gFlagged)
                if (gBoard[row][col].isBomb)
                    elClicked.innerText = BOMB;
                else
                    elClicked.innerText = '';
                gBoard[row][col].isFlagged = false;
            }

        }
        // console.log(gUnOpenedCells)
        if ((gFlagged === gTotalBombs) && (gUnOpenedCells === 0)) {
            victoryMessage();
        }
    }
}



function gameOver() {
    var showBoard = document.querySelector('table');
    clearInterval(gInterval);
    showBoard.style.fontSize = .83 + 'rem';
    gIsGameOn = false;
    // console.log('gUnOpenedCells:', gUnOpenedCells);
    alert('You Lost!');
}

function countNeighboors(row, col) {
    var bombsNear = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        if ((i >= 0) && (i + 1 <= gBoard.length))
            for (var j = col - 1; j <= col + 1; j++)
                if ((j >= 0) && (j + 1 <= gBoard.length))
                    if ((i !== row) || (j !== col))
                        if (gBoard[i][j].type === BOMB) bombsNear++;

    }
    // console.log(bombsNear);
    return bombsNear;
}


function showStopwatch() {
    var diff = new Date().getTime();
    var elStopwatch = document.querySelector('.stopwatch');
    diff = (diff - gGameTime) / 1000;
    elStopwatch.innerText = diff;
}

function victoryMessage() {
    var elScore = document.querySelector('.stopwatch');
    var victoryScore = parseFloat(elScore.innerText);
    // console.log(victoryScore);
    switch (gCurrDiff) {
        case 4: if (localStorage.easy > victoryScore) localStorage.easy = victoryScore; break;
        case 8: if (localStorage.medium > victoryScore) localStorage.medium = victoryScore; break;
        case 12: if (localStorage.hard > victoryScore) localStorage.hard = victoryScore; break;
       
        default: /*if (localStorage.randomBoardSize < victoryScore) localStorage.randomBoardSize = victoryScore;*/ break;

    }
    
    clearInterval(gInterval)
    var elFace = document.querySelector('.smiley');
    elFace.innerText = '😎';
    gIsGameOn = false;

    alert('Congrats! you win!');
}

function addBomb(mat) {
    var isEmpty = true;
    while (isEmpty) {
        var i = getRandomIntInclusive(0, mat.length - 1);
        var j = getRandomIntInclusive(0, mat.length - 1);

        if (mat[i][j].type === '') {
            mat[i][j].type = BOMB;
            mat[i][j].isBomb = true;
            isEmpty = false;
        }
    }
}

function getHighScore() {
    var elScores = document.querySelector('.highscores');
    elScores.innerHTML = `High score for easy:${localStorage.easy} <br> High score for medium:${localStorage.medium}<br>High score for hard:${localStorage.hard}`;


}



function hintClicked(hints)
{gHintOn=true
hints.innerText= hints.innerText.slice(0,-1)


}
// function mouseDown(that){
//     console.log(that)
//     var elFace=document.querySelector('.smiley')
//     //  = elFace.innerText
//     elFace.innerText='😮'
// }

// // function mouseUp(){
// //     console.log()
// //     var elFace=document.querySelector('.smiley');
// //     elFace.innerText=;
// // }


