
const BOT_VERSION = '1.1.0';

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

    // 3. 评估所有可行落子，结合位置评分和策略判断
    const candidateMoves = collectValidMoves();
    if (candidateMoves.length === 0) return null;

    const situation = assessSituation();
    const scoredMoves = candidateMoves.map((cell) => {
        const evaluation = evaluateMove(cell, situation);
        return {
            cell,
            score: evaluation.score,
            opponentThreats: evaluation.opponentThreats
        };
    });

    // 先筛选出不会给对手留下立刻获胜机会的落子
    const minThreats = Math.min(...scoredMoves.map(move => move.opponentThreats));
    const safestMoves = scoredMoves.filter(move => move.opponentThreats === minThreats);

    // 在最安全的候选中按评分排序
    safestMoves.sort((a, b) => b.score - a.score);
    const bestScore = safestMoves[0].score;

    // 在最佳分数的候选中随机挑选，避免过于机械
    const topChoices = safestMoves.filter(move => move.score === bestScore);
    return topChoices[Math.floor(Math.random() * topChoices.length)].cell;
}

function assessSituation() {
    if (countImmediateThreats(AI_PLAYER) > 0) {
        return 'offensive';
    }

    if (isOpponentAggressive()) {
        return 'defensive';
    }

    return 'midgame';
}

function isOpponentAggressive() {
    // 始终以 AI 的对手为分析对象
    const opponentClass = HUMAN_PLAYER;

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
            if (cell.firstChild && cell.firstChild.classList.contains(opponentClass)) {
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


function evaluatePositionScore(col, row, player) {
    let score = 0;

    // 中心列更优，增加额外权重鼓励占领中心
    const centerDistance = Math.abs(col - Math.floor(columns / 2));
    score += (columns - centerDistance * 2);

    // 检查水平方向的潜在得分
    score += checkDirectionScore(col, row, 0, 1, player); // 水平向右
    score += checkDirectionScore(col, row, 0, -1, player); // 水平向左

    // 检查垂直方向的潜在得分
    score += checkDirectionScore(col, row, 1, 0, player); // 垂直向下

    // 检查对角线方向的潜在得分
    score += checkDirectionScore(col, row, 1, 1, player); // 对角线向右下
    score += checkDirectionScore(col, row, 1, -1, player); // 对角线向左下
    score += checkDirectionScore(col, row, -1, 1, player); // 对角线向右上
    score += checkDirectionScore(col, row, -1, -1, player); // 对角线向左上

    return score;
}

function checkDirectionScore(col, row, deltaRow, deltaCol, player) {
    let score = 0;
    let opponent = player === 'userA' ? 'userB' : 'userA';

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

function evaluateMove(cell, situation) {
    const col = getColumnIndex(cell);
    const columnCells = getColumnCells(col);
    const row = columnCells.indexOf(cell);

    // 根据当前策略调节权重
    const strategyMultiplier = situation === 'defensive' ? 0.9 : 1.1;

    // 模拟放置棋子评估潜在分数
    const mockPiece = createMockPiece(AI_PLAYER);
    cell.appendChild(mockPiece);
    const baseScore = evaluatePositionScore(col, row, AI_PLAYER);

    // 如果此落子能让下一步形成双威胁，给予额外奖励
    const followUpScore = countImmediateThreats(AI_PLAYER) * 15;

    // 避免送出对手下一回合的直接获胜机会
    const opponentThreats = countImmediateThreats(HUMAN_PLAYER);

    cell.removeChild(mockPiece);

    const safetyPenalty = opponentThreats * 50;

    return {
        score: baseScore * strategyMultiplier + followUpScore - safetyPenalty,
        opponentThreats
    };
}

function countImmediateThreats(player) {
    let threatCount = 0;

    for (let col = 0; col < columns; col++) {
        const columnCells = getColumnCells(col);
        for (let row = columnCells.length - 1; row >= 0; row--) {
            if (!columnCells[row].hasChildNodes()) {
                const mockPiece = createMockPiece(player);
                columnCells[row].appendChild(mockPiece);
                if (checkWin(player)) {
                    threatCount++;
                }
                columnCells[row].removeChild(mockPiece);
                break;
            }
        }
    }

    return threatCount;
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
