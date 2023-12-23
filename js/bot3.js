document.addEventListener('DOMContentLoaded', function() {
    var urlParams = new URLSearchParams(window.location.search);
    var botEnabled = urlParams.has('bot') && urlParams.get('bot') === 'ai';

    if (botEnabled) {
        enableAI();
    }
});

function enableAI() {
    console.log("AI 对手已启动");
    var board = document.getElementById('gameBoard');
    assignBingoId(board); // 给棋盘单元格分配binggo-id


function randomMove(board, columns) {
    var validColumns = [];
    for (var i = 0; i < columns; i++) {
        var cell = board.children[i];
        if (!cell.hasChildNodes()) {
            validColumns.push(cell);
        }
    }

    if (validColumns.length > 0) {
        var randomColIndex = Math.floor(Math.random() * validColumns.length);
        return validColumns[randomColIndex];
    }
    return null;
}

function findBestMove(board, columns, rows, player) {
    // 防守：检查是否需要阻止对方获胜
    var move = defensiveMove(board, columns, rows, player === 'userA' ? 'userB' : 'userA');
    if (move) return move;

    // 进攻：尝试找到自己的获胜机会
    move = offensiveMove(board, columns, rows, player);
    if (move) return move;

    // 如果既不能进攻也不能防守，则随机落子
    return randomMove(board, columns);
}

function defensiveMove(board, columns, rows, opponent) {
    // 模拟每个单元格，检查对方是否将在下一步获胜
    return simulateMove(board, columns, rows, opponent);
}

function offensiveMove(board, columns, rows, player) {
    // 模拟每个单元格，检查自己是否能在下一步获胜
    return simulateMove(board, columns, rows, player);
}

function simulateMove(board, columns, rows, player) {
    if (!board || !board.children) {
        console.error('Board or board children are undefined');
        return null;
    }
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < columns; col++) {
            var cellIndex = row * columns + col;
            if (cellIndex < board.children.length) {
                var cell = board.children[cellIndex];
                if (!cell.hasChildNodes()) {
                    cell.appendChild(createMockPiece(player));
                    if (checkWin(player)) {
                        cell.removeChild(cell.firstChild);
                        return cell;
                    }
                    cell.removeChild(cell.firstChild);
                }
            }
        }
    }
    return null;
}

function createMockPiece(player) {
    var mockPiece = document.createElement('div');
    mockPiece.classList.add('piece', player);
    return mockPiece;
}

document.getElementById('gameBoard').addEventListener('click', function(event) {
    if (currentPlayer === 'userA' && event.target.classList.contains('cell') && !gameEnded) {
        console.log("红方落子: ", event.target.getAttribute('binggo-id'));
        setTimeout(function() {
            if (currentPlayer === 'userB') {
                var bestMove = findBestMove(board, columns, rows, 'userB');
                if (bestMove) {
                    bestMove.click();
                    console.log("蓝方落子: ", bestMove.getAttribute('binggo-id'));
                }
            }
        }, 1000);
    }
});
}

function assignBingoId(board) {
    var cells = board.getElementsByClassName('cell');
    for (var i = 0; i < cells.length; i++) {
        var col = (i % 7) + 1; // 列号从1开始
        cells[i].setAttribute('binggo-id', col + '列');
    }
}