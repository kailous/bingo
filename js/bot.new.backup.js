const MAX_DEPTH = 2; // 或者您选择的任何其他合适的值

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
    var board = document.getElementById('gameBoard');
    board.addEventListener('click', handleClick);
}

// 关闭 AI 对手
function disableAI() {
    console.log('AI 对手关闭');
    var board = document.getElementById('gameBoard');
    board.removeEventListener('click', handleClick);
}
// AI 决策逻辑
function evaluateBoard() {
    let score = 0;

    // 循环遍历棋盘每一个位置
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            score += evaluatePosition('userB', col, row); // 计算 AI 'userB' 的得分
            score -= evaluatePosition('userA', col, row); // 计算对手 'userA' 的得分
        }
    }
    return score;
}


// AI 决策逻辑
function makeAIDecision() {
    let bestMove = findBestMove();
    if (bestMove) {
        bestMove.click();
    }
}

// 寻找最佳移动
function findBestMove() {
    let bestScore = -Infinity;
    let bestMove = null;

    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                // 模拟当前玩家在此位置落子
                columnCells[row].appendChild(createMockPiece('userB'));
                
                // 使用 minimax 算法计算此落子的得分
                let score = minimax(board, 0, false, -Infinity, Infinity);

                // 撤销模拟落子
                columnCells[row].removeChild(columnCells[row].firstChild);

                // 如果得分更高，则更新最佳得分和最佳移动
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = columnCells[row];
                }
            }
        }
    }

    return bestMove;
}



function assessSituation() {
    // 声明 currentStrategy 变量
    let currentStrategy;

    // 检查 AI 是否有即将获胜的机会
    if (findOffensiveMove()) {
        return 'offensive';
    }

    // 检查对手是否有即将获胜的机会
    if (findDefensiveMove()) {
        return 'defensive';
    }

    // Check if the opponent is playing aggressively
    if (isOpponentAggressive()) {
        currentStrategy = 'defensive'; // Switch to defensive strategy
    } else {
        currentStrategy = 'midgame'; // Default to midgame strategy
    }

    return currentStrategy;
}

function isOpponentAggressive() {
    // Get the current player's class (either 'userA' or 'userB')
    const currentPlayerClass = currentPlayer === 'userA' ? 'userA' : 'userB';

    // Define a threshold for the number of consecutive moves
    const consecutiveMovesThreshold = 3;

    // Initialize variables to count consecutive moves and empty cells
    let consecutiveMoves = 0;
    let emptyCells = 0;

    // Loop through the game board to analyze opponent's moves
    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            const cell = columnCells[row];

            // Check if the cell belongs to the opponent and is not empty
            if (cell.firstChild && cell.firstChild.classList.contains(currentPlayerClass)) {
                consecutiveMoves++;
            } else {
                // Reset consecutive moves count if an empty cell is encountered
                consecutiveMoves = 0;
                emptyCells++;
            }

            // Check if the opponent has made consecutive moves exceeding the threshold
            if (consecutiveMoves >= consecutiveMovesThreshold) {
                return true; // Opponent is considered aggressive
            }
        }
    }

    // If there are too few empty cells, opponent is considered aggressive
    if (emptyCells <= columns) {
        return true;
    }

    // If none of the above conditions are met, opponent is not aggressive
    return false;
}

function midGameStrategy() {
    let validMoves = [];
    
    // Collect all valid moves
    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                validMoves.push(columnCells[row]);
                break; // Only consider the lowest available position in each column
            }
        }
    }

    // Randomly select a valid move
    if (validMoves.length > 0) {
        let randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    return null;
}


function evaluatePosition(player, col, row) {
    let score = 0;

    // 检查水平、垂直和对角线方向的得分
    score += checkDirectionScore(player, col, row, 0, 1); // 水平向右
    score += checkDirectionScore(player, col, row, 1, 0); // 垂直向下
    score += checkDirectionScore(player, col, row, 1, 1); // 正对角线
    score += checkDirectionScore(player, col, row, -1, 1); // 反对角线

    return score;
}

