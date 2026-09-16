function getGameIdFromHash() {
    const match = window.location.hash.match(/w=([^&]+)/);
    return match ? match[1] : null;
}

function renderSetterView() {
    const app = document.getElementById("board-container");
    app.innerHTML = "";

    const input = document.createElement("input");
    input.maxLength = WORD_LENGTH;
    input.placeholder = "Geheimwort (5 Buchstaben)";

    const button = document.createElement("button");
    button.textContent = "Link erstellen";

    const message = document.createElement("p");
    const linkBox = document.createElement("p");

    button.addEventListener("click", () => {
        const word = input.value.toUpperCase();
        if (word.length !== WORD_LENGTH || !isValidWord(word)) {
            message.textContent = "Bitte ein gültiges 5-Buchstaben-Wort eingeben.";
            linkBox.textContent = "";
            return;
        }
        message.textContent = "";
        linkBox.textContent = buildShareWord(word);
    });

    app.appendChild(input);
    app.appendChild(button);
    app.appendChild(message);
    app.appendChild(linkBox);
}

function renderResultView(secret, won, tries) {
    const app = document.getElementById("board-container");
    app.innerHTML = "";

    const message = document.createElement("p");
    message.textContent = won
        ? `Gewonnen in ${tries} Versuchen! Das Wort war ${secret}.`
        : `Verloren. Das Wort war ${secret}.`;

    const newGameBtn = document.createElement("button");
    newGameBtn.textContent = "Neues Spiel starten";
    newGameBtn.addEventListener("click", () => {
        window.location.href = window.location.pathname;
    });

    app.appendChild(message);
    app.appendChild(newGameBtn);
}

function renderGuesserView(secret, gameId) {
    const existing = loadResults(gameId);
    if (existing) {
        renderResultView(secret, existing.won, existing.tries);
        return;
    }

    const app = document.getElementById("board-container");
    app.innerHTML = "";

    renderBoard();

    const game = new WordleGame(secret);
    let currentGuess = "";
    let rowIndex = 0;

    renderKeyboard((key) => {
        if (key === "ENTER") {
            if (currentGuess.length !== WORD_LENGTH) return;
            if (!isValidWord(currentGuess)) return;

            const result = game.guess(currentGuess);
            renderRow(rowIndex, currentGuess, result);
            for (let i = 0; i < WORD_LENGTH; i++) {
                markKey(currentGuess[i], result[i]);
            }
            rowIndex++;
            currentGuess = "";

            if (game.status !== "playing") {
                const won = game.status === "won";
                updateStats(won);
                saveResults(gameId, { won, tries: game.attemptsUsed });
                renderResultView(secret, won, game.attemptsUsed);
            }
        } else if (key === "BACKSPACE") {
            currentGuess = currentGuess.slice(0, -1);
        } else if (currentGuess.length < WORD_LENGTH) {
            currentGuess += key;
        }
    });
}

function init() {
    const secret = getWordFromUrl();
    if (!secret) {
        renderSetterView();
    } else {
        renderGuesserView(secret, getGameIdFromHash());
    }
}

init();
