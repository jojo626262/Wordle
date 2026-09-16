const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Y", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
];

const keyButtons = {};

function renderKeyboard(onKey) {
    const keyboardEl = document.createElement("div");
    keyboardEl.classList.add("keyboard");

    for (const row of keyboardRows) {
        const rowEl = document.createElement("div");
        rowEl.classList.add("keyboard-row");

        for (const key of row) {
            const keyEl = document.createElement("button");
            keyEl.textContent = key === "BACKSPACE" ? "⌫" : key;
            keyEl.addEventListener("click", () => onKey(key));
            keyButtons[key] = keyEl;
            rowEl.appendChild(keyEl);
        }

        keyboardEl.appendChild(rowEl);
    }

    document.getElementById("board-container").appendChild(keyboardEl);

    window.addEventListener("keydown", (event) => {
        if (event.key === "Enter") onKey("ENTER");
        else if (event.key === "Backspace") onKey("BACKSPACE");
        else if (/^[a-zA-Z]$/.test(event.key)) onKey(event.key.toUpperCase());
    });
}

function markKey(letter, state) {
    const keyEl = keyButtons[letter];
    if (!keyEl) return;
    if (keyEl.classList.contains("correct")) return;
    if (state === "present" && keyEl.classList.contains("present")) return;
    if (state === "correct") keyEl.classList.remove("present", "absent");
    else if (state === "present") keyEl.classList.remove("absent");
    keyEl.classList.add(state);
}