function checkDirectionScore(player, startCol, startRow, deltaCol, deltaRow) {
    let score = 0;
    let opponent = player === 'userA' ? 'userB' : 'userA';
    let playerCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;

    for (let i = 0; i < 4; i++) {
        let col = startCol + i * deltaCol;
        let row = startRow + i * deltaRow;

        if (col >= 0 && col < columns && row >= 0 && row < rows) {
            let cellIndex = row * columns + col;
            let cell = board.children[cellIndex];

            if (cell.hasChildNodes()) {
                if (cell.firstChild.classList.contains(player)) {
                    playerCount++;
                } else if (cell.firstChild.classList.contains(opponent)) {
                    opponentCount++;
                }
            } else {
                emptyCount++;
            }
        }
    }

    // 根据不同情况给予得分
    if (playerCount == 4) {
        score += 100;
    } else if (playerCount == 3 && emptyCount == 1) {
        score += 10;
    } else if (playerCount == 2 && emptyCount == 2) {
        score += 5;
    }

    if (opponentCount == 3 && emptyCount == 1) {
        score -= 4; // 防止对手形成连续四子
    }

    return score;
}


function minimax(board, depth, isMaximizingPlayer, alpha, beta) {
    if (depth === MAX_DEPTH) {
        return evaluateBoard(board);
    }

    if (isMaximizingPlayer) {
        let bestScore = -Infinity;
        for (let col = 0; col < columns; col++) {
            let columnCells = getColumnCells(col);
            for (let row = columnCells.length - 1; row >= 0; row--) {
                if (!columnCells[row].hasChildNodes()) {
                    // 模拟当前玩家在此位置落子
                    columnCells[row].appendChild(createMockPiece('userB'));
                    let score = minimax(board, depth + 1, false, alpha, beta);
                    // 撤销模拟落子
                    columnCells[row].removeChild(columnCells[row].firstChild);

                    bestScore = Math.max(bestScore, score);
                    alpha = Math.max(alpha, bestScore);

                    if (beta <= alpha) {
                        break; // Alpha-beta 剪枝
                    }
                }
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let col = 0; col < columns; col++) {
            let columnCells = getColumnCells(col);
            for (let row = columnCells.length - 1; row >= 0; row--) {
                if (!columnCells[row].hasChildNodes()) {
                    // 模拟对手玩家在此位置落子
                    columnCells[row].appendChild(createMockPiece('userA'));
                    let score = minimax(board, depth + 1, true, alpha, beta);
                    // 撤销模拟落子
                    columnCells[row].removeChild(columnCells[row].firstChild);

                    bestScore = Math.min(bestScore, score);
                    beta = Math.min(beta, bestScore);

                    if (beta <= alpha) {
                        break; // Alpha-beta 剪枝
                    }
                }
            }
        }
        return bestScore;
    }
}




function checkDirectionScore(player, startCol, startRow, deltaCol, deltaRow) {
    let score = 0;
    let opponent = player === 'userA' ? 'userB' : 'userA';

    for (let i = 0; i < 4; i++) {
        let col = startCol + i * deltaCol;
        let row = startRow + i * deltaRow;

        // 添加边界检查
        if (col < 0 || col >= columns || row < 0 || row >= rows) {
            break;
        }

        let cellIndex = row * columns + col;
        let cell = board.children[cellIndex];

        // 确保 cell 不是 undefined
        if (cell && cell.hasChildNodes()) {
            if (cell.firstChild.classList.contains(player)) {
                score += 10; // 增加得分如果相邻位置有AI的棋子
            } else if (cell.firstChild.classList.contains(opponent)) {
                score += 5; // 增加得分如果相邻位置有对手的棋子
                break; // 遇到对手的棋子则停止在该方向上的评分
            }
        } else {
            score += 1; // 为空位置也增加一些得分
        }
    }

    return score;
}





// 创建模拟棋子
function createMockPiece(player) {
    var mockPiece = document.createElement('div');
    mockPiece.classList.add('piece', player);
    return mockPiece;
}

// 将点击事件处理封装成独立的函数
function handleClick(event) {
    if (currentPlayer === 'userA' && !gameEnded) {
        setTimeout(function () {
            if (currentPlayer === 'userB') {
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
                let mockPiece = createMockPiece('userA');
                columnCells[row].appendChild(mockPiece);

                // 检查对手是否能赢
                if (checkWin('userA')) {
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
                let mockPiece = createMockPiece('userB');
                columnCells[row].appendChild(mockPiece);

                // 检查自己是否能赢
                if (checkWin('userB')) {
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
// 随机移动
function randomMove() {
    let validCells = [];
    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                validCells.push(columnCells[row]);
                break;
            }
        }
    }
    return validCells[Math.floor(Math.random() * validCells.length)];
}
