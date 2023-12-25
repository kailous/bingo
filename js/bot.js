
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

// // Define the number of input features based on your game's requirements
// const NUM_INPUT_FEATURES = 20; // Replace with the actual number of features

// // Define and compile a simple neural network model using TensorFlow.js
// const model = tf.sequential();
// model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [NUM_INPUT_FEATURES] }));
// model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
// model.add(tf.layers.dense({ units: columns, activation: 'softmax' }));
// model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });

// // Train the model with your game data (prepare your dataset)
// async function trainModel(xTrain, yTrain) {
//     console.log('Training model...');

//     const history = await model.fit(xTrain, yTrain, { epochs: 100 });

//     console.log('Training complete.');
//     console.log(history); // 输出训练历史数据，可以查看损失等信息
// }


// // Use the trained model to make predictions for game moves
// function makeAIDecisionUsingModel(gameState) {
//     // Preprocess the gameState to prepare input data
//     const inputData = preprocess(gameState);

//     // Make predictions using the model
//     const predictions = model.predict(inputData);

//     // Choose the column with the highest predicted probability
//     const bestMoveIndex = predictions.argMax({ axis: 1 }).dataSync()[0];

//     console.log('Model predictions:', predictions.arraySync()); // 输出模型的预测结果
//     console.log('Best move index:', bestMoveIndex); // 输出选择的最佳移动索引

//     return getColumnCells(bestMoveIndex)[0];
// }




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
