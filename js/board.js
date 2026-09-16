let cells = [];

function renderBoard() {
    const board = document.createElement("div");
    board.classList.add("board");
    cells = [];

    for (let row = 0; row < 6; row++) {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");

        for (let col = 0; col < 5; col++) {
            const cellDiv = document.createElement("div");
            cellDiv.classList.add("cell");
            rowDiv.appendChild(cellDiv);
            cells.push(cellDiv);
        }
        board.appendChild(rowDiv);
    }

    document.getElementById("board-container").appendChild(board);
}


const FLIP_STAGGER_MS = 350;
const FLIP_DURATION_MS = 700;

function rowAnimationTime() {
    return (5 - 1) * FLIP_STAGGER_MS + FLIP_DURATION_MS;
}

function renderRow(rowIndex, word, results, onLetterRevealed){
    for(let col = 0; col < 5; col++){
        const cell = cells[rowIndex * 5 + col];
        cell.textContent = word[col];
        const delay = col * FLIP_STAGGER_MS;

        setTimeout(() => {
            cell.classList.add("flip");
        }, delay);

        setTimeout(() => {
            cell.classList.add(results[col]);
            if (onLetterRevealed) onLetterRevealed(col);
        }, delay + FLIP_DURATION_MS / 2);
    }
}

function renderPreview(rowIndex, guess) {
    for (let col = 0; col < 5; col++) {
        cells[rowIndex * 5 + col].textContent = guess[col] || "";
    }
}

function shakeRow(rowIndex) {
    for (let col = 0; col < 5; col++) {
        const cell = cells[rowIndex * 5 + col];
        cell.classList.add("shake");
        setTimeout(() => cell.classList.remove("shake"), 600);
    }
}

const BOUNCE_STAGGER_MS = 100;

function bounceRow(rowIndex) {
    for (let col = 0; col < 5; col++) {
        const cell = cells[rowIndex * 5 + col];
        setTimeout(() => {
            cell.classList.add("bounce");
        }, col * BOUNCE_STAGGER_MS);
    }
}