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

// 检查棋局状态，并尝试找到最佳移动
function findBestMove(board, columns, rows, player) {
    // 先尝试找到立即获胜的落子
    var move = winningMove(board, columns, rows, player);
    if (move) return move;

    // 尝试进行防守
    move = defensiveMove(board, columns, rows, player === 'userA' ? 'userB' : 'userA');
    if (move) return move;

    // 尝试进行进攻
    move = offensiveMove(board, columns, rows, player);
    if (move) return move;

    // 使用预测未来几步的策略选择移动
    let bestFutureScore = predictFutureMoves(board, columns, rows, player, 3, -Infinity, Infinity);
    return scoreBasedMove(board, columns, rows, player); // 或者根据最佳未来得分选择移动
}


// 寻找立即获胜的落子
function winningMove(board, columns, rows, player) {
    return simulateMove(board, columns, rows, player, true);
}

// 根据评分选择移动
function scoreBasedMove(board, columns, rows, player) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            let cellIndex = row * columns + col;
            if (cellIndex < board.children.length) {
                let cell = board.children[cellIndex];
                if (!cell.hasChildNodes()) {
                    cell.appendChild(createMockPiece(player));
                    let score = evaluateBoard(board, player); // 评估棋盘
                    cell.removeChild(cell.firstChild);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = cell;
                    }
                }
            }
        }
    }

    return bestMove;
}

// 评估棋盘，返回一个分数
function evaluateBoard(board, player) {
    let score = 0;

    // 示例: 评估每一列、行、对角线的得分
    score += evaluateLines(board, player);

    // 可以添加更多的评估逻辑，例如考虑棋盘上特定位置的重要性
    // ...

    return score;
}

// 评估棋盘上的行、列和对角线
function evaluateLines(board, player) {
    let lineScore = 0;

    // 对于每一行、列、对角线进行评分
    // 例如，根据连续棋子的数量和位置给予分数
    // ...

    return lineScore;
}

// 评估棋盘的防守位置
function evaluateDefensivePosition(board, columns, rows, opponent) {
    let score = 0;

    // 遍历棋盘，评估防守价值
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            let cellIndex = row * columns + col;
            let cell = board.children[cellIndex];
            if (!cell.hasChildNodes()) {
                // 模拟对手的棋子落在这个位置
                cell.appendChild(createMockPiece(opponent));
                // 检查是否阻断了对手的连续四个棋子
                if (checkPotentialWin(board, opponent, columns, rows, cellIndex)) {
                    score += 10; // 阻断对手连线的评分
                }
                cell.removeChild(cell.firstChild);
            }
        }
    }

    return score;
}


// 评估棋盘的进攻位置
function evaluateOffensivePosition(board, columns, rows, player) {
    let score = 0;

    // 遍历棋盘，评估进攻价值
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            let cellIndex = row * columns + col;
            let cell = board.children[cellIndex];
            if (!cell.hasChildNodes()) {
                // 模拟玩家的棋子落在这个位置
                cell.appendChild(createMockPiece(player));
                // 检查是否形成了连续四个棋子
                if (checkPotentialWin(board, player, columns, rows, cellIndex)) {
                    score += 10; // 形成连线的评分
                }
                cell.removeChild(cell.firstChild);
            }
        }
    }

    return score;
}
function checkPotentialWin(board, player, columns, rows, cellIndex) {
    // 获取落子的行列位置
    let col = cellIndex % columns;
    let row = Math.floor(cellIndex / columns);

    // 检查每个方向上的所有可能连续四个棋子
    if (checkLine(board, player, col, row, 1, 0, columns, rows)) return true;  // 水平
    if (checkLine(board, player, col, row, 0, 1, columns, rows)) return true;  // 垂直
    if (checkLine(board, player, col, row, 1, 1, columns, rows)) return true;  // 对角线（左上到右下）
    if (checkLine(board, player, col, row, -1, 1, columns, rows)) return true;  // 对角线（右上到左下）

    return false;
}


// 更新后的 checkLine 函数
function checkLine(board, player, startCol, startRow, deltaCol, deltaRow, columns, rows) {
    for (let offset = -3; offset <= 0; offset++) {
        let consecutiveCount = 0;
        for (let i = offset; i < offset + 4; i++) {
            let currentCol = startCol + i * deltaCol;
            let currentRow = startRow + i * deltaRow;

            // 确保 currentCol 和 currentRow 在棋盘范围内
            if (currentCol < 0 || currentCol >= columns || currentRow < 0 || currentRow >= rows) {
                break; // 越界检查
            }

            let cellIndex = currentRow * columns + currentCol;
            let cell = board.children[cellIndex];
            if (cell && cell.hasChildNodes() && cell.firstChild.classList.contains(player)) {
                consecutiveCount++;
            } else {
                break; // 不连续时中断当前方向的检查
            }
        }
        if (consecutiveCount === 4) {
            return true; // 找到连续四个相同的棋子
        }
    }
    return false;
}







