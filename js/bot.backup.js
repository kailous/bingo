// 监视开关按钮的状态，控制 AI 对手的开启和关闭
document.getElementById('togBtn').addEventListener('change', function () {
    if (this.checked) {
        if (typeof enableAI === "function") {
            enableAI();
        }

    } else {
        if (typeof disableAI === "function") {
            disableAI(); // 调用关闭 AI 对手的函数
        }
    }
});

// 移动棋子
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

// 检查棋局状态
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

// 检查是否获胜
function defensiveMove(board, columns, rows, opponent) {
    // 模拟每个单元格，检查对方是否将在下一步获胜
    return simulateMove(board, columns, rows, opponent);
}

// 检查是否获胜
function offensiveMove(board, columns, rows, player) {
    // 模拟每个单元格，检查自己是否能在下一步获胜
    return simulateMove(board, columns, rows, player);
}

// 模拟落子
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

// 检查是否获胜
function createMockPiece(player) {
    var mockPiece = document.createElement('div');
    mockPiece.classList.add('piece', player);
    return mockPiece;
}

// 将点击事件处理封装成独立的函数
function handleClick(event) {
    if (currentPlayer === 'userA' && event.target.classList.contains('cell') && !gameEnded) {
        setTimeout(function () {
            if (currentPlayer === 'userB') {
                var bestMove = findBestMove(board, columns, rows, 'userB');
                if (bestMove) {
                    bestMove.click();
                }
            }
        }, 1000);
    }
}

// 将 AI 对手的开启和关闭封装成独立的函数
function enableAI() {
    console.log('AI 对手开启');
    var board = document.getElementById('gameBoard');
    assignBingoId(board); // 给棋盘单元格分配binggo-id
    // 添加点击事件监听器，调用上面的处理函数
    board.addEventListener('click', handleClick);
}

// 将 AI 对手的开启和关闭封装成独立的函数
function disableAI() {
    console.log('AI 对手关闭');
    var board = document.getElementById('gameBoard');
    // 移除点击事件监听器
    board.removeEventListener('click', handleClick);
}
