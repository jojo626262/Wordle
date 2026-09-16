const board = document.createElement("div");
board.classList.add("board");
const cells = [];

for(let row = 0; row < 6; row++){
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("row");
    
    for(let col = 0; col < 5; col++){
        const cellDiv = document.createElement("div");
        cellDiv.classList.add("cell");
        rowDiv.appendChild(cellDiv);
        cells.push(cellDiv);
    }
    board.appendChild(rowDiv);
}

document.getElementById("board-container").appendChild(board);


 function renderRow(rowIndex, word, results){
    for(let col = 0; col < 5; col++){
        const cell = cells[rowIndex * 5 + col];
        cell.textContent = word[col];
        cell.classList.add(results[col]); 
    }
}