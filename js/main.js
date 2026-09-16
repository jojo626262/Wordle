function getGameIdFromHash() {
    const match = window.location.hash.match(/id=([^&]+)/);
    return match ? match[1] : null;
}

function renderWordCreationCard(container, heading, prevResult) {
    const nameInput = document.createElement("input");
    nameInput.placeholder = "Dein Name (optional)";
    nameInput.classList.add("name-input");
    nameInput.value = localStorage.getItem("myName") || "";

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
        const name = nameInput.value.trim();
        localStorage.setItem("myName", name);
        const link = buildShareUrl(word, selectedLang, name, prevResult);
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

    const card = document.createElement("div");
    card.classList.add("setter-card");

    if (heading) {
        const headingEl = document.createElement("h3");
        headingEl.textContent = heading;
        card.appendChild(headingEl);
    }

    card.appendChild(langBox);
    card.appendChild(nameInput);
    card.appendChild(input);
    card.appendChild(button);
    card.appendChild(message);
    card.appendChild(linkBox);
    container.appendChild(card);
}

function setHeaderVisible(visible) {
    document.querySelector("header").style.display = visible ? "" : "none";
}

function setStatsWidgetVisible(visible) {
    const widget = document.getElementById("stats-widget");
    if (widget) widget.style.display = visible ? "" : "none";
}

function renderSetterView() {
    setHeaderVisible(true);
    setStatsWidgetVisible(true);
    const app = document.getElementById("board-container");
    app.innerHTML = "";
    renderWordCreationCard(app);
}

function renderResultView(secret, won, tries) {
    setHeaderVisible(true);
    setStatsWidgetVisible(true);
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

    card.appendChild(icon);
    card.appendChild(title);
    card.appendChild(detail);
    card.appendChild(wordReveal);

    const layout = document.createElement("div");
    layout.classList.add("result-layout");
    layout.appendChild(card);
    app.appendChild(layout);

    renderWordCreationCard(layout, "Nächste Runde", { won, tries });
}

function renderGuesserView(secret, gameId, lang, fromName) {
    const existing = loadResults(gameId);
    if (existing) {
        renderResultView(secret, existing.won, existing.tries);
        return;
    }

    setHeaderVisible(false);
    setStatsWidgetVisible(false);
    const app = document.getElementById("board-container");
    app.innerHTML = "";

    if (fromName) {
        const fromLabel = document.createElement("p");
        fromLabel.classList.add("from-label");
        fromLabel.textContent = `Wort von ${fromName}`;
        app.appendChild(fromLabel);
    }

    const toast = document.createElement("div");
    toast.classList.add("toast");
    app.appendChild(toast);
    let toastTimer = null;

    const showToast = (text) => {
        toast.textContent = text;
        toast.classList.add("visible");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove("visible"), 1200);
    };

    renderBoard();

    const game = new WordleGame(secret);
    let currentGuess = "";
    let rowIndex = 0;

    renderKeyboard((key) => {
        if (game.status !== "playing") return;

        if (key === "ENTER") {
            if (currentGuess.length !== WORD_LENGTH) {
                shakeRow(rowIndex);
                showToast("Zu wenig Buchstaben");
                return;
            }
            if (!isValidWord(currentGuess, lang)) {
                shakeRow(rowIndex);
                showToast("Nicht in der Wortliste");
                return;
            }

            const result = game.guess(currentGuess);
            const finishedGuess = currentGuess;
            const finishedRowIndex = rowIndex;
            renderRow(rowIndex, currentGuess, result, (col) => {
                markKey(finishedGuess[col], result[col]);
            });
            rowIndex++;
            currentGuess = "";

            if (game.status !== "playing") {
                setTimeout(() => {
                    const won = game.status === "won";
                    if (won) {
                        bounceRow(finishedRowIndex);
                        triggerConfetti();
                    }
                    updateStats(won, game.attemptsUsed);
                    updateFriendStats(fromName, won);
                    renderStatsWidget();
                    saveResults(gameId, { won, tries: game.attemptsUsed });
                    setTimeout(() => {
                        renderResultView(secret, won, game.attemptsUsed);
                    }, won ? 800 : 0);
                }, rowAnimationTime());
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
    widget.innerHTML = "";

    const totalLine = document.createElement("div");
    totalLine.textContent = `Gesamt: ${stats.gamesPlayed} | Gewonnen: ${stats.gamesWon} | Verloren: ${stats.gamesLost}`;
    widget.appendChild(totalLine);

    const friendStats = loadFriendStats();
    for (const name in friendStats) {
        const s = friendStats[name];
        const line = document.createElement("div");
        line.textContent = `Gegen ${name}: ${s.gamesWon}/${s.gamesPlayed} gewonnen`;
        widget.appendChild(line);
    }

    const sentStats = loadSentStats();
    for (const name in sentStats) {
        const s = sentStats[name];
        const line = document.createElement("div");
        line.textContent = `${name}: ${s.gamesWon}/${s.gamesPlayed}`;
        widget.appendChild(line);
    }

    const distribution = stats.distribution || [0, 0, 0, 0, 0, 0];
    const maxCount = Math.max(1, ...distribution);
    const chart = document.createElement("div");
    chart.classList.add("distribution-chart");

    distribution.forEach((count, i) => {
        const barRow = document.createElement("div");
        barRow.classList.add("bar-row");

        const label = document.createElement("span");
        label.textContent = i + 1;

        const bar = document.createElement("div");
        bar.classList.add("bar");
        bar.style.width = (count / maxCount) * 100 + "%";
        bar.textContent = count;

        barRow.appendChild(label);
        barRow.appendChild(bar);
        chart.appendChild(barRow);
    });

    widget.appendChild(chart);
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
    const prevResult = getPrevResultFromUrl();
    if (prevResult) {
        updateSentStats(getNameFromUrl(), prevResult.won);
    }

    renderStatsWidget();

    if (window.location.hash === "#test") {
        renderGuesserView("STUHL", "test-" + Date.now(), "de");
        return;
    }

    const secret = getWordFromUrl();
    if (!secret) {
        renderSetterView();
    } else {
        renderGuesserView(secret, getGameIdFromHash(), getLangFromUrl(), getNameFromUrl());
    }
}

window.addEventListener("hashchange", init);
initTheme();
init();
