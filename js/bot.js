// 监视开关按钮的状态，控制 AI 对手的开启和关闭
document.getElementById('togBtn').addEventListener('change', function () {
    if (this.checked) {
        enableAI();
    } else {
        disableAI();
    }
});

// 启用 AI 对手
function enableAI() {
    console.log('AI 对手开启');
    var boardElement = document.getElementById('gameBoard');
    boardElement.addEventListener('click', handleClick);
    initializeBoardMatrix(); // 初始化棋盘矩阵
}

// 关闭 AI 对手
function disableAI() {
    console.log('AI 对手关闭');
    var boardElement = document.getElementById('gameBoard');
    boardElement.removeEventListener('click', handleClick);
}

// 棋盘参数
const rows = 6;
const columns = 7;
let boardMatrix = []; // 用于存储棋盘状态的二维数组
let currentPlayer = 'userA';
let gameEnded = false;

// 初始化棋盘矩阵
function initializeBoardMatrix() {
    boardMatrix = Array(rows).fill(null).map(() => Array(columns).fill(null));
}

// 将点击事件处理封装成独立的函数
function handleClick(event) {
    if (currentPlayer === 'userA' && !gameEnded) {
        let col = parseInt(event.target.getAttribute('data-col'));
        if (dropPiece(col, 'userA')) {
            if (checkWin(boardMatrix, 'userA')) {
                gameEnded = true;
                alert('玩家A胜利！');
                return;
            }
            currentPlayer = 'userB';
            makeAIDecision();
        }
    }
}

// 用户或AI落子
function dropPiece(col, player) {
    for (let row = rows - 1; row >= 0; row--) {
        if (boardMatrix[row][col] === null) {
            boardMatrix[row][col] = player;
            updateUI(row, col, player);
            return true;
        }
    }
    return false; // 列已满
}

// 更新UI
function updateUI(row, col, player) {
    let boardElement = document.getElementById('gameBoard');
    let cell = boardElement.children[row * columns + col];
    let piece = document.createElement('div');
    piece.classList.add('piece', player);
    cell.appendChild(piece);
}

// AI 决策逻辑
function makeAIDecision() {
    let bestMove = findBestMove();
    if (bestMove !== null) {
        dropPiece(bestMove, 'userB');
        if (checkWin(boardMatrix, 'userB')) {
            gameEnded = true;
            alert('AI胜利！');
            return;
        }
        currentPlayer = 'userA';
    } else {
        gameEnded = true;
        alert('平局！');
    }
}

// 寻找最佳移动
function findBestMove() {
    let bestScore = -Infinity;
    let bestCol = null;
    let depth = 6; // 增加搜索深度
    for (let col = 0; col < columns; col++) {
        let row = getAvailableRow(col);
        if (row !== null) {
            boardMatrix[row][col] = 'userB';
            let score = minimax(boardMatrix, depth - 1, -Infinity, Infinity, false);
            boardMatrix[row][col] = null;
            if (score > bestScore) {
                bestScore = score;
                bestCol = col;
            }
        }
    }
    return bestCol;
}

// 获取可用的行
function getAvailableRow(col) {
    for (let row = rows - 1; row >= 0; row--) {
        if (boardMatrix[row][col] === null) {
            return row;
        }
    }
    return null;
}

// 迷你极大值算法 with α-β 剪枝
function minimax(board, depth, alpha, beta, isMaximizing) {
    if (checkWin(board, 'userB')) return 1000000;
    if (checkWin(board, 'userA')) return -1000000;
    if (isBoardFull(board) || depth === 0) return evaluateBoard(board);

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (let col = 0; col < columns; col++) {
            let row = getAvailableRow(col);
            if (row !== null) {
                board[row][col] = 'userB';
                let eval = minimax(board, depth - 1, alpha, beta, false);
                board[row][col] = null;
                maxEval = Math.max(maxEval, eval);
                alpha = Math.max(alpha, eval);
                if (beta <= alpha) break;
            }
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let col = 0; col < columns; col++) {
            let row = getAvailableRow(col);
            if (row !== null) {
                board[row][col] = 'userA';
                let eval = minimax(board, depth - 1, alpha, beta, true);
                board[row][col] = null;
                minEval = Math.min(minEval, eval);
                beta = Math.min(beta, eval);
                if (beta <= alpha) break;
            }
        }
        return minEval;
    }
}

