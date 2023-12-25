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
    // 评估局势，根据局势调整策略
    let situation = assessSituation();

    // 根据局势采取不同的行动
    if (situation === 'defensive') {
        let move = findDefensiveMove();
        if (move) return move;
    } else if (situation === 'offensive') {
        let move = findOffensiveMove();
        if (move) return move;
    }

    // 如果没有明显的策略，则采取中间游戏策略或随机移动
    return midGameStrategy() || randomMove();
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
    // 根据特定的位置评估得分
    // 这里的逻辑可以根据游戏的实际规则来调整
    // 例如，考虑到建立获胜机会或阻断对手获胜路径的潜力
    // 返回一个数值表示该位置的得分
    let score = 0;

    // 示例：增加得分如果位置旁边有相同颜色的棋子
    // 这里的代码应根据您的具体游戏规则进行调整

    // 检查水平、垂直和对角线方向上的潜在得分
    // ...

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
