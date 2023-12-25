// script.js

var board = document.getElementById('gameBoard');
var currentPlayer = 'userA';
var columns = 7;
var rows = 6;
var gameEnded = false; // 游戏状态标志
var isDropping = false; // 控制落子操作的标志
var playerNames = {
    'userA': '红方',
    'userB': '蓝方'
};



function createBoard() {
    for (var i = 0; i < columns * rows; i++) {
        var cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', dropPiece);
        board.appendChild(cell);
        assignBingoId(board); // 给棋盘单元格分配binggo-id
    }
}

function dropPiece() {
    if (gameEnded || isDropping) {
        return; // 如果游戏已结束或正在进行落子操作，不执行任何操作
    }

    var columnCells = getColumnCells(getColumnIndex(this));
    var hasSpace = false;

    for (var i = columnCells.length - 1; i >= 0; i--) {
        if (!columnCells[i].hasChildNodes()) {
            hasSpace = true;
            isDropping = true; // 开始落子操作

            var piece = document.createElement('div');
            piece.classList.add('piece', currentPlayer, 'animate-drop');

            var icon = document.createElement('iconpark-icon');
            icon.setAttribute('stroke-width', '10');
            icon.setAttribute('name', 'Star');
            piece.appendChild(icon);

            columnCells[i].appendChild(piece);

            piece.addEventListener('animationend', () => {
                if (checkWin(currentPlayer)) {
                    showVictoryPopup(currentPlayer);
                    gameEnded = true;
                } else {
                    currentPlayer = currentPlayer === 'userA' ? 'userB' : 'userA';
                }
                isDropping = false; // 落子操作完成
            }, { once: true });

            break;
        }
    }

    if (!hasSpace) {
        // 如果这一列已满，直接返回而不更改isDropping
        return;
    }
    // 落子操作完成后，输出棋盘状态，如果已经输出过，刷新棋盘状态。
    console.clear();
    printBoard();
    // 在控制台 输出当前落子位置
    console.log(playerNames[currentPlayer] + '落子：' + this.getAttribute('columns') + ' - ' + this.getAttribute('rows'));
}


function getColumnIndex(cell) {
    return Array.prototype.indexOf.call(board.children, cell) % columns;
}

function getColumnCells(index) {
    var columnCells = [];
    for (var i = index; i < board.children.length; i += columns) {
        columnCells.push(board.children[i]);
    }
    return columnCells;
}

function checkWin(player) {
    return checkLine(player, 0, 1) ||
        checkLine(player, 1, 0) ||
        checkLine(player, 1, 1) ||
        checkLine(player, 1, -1);
}

function checkLine(player, deltaRow, deltaCol) {
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < columns; col++) {
            if (lineOfFour(player, row, col, deltaRow, deltaCol)) {
                return true;
            }
        }
    }
    return false;
}

function lineOfFour(player, startRow, startCol, deltaRow, deltaCol) {
    var count = 0;
    for (var i = 0; i < 4; i++) {
        var row = startRow + i * deltaRow;
        var col = startCol + i * deltaCol;
        if (row < 0 || row >= rows || col < 0 || col >= columns) break;
        var cell = board.children[row * columns + col];
        if (cell.hasChildNodes() && cell.firstChild.classList.contains(player)) {
            count++;
        } else {
            break;
        }
    }
    return count == 4;
}

function showVictoryPopup(player) {
    var victoryPopup = document.getElementById('victoryPopup');
    var victoryMessage = document.getElementById('victoryMessage');
    var victoryPiece = document.getElementById('victoryPiece');
    victoryMessage.innerText = playerNames[player] + ' 胜利!';
    victoryPiece.className = 'card-piece ' + player;
    victoryPieceL.className = 'card-piece l ' + player;
    victoryPieceR.className = 'card-piece r ' + player;
    victoryPopup.style.display = 'block';
    // 控制台输出胜利信息
    console.log(playerNames[player] + ' 胜利!');
}

function closeVictoryPopup() {
    document.getElementById('victoryPopup').style.display = 'none';
}

function resetGame() {
    var cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.hasChildNodes()) {
            cell.removeChild(cell.firstChild);
        }
    });
    currentPlayer = 'userA';
    gameEnded = false;
    isDropping = false;
    closeVictoryPopup();
    // 清空控制台
    console.clear();
}
function printBoard() {
    var boardState = [];
    for (var row = 0; row < rows; row++) {
        var rowState = [];
        for (var col = 0; col < columns; col++) {
            var cellIndex = row * columns + col;
            var cell = board.children[cellIndex];
            if (cell.hasChildNodes()) {
                if (cell.firstChild.classList.contains('userA')) {
                    rowState.push('A');
                } else if (cell.firstChild.classList.contains('userB')) {
                    rowState.push('B');
                }
            } else {
                rowState.push('O');
            }
        }
        boardState.push('|' + rowState.join('|') + '|');
    }
    console.log(boardState.join('\n'));
}
// 给棋盘单元格分配binggo-id
function assignBingoId(board) {
    var cells = board.getElementsByClassName('cell');
    var columns = ['A', 'B', 'C', 'D', 'E', 'F', 'G']; // 列号从A到G
    for (var i = 0; i < cells.length; i++) {
        var col = columns[i % 7]; // 使用字母表示列号
        var row = Math.floor(i / 7) + 1; // 行号从1开始
        cells[i].setAttribute('columns', col);
        cells[i].setAttribute('rows', row);
    }
}

createBoard();