// 检查棋盘是否已满
function isBoardFull(board) {
    for (let col = 0; col < columns; col++) {
        if (board[0][col] === null) return false;
    }
    return true;
}

// 评估棋盘
function evaluateBoard(board) {
    let score = 0;

    // 水平
    for (let row = 0; row < rows; row++) {
        let rowArray = board[row];
        for (let col = 0; col < columns - 3; col++) {
            let window = rowArray.slice(col, col + 4);
            score += evaluateWindow(window, 'userB');
        }
    }

    // 垂直
    for (let col = 0; col < columns; col++) {
        let colArray = [];
        for (let row = 0; row < rows; row++) {
            colArray.push(board[row][col]);
        }
        for (let row = 0; row < rows - 3; row++) {
            let window = colArray.slice(row, row + 4);
            score += evaluateWindow(window, 'userB');
        }
    }

    // 正对角线
    for (let row = 0; row < rows - 3; row++) {
        for (let col = 0; col < columns - 3; col++) {
            let window = [
                board[row][col],
                board[row + 1][col + 1],
                board[row + 2][col + 2],
                board[row + 3][col + 3],
            ];
            score += evaluateWindow(window, 'userB');
        }
    }

    // 反对角线
    for (let row = 0; row < rows - 3; row++) {
        for (let col = 3; col < columns; col++) {
            let window = [
                board[row][col],
                board[row + 1][col - 1],
                board[row + 2][col - 2],
                board[row + 3][col - 3],
            ];
            score += evaluateWindow(window, 'userB');
        }
    }

    return score;
}

// 评估窗口
function evaluateWindow(window, player) {
    let score = 0;
    let opponent = player === 'userB' ? 'userA' : 'userB';
    let playerCount = window.filter(cell => cell === player).length;
    let emptyCount = window.filter(cell => cell === null).length;
    let opponentCount = window.filter(cell => cell === opponent).length;

    if (playerCount === 4) {
        score += 100;
    } else if (playerCount === 3 && emptyCount === 1) {
        score += 10;
    } else if (playerCount === 2 && emptyCount === 2) {
        score += 5;
    }

    if (opponentCount === 3 && emptyCount === 1) {
        score -= 80;
    }

    return score;
}

// 检查胜利
function checkWin(board, player) {
    // 水平
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns - 3; col++) {
            if (
                board[row][col] === player &&
                board[row][col + 1] === player &&
                board[row][col + 2] === player &&
                board[row][col + 3] === player
            ) {
                return true;
            }
        }
    }

    // 垂直
    for (let col = 0; col < columns; col++) {
        for (let row = 0; row < rows - 3; row++) {
            if (
                board[row][col] === player &&
                board[row + 1][col] === player &&
                board[row + 2][col] === player &&
                board[row + 3][col] === player
            ) {
                return true;
            }
        }
    }

    // 正对角线
    for (let row = 0; row < rows - 3; row++) {
        for (let col = 0; col < columns - 3; col++) {
            if (
                board[row][col] === player &&
                board[row + 1][col + 1] === player &&
                board[row + 2][col + 2] === player &&
                board[row + 3][col + 3] === player
            ) {
                return true;
            }
        }
    }

    // 反对角线
    for (let row = 0; row < rows - 3; row++) {
        for (let col = 3; col < columns; col++) {
            if (
                board[row][col] === player &&
                board[row + 1][col - 1] === player &&
                board[row + 2][col - 2] === player &&
                board[row + 3][col - 3] === player
            ) {
                return true;
            }
        }
    }

    return false;
}