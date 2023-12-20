var board = document.getElementById('gameBoard');
        var currentPlayer = 'userA';
        var columns = 7;
        var rows = 6;

        function createBoard() {
            for (var i = 0; i < columns * rows; i++) {
                var cell = document.createElement('div');
                cell.classList.add('cell');
                cell.addEventListener('click', dropPiece);
                board.appendChild(cell);
            }
        }
        function dropPiece() {
            var columnCells = getColumnCells(getColumnIndex(this));
            for (var i = columnCells.length - 1; i >= 0; i--) {
                if (!columnCells[i].hasChildNodes()) {
                    var piece = document.createElement('div');
                    piece.classList.add('piece', currentPlayer, 'animate-drop');
        
                    // 添加Iconpark Star图标
                    var icon = document.createElement('iconpark-icon');
                    icon.setAttribute('name', 'Star');
                    piece.appendChild(icon);
        
                    columnCells[i].appendChild(piece);
        
                    piece.addEventListener('animationend', () => {
                        if (checkWin(currentPlayer)) {
                            alert(currentPlayer + ' wins!');
                            resetGame();
                            return;
                        }
                        currentPlayer = currentPlayer === 'userA' ? 'userB' : 'userA';
                    }, { once: true });
        
                    break;
                }
            }
        }
                function getColumnIndex(cell) {
            return Array.prototype.indexOf.call(board.children, cell) % columns;
        }

        function getColumnCells(index) {
            var columnCells = [];
            for (var i = index; i < board.children.length; i += columns) {
                columnCells.push(board.children[i]);
            }
            return columnCells;
        }

        function checkWin(player) {
            // Check Horizontal, Vertical, and Diagonal
            return checkLine(player, 0, 1) ||
                   checkLine(player, 1, 0) ||
                   checkLine(player, 1, 1) ||
                   checkLine(player, 1, -1);
        }

        function checkLine(player, deltaRow, deltaCol) {
            for (var row = 0; row < rows; row++) {
                for (var col = 0; col < columns; col++) {
                    if (lineOfFour(player, row, col, deltaRow, deltaCol)) {
                        return true;
                    }
                }
            }
            return false;
        }

        function lineOfFour(player, startRow, startCol, deltaRow, deltaCol) {
            var count = 0;
            for (var i = 0; i < 4; i++) {
                var row = startRow + i * deltaRow;
                var col = startCol + i * deltaCol;
                if (row < 0 || row >= rows || col < 0 || col >= columns) break;
                var cell = board.children[row * columns + col];
                if (cell.hasChildNodes() && cell.firstChild.classList.contains(player)) {
                    count++;
                } else {
                    break;
                }
            }
            return count == 4;
        }
        
        function resetGame() {
            var cells = document.querySelectorAll('.cell');
            cells.forEach(cell => {
                if (cell.hasChildNodes()) {
                    cell.removeChild(cell.firstChild);
                }
            });
            currentPlayer = 'userA';
        }

        createBoard();