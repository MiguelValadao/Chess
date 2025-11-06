// Class declaration

class ChessBoard {
    constructor() {
        this.board = this.initializeBoard();
        this.currentTurn = 'white';
        this.moveValidator = new MoveValidator(this);
        this.selectedPiece = null;
        this.gameOver = false; // Add a game over flag
        this.validMoves = [];
        this.initEventListeners();
        this.updateDisplay();
    }

    initializeBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        
        // Black pieces (top)
        board[0][0] = { type: 'rook', color: 'black', symbol: '♜' };
        board[0][1] = { type: 'knight', color: 'black', symbol: '♞' };
        board[0][2] = { type: 'bishop', color: 'black', symbol: '♝' };
        board[0][4] = { type: 'queen', color: 'black', symbol: '♛' };
        board[0][3] = { type: 'king', color: 'black', symbol: '♚' };
        board[0][5] = { type: 'bishop', color: 'black', symbol: '♝' };
        board[0][6] = { type: 'knight', color: 'black', symbol: '♞' };
        board[0][7] = { type: 'rook', color: 'black', symbol: '♜' };
        
        // Black pawns
        for (let col = 0; col < 8; col++) {
            board[1][col] = { type: 'pawn', color: 'black', symbol: '♟' };
        }
        
        // White pawns
        for (let col = 0; col < 8; col++) {
            board[6][col] = { type: 'pawn', color: 'white', symbol: '♙' };
        }
        
        // White pieces (bottom)
        board[7][0] = { type: 'rook', color: 'white', symbol: '♖' };
        board[7][1] = { type: 'knight', color: 'white', symbol: '♘' };
        board[7][2] = { type: 'bishop', color: 'white', symbol: '♗' };
        board[7][4] = { type: 'queen', color: 'white', symbol: '♕' };
        board[7][3] = { type: 'king', color: 'white', symbol: '♔' };
        board[7][5] = { type: 'bishop', color: 'white', symbol: '♗' };
        board[7][6] = { type: 'knight', color: 'white', symbol: '♘' };
        board[7][7] = { type: 'rook', color: 'white', symbol: '♖' };
        
        return board;
    }

    getPiece(row, col) {
        if (row < 0 || row >= 8 || col < 0 || col >= 8) return null;
        return this.board[row][col];
    }

    setPiece(row, col, piece) {
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            this.board[row][col] = piece;
        }
    }

    initEventListeners() {
        const cells = document.querySelectorAll('.chess-board td');
        cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.handleCellClick(cell, index));
        });
    }

    handleCellClick(cell, index) {
        if (this.gameOver) {
            document.getElementById('info-display').textContent = 'Game Over! Refresh to play again.';
            return;
        }

        const row = Math.floor(index / 8);
        const col = index % 8;
        
        // Convert to board coordinates (HTML is 0-7 from top, chess is 0-7 from bottom)
        const boardRow = 7 - row;
        const boardCol = col;

        console.log(`Clicked: row ${boardRow}, col ${boardCol}`);

        // If a piece is already selected
        if (this.selectedPiece) {
            const moveIsValid = this.isValidMove(
                this.selectedPiece.row, 
                this.selectedPiece.col, 
                boardRow, 
                boardCol
            );

            if (moveIsValid) {
                this.makeMove(this.selectedPiece.row, this.selectedPiece.col, boardRow, boardCol);
                this.clearSelection();
            } else {
                // If clicking on another piece of same color, select that instead
                const clickedPiece = this.getPiece(boardRow, boardCol);
                if (clickedPiece && clickedPiece.color === this.currentTurn) {
                    this.selectPiece(boardRow, boardCol);
                } else {
                    this.clearSelection();
                }
            }
        } else {
            // Select a piece if it's the correct turn
            const clickedPiece = this.getPiece(boardRow, boardCol);
            if (clickedPiece && clickedPiece.color === this.currentTurn) {
                this.selectPiece(boardRow, boardCol);
            }
        }
    }

    selectPiece(row, col) {
        this.selectedPiece = { row, col };
        this.validMoves = this.getValidMoves(row, col);
        this.highlightValidMoves();
        
        const piece = this.getPiece(row, col);
        document.getElementById('info-display').textContent = 
            `Selected: ${piece.color} ${piece.type}`;
    }

    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.clearHighlights();
        document.getElementById('info-display').textContent = '';
    }

    highlightValidMoves() {
        this.validMoves.forEach(move => {
            const cell = this.getCellElement(move.row, move.col);
            if (cell) {
                cell.classList.add('valid-move');
            }
        });
    }

    clearHighlights() {
        const cells = document.querySelectorAll('.valid-move');
        cells.forEach(cell => cell.classList.remove('valid-move'));
    }

    getCellElement(row, col) {
        // Convert board coordinates to HTML coordinates
        const htmlRow = 7 - row;
        const index = htmlRow * 8 + col;
        const cells = document.querySelectorAll('.chess-board td');
        return cells[index];
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.moveValidator.isValidMove(fromRow, fromCol, toRow, toCol);
    }

    getValidMoves(row, col) {
        return this.moveValidator.getValidMoves(row, col);
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const movingPiece = this.getPiece(fromRow, fromCol);
        const targetPiece = this.getPiece(toRow, toCol);

        // Check if a king is being captured
        if (targetPiece && targetPiece.type === 'king') {
            this.setPiece(toRow, toCol, movingPiece); // Move the piece to capture the king
            this.setPiece(fromRow, fromCol, null); // Clear the original position
            this.gameOver = true;
            this.updateDisplay();
            this.updateBoardView();
            document.getElementById('info-display').textContent = `${movingPiece.color} wins! Game Over!`;
            return; // End the turn as game is over
        }

        this.setPiece(toRow, toCol, movingPiece);
        this.setPiece(fromRow, fromCol, null);
        
        this.currentTurn = this.currentTurn === 'white' ? 'black' : 'white';
        this.updateBoardView();
    }

    updateDisplay() {
        document.getElementById('player').textContent = this.currentTurn;
        document.getElementById('player').style.textTransform = 'capitalize';
    }

    // The updateBoardView method should be called after every move to reflect the board state.

    updateBoardView() {
        const cells = document.querySelectorAll('.chess-board td');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const boardRow = 7 - row;
            const boardCol = col;
            
            const piece = this.getPiece(boardRow, boardCol);
            cell.textContent = piece ? piece.symbol : '';
            
            // Remove existing piece classes
            cell.classList.remove('rook', 'knight', 'bishop', 'queen', 'king', 'pawn');
            
            // Add appropriate classes
            if (piece) {
                cell.classList.add(piece.type);
            }
        });
    }
}

