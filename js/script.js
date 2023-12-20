var board = document.getElementById('gameBoard');
var currentPlayer = 'userA';
var columns = 7;
var rows = 6;
var gameEnded = false; // 游戏状态标志
// 玩家名称
var playerNames = {
    'userA': '红方',
    'userB': '蓝方'
};
// 创建棋盘
function createBoard() {
    for (var i = 0; i < columns * rows; i++) {
        var cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', dropPiece);
        board.appendChild(cell);
    }
}

// 下棋
function dropPiece() {
    if (gameEnded) {
        return; // 如果游戏已结束，不执行任何操作
    }

    var columnCells = getColumnCells(getColumnIndex(this));
    for (var i = columnCells.length - 1; i >= 0; i--) {
        if (!columnCells[i].hasChildNodes()) {
            var piece = document.createElement('div');
            piece.classList.add('piece', currentPlayer, 'animate-drop');
            
            // 添加Iconpark Star图标
            var icon = document.createElement('iconpark-icon');
            icon.setAttribute('name', 'Star');
            piece.appendChild(icon);

            columnCells[i].appendChild(piece);

            piece.addEventListener('animationend', () => {
                if (checkWin(currentPlayer)) {
                    showVictoryPopup(currentPlayer);
                    gameEnded = true; // 设置游戏结束标志
                    return;
                }
                currentPlayer = currentPlayer === 'userA' ? 'userB' : 'userA';
            }, { once: true });

            break;
        }
    }
}

function getColumnIndex(cell) {
    return Array.prototype.indexOf.call(board.children, cell) % columns;
}

// 获取列
function getColumnCells(index) {
    var columnCells = [];
    for (var i = index; i < board.children.length; i += columns) {
        columnCells.push(board.children[i]);
    }
    return columnCells;
}

// 检查是否胜利
function checkWin(player) {
    return checkLine(player, 0, 1) ||
           checkLine(player, 1, 0) ||
           checkLine(player, 1, 1) ||
           checkLine(player, 1, -1);
}

// 检查行
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

// 检查四个方向
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
// 显示胜利弹窗
function showVictoryPopup(player) {
    var victoryPopup = document.getElementById('victoryPopup');
    var victoryMessage = document.getElementById('victoryMessage');
    var playerName = playerNames[player] || player; // 使用映射的名称或默认到类名
    victoryPiece.className = 'card-piece ' + player;
    victoryPieceL.className = 'card-piece l ' + player;
    victoryPieceR.className = 'card-piece r ' + player;
    victoryMessage.innerText = playerName + ' 胜利!';
    victoryPopup.style.display = 'block';
}

// 关闭胜利弹窗
function closeVictoryPopup() {
    document.getElementById('victoryPopup').style.display = 'none';
}

// 重置游戏
function resetGame() {
    var cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        if (cell.hasChildNodes()) {
            cell.removeChild(cell.firstChild);
        }
    });
    currentPlayer = 'userA';
    gameEnded = false; // 重置游戏结束标志
    closeVictoryPopup();
}

// 开始游戏
createBoard();