// 防守性移动，阻止对手获胜
function defensiveMove(board, columns, rows, opponent) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            let cellIndex = row * columns + col;
            if (cellIndex < board.children.length) {
                let cell = board.children[cellIndex];
                if (!cell.hasChildNodes()) {
                    cell.appendChild(createMockPiece(opponent)); // 模拟对手的棋子
                    let score = evaluateDefensivePosition(board, opponent);
                    cell.removeChild(cell.firstChild);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = cell;
                    }
                }
            }
        }
    }

    return bestMove;
}

// 进攻性移动，寻找获胜机会
function offensiveMove(board, columns, rows, player) {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows; row++) {
            let cellIndex = row * columns + col;
            if (cellIndex < board.children.length) {
                let cell = board.children[cellIndex];
                if (!cell.hasChildNodes()) {
                    cell.appendChild(createMockPiece(player));
                    let score = evaluateOffensivePosition(board, player);
                    cell.removeChild(cell.firstChild);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = cell;
                    }
                }
            }
        }
    }

    return bestMove;
}

// 评估棋盘的防守位置
function evaluateDefensivePosition(board, opponent) {
    let score = 0;

    // 根据游戏规则增加防守评分逻辑
    // 例如，如果一个空格可以阻止对手连成三子或四子，给予较高分数
    // 具体实现取决于游戏的规则和逻辑
    // ...

    return score;
}

// 评估棋盘的进攻位置
function evaluateOffensivePosition(board, player) {
    let score = 0;

    // 根据游戏规则增加进攻评分逻辑
    // 例如，如果一个空格可以帮助玩家连成三子或四子，给予较高分数
    // 具体实现取决于游戏的规则和逻辑
    // ...

    return score;
}
// 更复杂的未来几步预测
function predictFutureMoves(board, columns, rows, player, depth, alpha, beta) {
    if (depth === 0) {
        return evaluateBoard(board, player);
    }

    if (player === 'userA') {
        let maxScore = -Infinity;
        // 遍历所有可能的移动
        for (let col = 0; col < columns; col++) {
            for (let row = 0; row < rows; row++) {
                let cellIndex = row * columns + col;
                let cell = board.children[cellIndex];
                if (!cell.hasChildNodes()) {
                    cell.appendChild(createMockPiece(player));
                    let score = predictFutureMoves(board, columns, rows, 'userB', depth - 1, alpha, beta);
                    cell.removeChild(cell.firstChild);
                    maxScore = Math.max(maxScore, score);
                    alpha = Math.max(alpha, score);
                    if (beta <= alpha) {
                        break; // Beta剪枝
                    }
                }
            }
        }
        return maxScore;
    } else {
        let minScore = Infinity;
        // 遍历所有可能的移动
        for (let col = 0; col < columns; col++) {
            for (let row = 0; row < rows; row++) {
                let cellIndex = row * columns + col;
                let cell = board.children[cellIndex];
                if (!cell.hasChildNodes()) {
                    cell.appendChild(createMockPiece(player));
                    let score = predictFutureMoves(board, columns, rows, 'userA', depth - 1, alpha, beta);
                    cell.removeChild(cell.firstChild);
                    minScore = Math.min(minScore, score);
                    beta = Math.min(beta, score);
                    if (beta <= alpha) {
                        break; // Alpha剪枝
                    }
                }
            }
        }
        return minScore;
    }
}



// 模拟落子，区分寻找获胜落子和评估普通落子
function simulateMove(board, columns, rows, player, isWinningMove) {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            let cellIndex = row * columns + col;
            if (cellIndex < board.children.length) {
                let cell = board.children[cellIndex];
                if (!cell.hasChildNodes()) {
                    cell.appendChild(createMockPiece(player));
                    let win = checkWin(player); // 检查是否获胜
                    if (isWinningMove && win) {
                        cell.removeChild(cell.firstChild);
                        return cell;
                    }
                    if (!isWinningMove) {
                        let score = evaluateMove(board, player, cell);
                        cell.removeChild(cell.firstChild);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = cell;
                        }
                    }
                    cell.removeChild(cell.firstChild);
                }
            }
        }
    }
    return isWinningMove ? null : bestMove;
}

// 评估单个落子的影响
function evaluateMove(board, player, cell) {
    // 根据游戏规则增加落子评分逻辑
    let score = 0;
    // 评分逻辑...
    return score;
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
        console.log("红方落子: ", event.target.getAttribute('binggo-id'));
        setTimeout(function () {
            if (currentPlayer === 'userB') {
                var bestMove = findBestMove(board, columns, rows, 'userB');
                if (bestMove) {
                    bestMove.click();
                    console.log("蓝方落子: ", bestMove.getAttribute('binggo-id'));
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

// 给棋盘单元格分配binggo-id
function assignBingoId(board) {
    var cells = board.getElementsByClassName('cell');
    for (var i = 0; i < cells.length; i++) {
        var col = (i % 7) + 1; // 列号从1开始
        cells[i].setAttribute('binggo-id', col + '列');
    }
}