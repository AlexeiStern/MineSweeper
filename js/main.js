'use strict';

var BOMB = '💣';
var FLAG = '🚩';
var BOMBED = '💥';
var gBoard = [];
var gCurrDiff = 4;
var gGameTime;
var gInterval;
var isFirstMove = true;


function init(difficulty = gCurrDiff) {
    gCurrDiff = difficulty;
    clearInterval(gInterval);
    isFirstMove = true;
    gBoard = createBoard(difficulty);
    renderBoard(gBoard);
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
                isShow: false
            }
            mat[i][j] = cell;
        }
    }
    console.log(mat);
    var bombAmout;
    switch (size) {
        case 4:
            bombAmout = 2;
            break;
        case 8:
            bombAmout = 12;
            break;
        case 12:
            bombAmout = 30;
            break;
        default:
            bombAmout = parseInt(size * 1.5);
            break;
    }

    while (bombAmout > 0) {
        i = getRandomIntInclusive(0, size - 1);
        j = getRandomIntInclusive(0, size - 1);

        if (mat[i][j].type === '') {
            mat[i][j].type = BOMB;
            bombAmout--;
        }

    }
    return mat;
}


function renderBoard(mat) {

    var strHTML = '';
    for (var i = 0; i < mat.length; i++) {
        strHTML += `<tr class="board-cell show-card ">\n`
        for (var j = 0; j < mat.length; j++) {
            console.log(`j`, j);
            console.log(`i`, i);

            strHTML += `<td class="board-cell row${i} col${j} " onclick="cellClick(this, ${i}, ${j})" oncontextmenu="cellFlagged(this,${i},${j})">${gBoard[i][j].type}</td>`;
            // if (j===mat.length-1) continue;
        }
        strHTML += `</tr>`;
    }
    var elBoard = document.querySelector('.board-cell');
    elBoard.innerHTML = strHTML;
    console.log(elBoard);
}

function cellClick(elClicked, row, col) {
    // gBoard[row][col].isShow = true;
    console.log('Row:', row, 'Col:', col)
    console.log(elClicked)

    // var elTest=document.querySelector('.row'+row, '.col'+col)

    //                 console.log(elTest)
    if (isFirstMove) {
        gGameTime = new Date().getTime();
        isFirstMove = false;
        gInterval = setInterval(showStopwatch, 50);
    }
    elClicked.style.fontSize = 1 + 'rem';
    if (gBoard[row][col].type === BOMB) {
        elClicked.innerText = BOMBED;
        elClicked.style.backgroundColor ='red'
        gameOver();
        return;
    }
    else if (!gBoard[row][col].isFlagged)

        var bombCount = countNeighboors(row, col);
    if (bombCount) {
        elClicked.innerText = bombCount;
        colorizeCell(elClicked,bombCount)    
    }
    
    else {
        elClicked.innerText = bombCount;
        elClicked.style.backgroundColor = 'rgb(0, 204, 255)';
        cellExtractor(row, col);
    }
}

function cellExtractor(row, col) {

    for (var i = row - 1; i <= row + 1; i++) {
        if ((i >= 0) && (i + 1 <= gBoard.length))
            for (var j = col - 1; j <= col + 1; j++) {
                if ((j >= 0) && (j + 1 <= gBoard.length))
                    if ((i !== row) || (j !== col)) {
                        var elCloseCell = document.querySelector('.row' + i+ '.col' + j)
                        console.log('elCloseCell',elCloseCell)
                        console.log(i,j)
                       var  cellNegs = countNeighboors(i, j)
                        elCloseCell.innerText = cellNegs
                     colorizeCell(elCloseCell,cellNegs)
                        elCloseCell.style.fontSize = 1 + 'rem';


                    }

            }
    }
}


function colorizeCell(cellToColor,bombsNearby)
{
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
            break
            case 0:  cellToColor.style.backgroundColor = 'rgb(0, 204, 255)';
        default:
            cellToColor.style.backgroundColor = 'rgb(0, 204, 255)';
            break;
    }
}

function cellFlagged(elClicked, row, col) {
    elClicked.style.fontSize = 1 + 'rem';
    if (elClicked.innerText === '') {
        elClicked.innerText = FLAG;
        gBoard[row][col].isFlagged = true;
    }
    else if (elClicked.innerText === FLAG) {
        elClicked.innerText = '';
        gBoard[row][col].isFlagged = false;
    }

}

function gameOver() {
    var showBoard = document.querySelector('table');
    clearInterval(gInterval);
    showBoard.style.fontSize = 1 + 'rem';
    alert('You Lost!');
}

function countNeighboors(row, col) {
    var bombsNear = 0
    for (var i = row - 1; i <= row + 1; i++) {
        if ((i >= 0) && (i + 1 <= gBoard.length))
            for (var j = col - 1; j <= col + 1; j++)
                if ((j >= 0) && (j + 1 <= gBoard.length))
                    if ((i !== row) || (j !== col))
                        if (gBoard[i][j].type === BOMB) bombsNear++;

    }
    console.log(bombsNear);
    return bombsNear;
}


function showStopwatch() {
    var diff = new Date().getTime();
    var elStopwatch = document.querySelector('.stopwatch');
    diff = (diff - gGameTime) / 1000;
    elStopwatch.innerText = diff;
}


// function pauseGame()
// {



// }


// function countBombsOnBoard(board) {




// }
