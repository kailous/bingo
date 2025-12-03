
const BOT_VERSION = '1.2.0';

console.log(`AI 对手脚本加载，版本 ${BOT_VERSION}`);

// 监视开关按钮的状态，控制 AI 对手的开启和关闭
document.getElementById('togBtn').addEventListener('change', function () {
    if (this.checked) {
        enableAI();
    } else {
        disableAI();
    }
});

const AI_PLAYER = 'userB';
const HUMAN_PLAYER = 'userA';

// 启用 AI 对手
function enableAI() {
    console.log(`AI 对手开启，版本 ${BOT_VERSION}`);
    var board = document.getElementById('gameBoard');
    board.addEventListener('click', handleClick);
}

// 关闭 AI 对手
function disableAI() {
    console.log(`AI 对手关闭，版本 ${BOT_VERSION}`);
    var board = document.getElementById('gameBoard');
    board.removeEventListener('click', handleClick);
}

// AI 决策逻辑
function makeAIDecision() {
    const bestMove = findBestMove();
    if (bestMove && !gameEnded) {
        bestMove.click();
    }
}

// 寻找最佳移动
function findBestMove() {
    // 1. 优先寻找直接获胜的落子
    const winningMove = findOffensiveMove();
    if (winningMove) return winningMove;

    // 2. 其次阻挡对手的必胜点
    const blockingMove = findDefensiveMove();
    if (blockingMove) return blockingMove;

    // 3. 使用极小化极大搜索寻找更安全的落子
    const candidateMoves = collectValidMoves();
    if (candidateMoves.length === 0) return null;

    let bestScore = -Infinity;
    let bestMoves = [];

    candidateMoves.forEach((cell) => {
        const score = simulateMove(cell, AI_PLAYER, () => minimax(2, false, -Infinity, Infinity)).score;
        if (score > bestScore) {
            bestScore = score;
            bestMoves = [cell];
        } else if (score === bestScore) {
            bestMoves.push(cell);
        }
    });

    // 4. 在最佳分数里随机挑选，避免单一路径
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function simulateMove(cell, player, callback) {
    const mockPiece = createMockPiece(player);
    cell.appendChild(mockPiece);
    const result = callback();
    cell.removeChild(mockPiece);
    return result;
}

function evaluateBoardState() {
    const directions = [
        { dr: 0, dc: 1 },   // 水平
        { dr: 1, dc: 0 },   // 垂直
        { dr: 1, dc: 1 },   // 对角线 ↘
        { dr: 1, dc: -1 }   // 对角线 ↙
    ];

    let aiScore = 0;
    let humanScore = 0;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            directions.forEach(({ dr, dc }) => {
                if (isSequenceInsideBoard(row, col, dr, dc)) {
                    const { aiCount, humanCount } = evaluateSequence(row, col, dr, dc);
                    if (aiCount > 0 && humanCount === 0) {
                        aiScore += Math.pow(10, aiCount);
                    } else if (humanCount > 0 && aiCount === 0) {
                        humanScore += Math.pow(10, humanCount);
                    }
                }
            });
        }
    }

    return aiScore - humanScore;
}

function isSequenceInsideBoard(startRow, startCol, dr, dc) {
    const endRow = startRow + 3 * dr;
    const endCol = startCol + 3 * dc;
    return endRow >= 0 && endRow < rows && endCol >= 0 && endCol < columns;
}

function evaluateSequence(startRow, startCol, dr, dc) {
    let aiCount = 0;
    let humanCount = 0;

    for (let i = 0; i < 4; i++) {
        const row = startRow + i * dr;
        const col = startCol + i * dc;
        const cell = board.children[row * columns + col];
        if (cell.hasChildNodes()) {
            if (cell.firstChild.classList.contains(AI_PLAYER)) {
                aiCount++;
            } else if (cell.firstChild.classList.contains(HUMAN_PLAYER)) {
                humanCount++;
            }
        }
    }

    return { aiCount, humanCount };
}

function boardIsFull() {
    return Array.from(board.children).every((cell) => cell.hasChildNodes());
}

function minimax(depth, maximizingPlayer, alpha, beta) {
    if (checkWin(AI_PLAYER)) {
        return { score: 10000 + depth };
    }
    if (checkWin(HUMAN_PLAYER)) {
        return { score: -10000 - depth };
    }
    if (depth === 0 || boardIsFull()) {
        return { score: evaluateBoardState() };
    }

    const validMoves = collectValidMoves();
    if (validMoves.length === 0) {
        return { score: 0 };
    }

    if (maximizingPlayer) {
        let maxEval = -Infinity;
        for (const cell of validMoves) {
            const evaluation = simulateMove(cell, AI_PLAYER, () => minimax(depth - 1, false, alpha, beta)).score;
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) {
                break; // 剪枝
            }
        }
        return { score: maxEval };
    } else {
        let minEval = Infinity;
        for (const cell of validMoves) {
            const evaluation = simulateMove(cell, HUMAN_PLAYER, () => minimax(depth - 1, true, alpha, beta)).score;
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) {
                break; // 剪枝
            }
        }
        return { score: minEval };
    }
}

function collectValidMoves() {
    const validMoves = [];

    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                validMoves.push(columnCells[row]);
                break; // 只考虑当前列最底部的空位
            }
        }
    }

    return validMoves;
}
// 创建模拟棋子
function createMockPiece(player) {
    var mockPiece = document.createElement('div');
    mockPiece.classList.add('piece', player);
    return mockPiece;
}

// 将点击事件处理封装成独立的函数
function handleClick(event) {
    if (currentPlayer === HUMAN_PLAYER && !gameEnded) {
        setTimeout(function () {
            if (currentPlayer === AI_PLAYER) {
                makeAIDecision();
            }
        }, 1000);
    }
}
// 防御性移动逻辑
function findDefensiveMove() {
    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                // 模拟放置对手棋子
                let mockPiece = createMockPiece(HUMAN_PLAYER);
                columnCells[row].appendChild(mockPiece);

                // 检查对手是否能赢
                if (checkWin(HUMAN_PLAYER)) {
                    columnCells[row].removeChild(mockPiece);
                    return columnCells[row];
                }

                columnCells[row].removeChild(mockPiece);
                break;
            }
        }
    }
    return null;
}
// 进攻性移动逻辑
function findOffensiveMove() {
    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                // 模拟放置自己的棋子
                let mockPiece = createMockPiece(AI_PLAYER);
                columnCells[row].appendChild(mockPiece);

                // 检查自己是否能赢
                if (checkWin(AI_PLAYER)) {
                    columnCells[row].removeChild(mockPiece);
                    return columnCells[row];
                }

                columnCells[row].removeChild(mockPiece);
                break;
            }
        }
    }
    return null;
}
