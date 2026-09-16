const keyboardRows = [
    ["Q", "W", "E", "R", "T", "Z", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Y", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
];

const keyButtons = {};
let activeOnKey = null;

window.addEventListener("keydown", (event) => {
    if (!activeOnKey) return;
    if (event.key === "Enter") activeOnKey("ENTER");
    else if (event.key === "Backspace") activeOnKey("BACKSPACE");
    else if (/^[a-zA-Z]$/.test(event.key)) activeOnKey(event.key.toUpperCase());
});

function renderKeyboard(onKey) {
    activeOnKey = onKey;
    for (const key in keyButtons) delete keyButtons[key];

    const keyboardEl = document.createElement("div");
    keyboardEl.classList.add("keyboard");

    for (const row of keyboardRows) {
        const rowEl = document.createElement("div");
        rowEl.classList.add("keyboard-row");

        for (const key of row) {
            const keyEl = document.createElement("button");
            keyEl.classList.add("key");
            if (key === "ENTER" || key === "BACKSPACE") keyEl.classList.add("key-wide");
            keyEl.textContent = key === "BACKSPACE" ? "⌫" : key;
            keyEl.addEventListener("click", () => onKey(key));
            keyButtons[key] = keyEl;
            rowEl.appendChild(keyEl);
        }

        keyboardEl.appendChild(rowEl);
    }

    document.getElementById("board-container").appendChild(keyboardEl);
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
