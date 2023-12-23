var minimaxDepth = 2; // 默认深度

document.addEventListener('DOMContentLoaded', function() {
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('bot')) {
        minimaxDepth = parseInt(urlParams.get('bot'), 10) || minimaxDepth;
    }
    enableAI();
});

function enableAI() {
    var board = document.getElementById('gameBoard');
    document.getElementById('gameBoard').addEventListener('click', function(event) {
        if (currentPlayer === 'userA' && event.target.classList.contains('cell') && !gameEnded) {
            setTimeout(function() {
                if (currentPlayer === 'userB') {
                    var bestMove = findBestMove(board, columns, rows, 'userB');
                    if (bestMove) {
                        bestMove.click();
                    }
                }
            }, 1000);
        }
    });
}

function findBestMove(board, columns, rows, player) {
    var bestScore = -Infinity;
    var bestMove = null;

    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < columns; col++) {
            var cellIndex = row * columns + col;
            var cell = board.children[cellIndex];
            if (!cell.hasChildNodes()) {
                cell.appendChild(createMockPiece(player));
                var score = minimax(board, columns, rows, minimaxDepth, false, player, player === 'userA' ? 'userB' : 'userA');
                cell.removeChild(cell.firstChild);
                console.log(`Cell [${row}, ${col}] Score: ${score}`); // 调试输出
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = cell;
                }
            }
        }
    }
    return bestMove;
}




function minimax(board, columns, rows, depth, alpha, beta, isMaximizing, player, opponent) {
    if (depth === 0 || checkWin(player) || checkWin(opponent)) {
        return evaluateBoard(board, player, opponent);
    }

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                if (isEmptyCell(board, row, col)) {
                    makeMove(board, row, col, player);
                    let eval = minimax(board, columns, rows, depth - 1, alpha, beta, false, player, opponent);
                    undoMove(board, row, col);
                    maxEval = Math.max(maxEval, eval);
                    alpha = Math.max(alpha, eval);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                if (isEmptyCell(board, row, col)) {
                    makeMove(board, row, col, opponent);
                    let eval = minimax(board, columns, rows, depth - 1, alpha, beta, true, player, opponent);
                    undoMove(board, row, col);
                    minEval = Math.min(minEval, eval);
                    beta = Math.min(beta, eval);
                    if (beta <= alpha) {
                        break;
                    }
                }
            }
        }
        return minEval;
    }
}

function isEmptyCell(board, row, col, columns) {
    var cellIndex = row * columns + col;
    return !board.children[cellIndex].hasChildNodes();
}


function makeMove(board, row, col, player, columns) {
    var cellIndex = row * columns + col;
    var cell = board.children[cellIndex];
    var piece = createMockPiece(player);  // 假设 createMockPiece 已经定义
    cell.appendChild(piece);
}


function undoMove(board, row, col, columns) {
    var cellIndex = row * columns + col;
    var cell = board.children[cellIndex];
    if (cell.hasChildNodes()) {
        cell.removeChild(cell.lastChild);
    }
}



function evaluateBoard(board, player, opponent) {
    var score = 0;

    // 增加对棋盘上连续棋子的检查和评分
    score += evaluateConsecutivePieces(board, player, columns, rows);
    score -= evaluateConsecutivePieces(board, opponent, columns, rows);

    // 考虑棋盘中心控制的评分
    score += evaluateCenterControl(board, player, columns, rows);
    score -= evaluateCenterControl(board, opponent, columns, rows);

    // 根据棋盘上棋子的总数给予评分
    score += countPieces(board, player);
    score -= countPieces(board, opponent);

    return score;
}

function countPieces(board, player) {
    var count = 0;
    for (let i = 0; i < board.children.length; i++) {
        if (board.children[i].classList.contains(player)) {
            count++;
        }
    }
    return count;
}


function evaluateCenterControl(board, player, columns, rows) {
    var centerScore = 0;
    var centerColumn = Math.floor(columns / 2);
    for (let row = 0; row < rows; row++) {
        if (board.children[row * columns + centerColumn].classList.contains(player)) {
            centerScore += 2; // 控制中心区域的加分
        }
    }
    return centerScore;
}


function evaluateConsecutivePieces(board, player, columns, rows) {
    var consecutiveScore = 0;

    // 检查棋盘上连续的棋子
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            consecutiveScore += checkConsecutiveLine(board, player, row, col, 1, 0, columns, rows); // 水平方向
            consecutiveScore += checkConsecutiveLine(board, player, row, col, 0, 1, columns, rows); // 垂直方向
            consecutiveScore += checkConsecutiveLine(board, player, row, col, 1, 1, columns, rows); // 对角线方向
        }
    }

    return consecutiveScore;
}

function checkConsecutiveLine(board, player, row, col, deltaRow, deltaCol, columns, rows) {
    let count = 0;
    let lineScore = 0;

    for (let i = 0; i < 3; i++) {
        let currentRow = row + i * deltaRow;
        let currentCol = col + i * deltaCol;

        // 确保不越界
        if (currentRow < rows && currentCol < columns) {
            if (board.children[currentRow * columns + currentCol].classList.contains(player)) {
                count++;
            }
        }
    }

    // 根据连续棋子数量给予评分
    if (count === 2) {
        lineScore = 1; // 两个连续的棋子
    } else if (count === 3) {
        lineScore = 3; // 三个连续的棋子
    }

    return lineScore;
}







function evaluateCell(board, index, player) {
    // 这里添加根据单个单元格对游戏影响的评估逻辑
    // 例如，可以根据单元格位置的重要性（如中心或边缘）给予不同的分数
    // 或者根据周围的相同棋子数量给予分数

    // 下面是一个简单的示例，您需要根据您的游戏规则进行修改
    var score = 1; // 基础分数

    // 可以添加更复杂的评估逻辑
    // ...

    return score;
}


function createMockPiece(player) {
    var mockPiece = document.createElement('div');
    mockPiece.classList.add('piece', player);
    return mockPiece;
}
