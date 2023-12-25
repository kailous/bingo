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
    // 防御性移动
    let defensiveMove = findDefensiveMove();
    if (defensiveMove) return defensiveMove;

    // 进攻性移动
    let offensiveMove = findOffensiveMove();
    if (offensiveMove) return offensiveMove;

    // 随机移动
    return randomMove();
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