// MoveValidator class (same as before, but ensure it's included)
class MoveValidator {
    constructor(board) {
        this.board = board;
    }

    getValidMoves(row, col) {
        const piece = this.board.getPiece(row, col);
        if (!piece || piece.color !== this.board.currentTurn) return [];

        switch (piece.type) {
            case 'pawn': return this.getPawnMoves(row, col, piece.color);
            case 'rook': return this.getRookMoves(row, col, piece.color);
            case 'knight': return this.getKnightMoves(row, col, piece.color);
            case 'bishop': return this.getBishopMoves(row, col, piece.color);
            case 'queen': return this.getQueenMoves(row, col, piece.color);
            case 'king': return this.getKingMoves(row, col, piece.color);
            default: return [];
        }
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        const validMoves = this.getValidMoves(fromRow, fromCol);
        return validMoves.some(move => move.row === toRow && move.col === toCol);
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;

        // Move forward one square
        if (this.isEmpty(row + direction, col)) {
            moves.push({ row: row + direction, col });
            
            // Move forward two squares from starting position
            if (row === startRow && this.isEmpty(row + 2 * direction, col)) {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        // Capture diagonally
        const captureDirections = [
            { row: direction, col: -1 },
            { row: direction, col: 1 }
        ];

        for (const dir of captureDirections) {
            const targetRow = row + dir.row;
            const targetCol = col + dir.col;
            const targetPiece = this.board.getPiece(targetRow, targetCol);
            
            if (targetPiece && targetPiece.color !== color) {
                moves.push({ row: targetRow, col: targetCol });
            }
        }

        return moves.filter(move => 
            move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8
        );
    }

    getRookMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [
            { row: -1, col: 0 }, { row: 1, col: 0 }, 
            { row: 0, col: -1 }, { row: 0, col: 1 }
        ]);
    }

    getBishopMoves(row, col, color) {
        return this.getSlidingMoves(row, col, color, [
            { row: -1, col: -1 }, { row: -1, col: 1 }, 
            { row: 1, col: -1 }, { row: 1, col: 1 }
        ]);
    }

    getQueenMoves(row, col, color) {
        const directions = [
            { row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 },
            { row: -1, col: -1 }, { row: -1, col: 1 }, { row: 1, col: -1 }, { row: 1, col: 1 }
        ];
        return this.getSlidingMoves(row, col, color, directions);
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            { row: -2, col: -1 }, { row: -2, col: 1 },
            { row: -1, col: -2 }, { row: -1, col: 2 },
            { row: 1, col: -2 }, { row: 1, col: 2 },
            { row: 2, col: -1 }, { row: 2, col: 1 }
        ];

        for (const move of knightMoves) {
            const targetRow = row + move.row;
            const targetCol = col + move.col;
            const targetPiece = this.board.getPiece(targetRow, targetCol);
            
            if (targetPiece === null) {
                moves.push({ row: targetRow, col: targetCol });
            } else if (targetPiece.color !== color) {
                moves.push({ row: targetRow, col: targetCol });
            }
        }

        return moves.filter(move => 
            move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8
        );
    }

    getKingMoves(row, col, color) {
        const moves = [];
        const kingMoves = [
            { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
            { row: 0, col: -1 }, { row: 0, col: 1 },
            { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
        ];

        for (const move of kingMoves) {
            const targetRow = row + move.row;
            const targetCol = col + move.col;
            const targetPiece = this.board.getPiece(targetRow, targetCol);
            
            if (targetPiece === null) {
                moves.push({ row: targetRow, col: targetCol });
            } else if (targetPiece.color !== color) {
                moves.push({ row: targetRow, col: targetCol });
            }
        }

        return moves.filter(move => 
            move.row >= 0 && move.row < 8 && move.col >= 0 && move.col < 8
        );
    }

    getSlidingMoves(row, col, color, directions) {
        const moves = [];

        for (const direction of directions) {
            let currentRow = row + direction.row;
            let currentCol = col + direction.col;

            while (currentRow >= 0 && currentRow < 8 && currentCol >= 0 && currentCol < 8) {
                const piece = this.board.getPiece(currentRow, currentCol);
                
                if (piece === null) {
                    moves.push({ row: currentRow, col: currentCol });
                } else {
                    if (piece.color !== color) {
                        moves.push({ row: currentRow, col: currentCol });
                    }
                    break;
                }
                
                currentRow += direction.row;
                currentCol += direction.col;
            }
        }

        return moves;
    }

    isEmpty(row, col) {
        return this.board.getPiece(row, col) === null;
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.chessGame = new ChessBoard();
});