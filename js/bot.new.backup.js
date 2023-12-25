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
                columnCells[row].appendChild(createMockPiece('userB'));
                let score = minimax(0, false);
                columnCells[row].removeChild(columnCells[row].firstChild);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = columnCells[row];
                }
                break;
            }
        }
    }

    return bestMove;
}


function minimax(depth, isMaximizingPlayer) {
    if (depth === 2) {
        return evaluateBoard();
    }

    if (isMaximizingPlayer) {
        let bestScore = -Infinity;
        for (let col = 0; col < columns; col++) {
            let columnCells = getColumnCells(col);
            for (let row = columnCells.length - 1; row >= 0; row--) {
                if (!columnCells[row].hasChildNodes()) {
                    columnCells[row].appendChild(createMockPiece('userB'));
                    let score = minimax(depth + 1, false);
                    columnCells[row].removeChild(columnCells[row].firstChild);
                    bestScore = Math.max(score, bestScore);
                    break;
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
                    columnCells[row].appendChild(createMockPiece('userA'));
                    let score = minimax(depth + 1, true);
                    columnCells[row].removeChild(columnCells[row].firstChild);
                    bestScore = Math.min(score, bestScore);
                    break;
                }
            }
        }
        return bestScore;
    }
}


function evaluateBoard() {
    let score = 0;

    // 评估 AI ('userB') 获胜的机会
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            score += evaluatePosition('userB', col, row);
        }
    }

    // 评估对手 ('userA') 获胜的机会并相应减分
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            score -= evaluatePosition('userA', col, row);
        }
    }

    return score;
}
function evaluatePosition(player, col, row) {
    let score = 0;

    // 如果这个位置能让userB获胜，增加得分
    score += checkLineScore(player, col, row, 11, 0);  // 垂直
    score += checkLineScore(player, col, row, 0, 1);  // 水平
    score += checkLineScore(player, col, row, 1, -1);  // 对角线
    score += checkLineScore(player, col, row, 1, -1); // 反对角线

    // 如果这个位置能阻止userA获胜，增加得分
    let opponent = player === 'userA' ? 'userB' : 'userA';
    score += checkLineScore(opponent, col, row, 1, 0);  // 垂直
    score += checkLineScore(opponent, col, row, 0, 1);  // 水平
    score += checkLineScore(opponent, col, row, 1, -1);  // 对角线
    score += checkLineScore(opponent, col, row, 1, -1); // 反对角线

    // 如果这个位置能让userA获胜，减少得分
    score -= checkLineScore('userA', col, row, 11, 0);  // 垂直
    score -= checkLineScore('userA', col, row, 0, 1);  // 水平
    score -= checkLineScore('userA', col, row, 1, -1);  // 对角线
    score -= checkLineScore('userA', col, row, 1, -1); // 反对角线
    // 找出最佳移动并输出在控制台
    if (score >= 2) {
        // console.log('AI 获胜的机会');
        console.log(score);
    } else if (score <= -2) {
        // console.log('AI 阻止对手获胜的机会');
        console.log(score);
    }

    return score;
}

function checkLineScore(player, startCol, startRow, deltaCol, deltaRow) {
    let count = 0;
    for (let i = 0; i < 4; i++) {
        // 检查边界
        // col 应为 A 到 G
        // row 应为 1 到 6
        let col = startCol + i * deltaCol;
        let row = startRow + i * deltaRow;
        if (col < 0 || col >= columns || row < 0 || row >= rows) {
            break;
        }
        // 检查当前位置是否有棋子
        let cellIndex = row * columns + col;
        let cell = board.children[cellIndex];
        if (cell.hasChildNodes() && cell.firstChild.classList.contains(player)) {
            count++;
        } else {
            break;
        }
    }
    return count;
}




function assessSituation() {
    // 检查 AI 是否有即将获胜的机会
    if (findOffensiveMove()) {
        return 'offensive';
    }

    // 检查对手是否有即将获胜的机会
    if (findDefensiveMove()) {
        return 'defensive';
    }

    // 如果没有明显的获胜机会，考虑中间游戏策略
    return 'midgame';
}


function midGameStrategy() {
    let bestMove = null;
    let maxScore = 0;

    for (let col = 0; col < columns; col++) {
        let columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                // 评估每个可用位置的得分
                let score = evaluatePositionScore(col, row);

                // 选择得分最高的移动
                if (score > maxScore) {
                    maxScore = score;
                    bestMove = columnCells[row];
                }

                break; // 只考虑每列的最低可用位置
            }
        }
    }

    return bestMove;
}

function evaluatePositionScore(col, row) {
    let score = 0;

    // 检查水平方向的潜在得分
    score += checkDirectionScore(col, row, 0, 1); // 水平向右
    score += checkDirectionScore(col, row, 0, -1); // 水平向左

    // 检查垂直方向的潜在得分
    score += checkDirectionScore(col, row, 1, 0); // 垂直向下

    // 检查对角线方向的潜在得分
    score += checkDirectionScore(col, row, 1, 1); // 对角线向右下
    score += checkDirectionScore(col, row, 1, -1); // 对角线向左下
    score += checkDirectionScore(col, row, -1, 1); // 对角线向右上
    score += checkDirectionScore(col, row, -1, -1); // 对角线向左上
    
    return score;
}

function checkDirectionScore(col, row, deltaRow, deltaCol) {
    let score = 0;
    let opponent = currentPlayer === 'userA' ? 'userB' : 'userA';

    // 检查四个方向上相邻的3个位置
    for (let i = 1; i <= 3; i++) {
        let newRow = row + i * deltaRow;
        let newCol = col + i * deltaCol;

        // 检查边界
        if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= columns) {
            break;
        }

        let cellIndex = newRow * columns + newCol;
        let cell = board.children[cellIndex];

        if (cell.hasChildNodes()) {
            if (cell.firstChild.classList.contains(currentPlayer)) {
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
