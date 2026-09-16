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

    let selectedLang = "de";

    const langBox = document.createElement("div");
    langBox.classList.add("lang-box");

    const btnDe = document.createElement("button");
    btnDe.textContent = "Deutsch";
    btnDe.classList.add("lang-btn", "active");

    const btnEn = document.createElement("button");
    btnEn.textContent = "English";
    btnEn.classList.add("lang-btn");

    const selectLang = (lang) => {
        selectedLang = lang;
        btnDe.classList.toggle("active", lang === "de");
        btnEn.classList.toggle("active", lang === "en");
    };

    btnDe.addEventListener("click", () => selectLang("de"));
    btnEn.addEventListener("click", () => selectLang("en"));

    langBox.appendChild(btnDe);
    langBox.appendChild(btnEn);

    const button = document.createElement("button");
    button.textContent = "Link erstellen";
    button.classList.add("primary-btn");

    const message = document.createElement("p");
    const linkBox = document.createElement("p");
    linkBox.classList.add("link-box");

    const submit = () => {
        const word = input.value.toUpperCase();
        if (word.length !== WORD_LENGTH || !isValidWord(word, selectedLang)) {
            message.textContent = "Bitte ein gültiges 5-Buchstaben-Wort eingeben.";
            linkBox.textContent = "";
            return;
        }
        message.textContent = "";
        const link = buildShareUrl(word, selectedLang);
        linkBox.textContent = link;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => {
                message.textContent = "Link erstellt und kopiert!";
            });
        }
    };

    button.addEventListener("click", submit);
    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submit();
    });

    app.appendChild(langBox);
    app.appendChild(input);
    app.appendChild(button);
    app.appendChild(message);
    app.appendChild(linkBox);
}

function renderResultView(secret, won, tries) {
    const app = document.getElementById("board-container");
    app.innerHTML = "";

    const card = document.createElement("div");
    card.classList.add("result-card");

    const icon = document.createElement("div");
    icon.classList.add("result-icon");
    icon.textContent = won ? "🎉" : "😔";

    const title = document.createElement("h2");
    title.textContent = won ? "Gewonnen!" : "Verloren";

    const detail = document.createElement("p");
    detail.classList.add("result-detail");
    detail.textContent = won
        ? `Du hast das Wort in ${tries} Versuchen erraten.`
        : "Leider nicht geschafft.";

    const wordReveal = document.createElement("p");
    wordReveal.classList.add("result-word");
    wordReveal.textContent = secret;

    const newGameBtn = document.createElement("button");
    newGameBtn.textContent = "Neues Spiel starten";
    newGameBtn.classList.add("primary-btn");
    newGameBtn.addEventListener("click", () => {
        window.location.href = window.location.pathname;
    });

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(detail);
    card.appendChild(wordReveal);
    card.appendChild(newGameBtn);
    app.appendChild(card);
}

function renderGuesserView(secret, gameId, lang) {
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
            if (!isValidWord(currentGuess, lang)) return;

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
                renderStatsWidget();
                saveResults(gameId, { won, tries: game.attemptsUsed });
                renderResultView(secret, won, game.attemptsUsed);
            }
        } else if (key === "BACKSPACE") {
            currentGuess = currentGuess.slice(0, -1);
            renderPreview(rowIndex, currentGuess);
        } else if (currentGuess.length < WORD_LENGTH) {
            currentGuess += key;
            renderPreview(rowIndex, currentGuess);
        }
    });
}

function renderStatsWidget() {
    let widget = document.getElementById("stats-widget");
    if (!widget) {
        widget = document.createElement("div");
        widget.id = "stats-widget";
        document.body.appendChild(widget);
    }
    const stats = loadStats();
    widget.textContent = `Gespielt: ${stats.gamesPlayed} | Gewonnen: ${stats.gamesWon} | Verloren: ${stats.gamesLost}`;
}

function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.dataset.theme = saved;

    const toggle = document.getElementById("theme-toggle");
    toggle.textContent = document.documentElement.dataset.theme === "dark" ? "☀️" : "🌙";

    toggle.addEventListener("click", () => {
        const isDark = document.documentElement.dataset.theme === "dark";
        const next = isDark ? "light" : "dark";
        document.documentElement.dataset.theme = next;
        localStorage.setItem("theme", next);
        toggle.textContent = next === "dark" ? "☀️" : "🌙";
    });
}

function init() {
    renderStatsWidget();

    if (window.location.hash === "#test") {
        renderGuesserView("STUHL", "test-" + Date.now(), "de");
        return;
    }

    const secret = getWordFromUrl();
    if (!secret) {
        renderSetterView();
    } else {
        renderGuesserView(secret, getGameIdFromHash(), getLangFromUrl());
    }
}

window.addEventListener("hashchange", init);
initTheme();
init();
