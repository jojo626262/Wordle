// Einfacher Test ohne Framework/Abhängigkeiten. Ausführen mit: node tests/test.js
// Testet die Kernlogik (game.js, share.js, stats.js) außerhalb des Browsers,
// indem localStorage und window.location per Hand nachgebaut werden.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

let failed = 0;
let passed = 0;

function assert(condition, message) {
    if (condition) {
        passed++;
    } else {
        failed++;
        console.error("FEHLGESCHLAGEN: " + message);
    }
}

function makeLocalStorage() {
    const store = {};
    return {
        getItem: (key) => (key in store ? store[key] : null),
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { for (const k in store) delete store[k]; },
    };
}

function makeSandbox() {
    const sandbox = {
        console,
        localStorage: makeLocalStorage(),
        window: { location: { href: "https://example.github.io/Wordle/", hash: "" } },
        btoa: (s) => Buffer.from(s, "binary").toString("base64"),
        atob: (s) => Buffer.from(s, "base64").toString("binary"),
        URL,
        encodeURIComponent,
        decodeURIComponent,
        escape,
        unescape,
        Math,
        parseInt,
    };
    sandbox.window.location = new Proxy(sandbox.window.location, {});
    vm.createContext(sandbox);

    for (const file of ["js/game.js", "js/share.js", "js/stats.js"]) {
        const code = fs.readFileSync(path.join(__dirname, "..", file), "utf-8");
        vm.runInContext(code, sandbox, { filename: file });
    }
    return sandbox;
}

function openLink(sandbox, url) {
    const hashIndex = url.indexOf("#");
    sandbox.window.location.href = url;
    sandbox.window.location.hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
}

// --- Test 1: evaluateGuess (Kernlogik des Ratens) ---
(function testEvaluateGuess() {
    const sandbox = makeSandbox();
    const result = vm.runInContext('evaluateGuess("KATZE", "STUHL")', sandbox);
    assert(JSON.stringify(result) === JSON.stringify(["absent", "absent", "present", "absent", "absent"]),
        "evaluateGuess sollte T als 'present' und Rest als 'absent' erkennen, bekam: " + JSON.stringify(result));

    const exact = vm.runInContext('evaluateGuess("STUHL", "STUHL")', sandbox);
    assert(exact.every((r) => r === "correct"), "Exaktes Wort sollte überall 'correct' ergeben");
})();

// --- Test 2: Link-Kodierung (Wort, Sprache, Name, ID) übersteht Hin- und Rückweg ---
(function testShareRoundtrip() {
    const sandbox = makeSandbox();
    const link = vm.runInContext('buildShareUrl("STUHL", "de", "Anna")', sandbox);
    openLink(sandbox, link);

    const word = vm.runInContext("getWordFromUrl()", sandbox);
    const lang = vm.runInContext("getLangFromUrl()", sandbox);
    const name = vm.runInContext("getNameFromUrl()", sandbox);
    const gameIdMatch = sandbox.window.location.hash.match(/id=([^&]+)/);

    assert(word === "STUHL", "Wort sollte nach Kodieren/Dekodieren 'STUHL' sein, war: " + word);
    assert(lang === "de", "Sprache sollte 'de' sein, war: " + lang);
    assert(name === "Anna", "Name sollte 'Anna' sein, war: " + name);
    assert(!!gameIdMatch, "Link sollte eine Spiel-ID enthalten");
})();

// --- Test 3: zwei Links mit gleichem Wort bekommen unterschiedliche Spiel-IDs ---
(function testUniqueGameIds() {
    const sandbox = makeSandbox();
    const link1 = vm.runInContext('buildShareUrl("STUHL", "de", "Anna")', sandbox);
    const link2 = vm.runInContext('buildShareUrl("STUHL", "de", "Anna")', sandbox);
    const id1 = link1.match(/id=([^&]+)/)[1];
    const id2 = link2.match(/id=([^&]+)/)[1];
    assert(id1 !== id2, "Gleiches Wort zweimal geteilt sollte zwei unterschiedliche Spiel-IDs ergeben");
})();

// --- Test 4: Drei-Spieler-Szenario (A spielt mit B UND mit C) ---
(function testThreePlayerScenario() {
    // A erstellt zwei unabhängige Links: einen für B, einen für C.
    const aSandbox = makeSandbox();
    const linkForB = vm.runInContext('buildShareUrl("STUHL", "de", "A")', aSandbox);
    const linkForC = vm.runInContext('buildShareUrl("MAUER", "de", "A")', aSandbox);

    // B (eigener Browser/eigenes localStorage) öffnet seinen Link, gewinnt in 3 Versuchen,
    // und erstellt danach einen Rückweg-Link an A mit seinem Ergebnis eingebettet.
    const bSandbox = makeSandbox();
    openLink(bSandbox, linkForB);
    const bWord = vm.runInContext("getWordFromUrl()", bSandbox);
    assert(bWord === "STUHL", "B sollte STUHL als Wort bekommen, bekam: " + bWord);
    const linkBackFromB = vm.runInContext(
        'buildShareUrl("MELDE", "de", "B", { won: true, tries: 3 })', bSandbox
    );

    // C (wieder eigener Browser) öffnet seinen Link, verliert, erstellt ebenfalls einen Rückweg-Link.
    const cSandbox = makeSandbox();
    openLink(cSandbox, linkForC);
    const cWord = vm.runInContext("getWordFromUrl()", cSandbox);
    assert(cWord === "MAUER", "C sollte MAUER als Wort bekommen, bekam: " + cWord);
    const linkBackFromC = vm.runInContext(
        'buildShareUrl("KUGEL", "de", "C", { won: false, tries: 6 })', cSandbox
    );

    // A öffnet beide Rückweg-Links (nacheinander, im selben Browser/localStorage)
    // und erwartet zwei unabhängige, korrekte Einträge in sentStats.
    openLink(aSandbox, linkBackFromB);
    const prevFromB = vm.runInContext("getPrevResultFromUrl()", aSandbox);
    const nameFromB = vm.runInContext("getNameFromUrl()", aSandbox);
    const fidFromB = vm.runInContext("getFriendIdFromUrl()", aSandbox);
    vm.runInContext(`updateSentStats(${JSON.stringify(fidFromB)}, ${JSON.stringify(nameFromB)}, ${prevFromB.won}, ${prevFromB.tries})`, aSandbox);

    openLink(aSandbox, linkBackFromC);
    const prevFromC = vm.runInContext("getPrevResultFromUrl()", aSandbox);
    const nameFromC = vm.runInContext("getNameFromUrl()", aSandbox);
    const fidFromC = vm.runInContext("getFriendIdFromUrl()", aSandbox);
    vm.runInContext(`updateSentStats(${JSON.stringify(fidFromC)}, ${JSON.stringify(nameFromC)}, ${prevFromC.won}, ${prevFromC.tries})`, aSandbox);

    const sentStats = vm.runInContext("loadSentStats()", aSandbox);

    assert(nameFromB === "B", "Name aus Bs Rückweg-Link sollte 'B' sein, war: " + nameFromB);
    assert(nameFromC === "C", "Name aus Cs Rückweg-Link sollte 'C' sein, war: " + nameFromC);
    assert(sentStats[fidFromB] && sentStats[fidFromB].gamesPlayed === 1 && sentStats[fidFromB].gamesWon === 1,
        "As sentStats für B sollte 1/1 sein, war: " + JSON.stringify(sentStats[fidFromB]));
    assert(sentStats[fidFromC] && sentStats[fidFromC].gamesPlayed === 1 && sentStats[fidFromC].gamesWon === 0,
        "As sentStats für C sollte 0/1 sein, war: " + JSON.stringify(sentStats[fidFromC]));

    // A rät jetzt selbst Bs und Cs neue Wörter unabhängig voneinander (friendStats).
    vm.runInContext(`updateFriendStats("fid-b", "B", true, 2)`, aSandbox);
    vm.runInContext(`updateFriendStats("fid-c", "C", false, 6)`, aSandbox);
    vm.runInContext(`updateFriendStats("fid-b", "B", true, 4)`, aSandbox);
    const friendStats = vm.runInContext("loadFriendStats()", aSandbox);

    assert(friendStats["fid-b"].gamesPlayed === 2 && friendStats["fid-b"].gamesWon === 2,
        "As friendStats gegen B sollte 2/2 sein, war: " + JSON.stringify(friendStats["fid-b"]));
    assert(friendStats["fid-c"].gamesPlayed === 1 && friendStats["fid-c"].gamesWon === 0,
        "As friendStats gegen C sollte 0/1 sein, war: " + JSON.stringify(friendStats["fid-c"]));

    // Wichtig: friendStats und sentStats dürfen sich nicht gegenseitig beeinflusst haben.
    assert(sentStats[fidFromB].gamesPlayed === 1, "sentStats für B darf nicht durch friendStats-Aufrufe verändert worden sein");
})();

// --- Test 5: Ein Link mit Vorergebnis darf beim mehrfachen Öffnen nur einmal zählen ---
(function testPrevResultIsIdempotent() {
    const aSandbox = makeSandbox();
    const link = vm.runInContext(
        'buildShareUrl("STUHL", "de", "B", { won: true, tries: 2 })', aSandbox
    );
    const gameId = link.match(/id=([^&]+)/)[1];

    function simulateInit(sandbox) {
        const prevResult = vm.runInContext("getPrevResultFromUrl()", sandbox);
        const name = vm.runInContext("getNameFromUrl()", sandbox);
        const fid = vm.runInContext("getFriendIdFromUrl()", sandbox);
        const processed = vm.runInContext(`hasProcessedPrevResult(${JSON.stringify(gameId)})`, sandbox);
        if (prevResult && !processed) {
            vm.runInContext(`updateSentStats(${JSON.stringify(fid)}, ${JSON.stringify(name)}, ${prevResult.won}, ${prevResult.tries})`, sandbox);
            vm.runInContext(`markPrevResultProcessed(${JSON.stringify(gameId)})`, sandbox);
        }
    }

    openLink(aSandbox, link);
    simulateInit(aSandbox);
    openLink(aSandbox, link); // Seite "neu geladen" / Link nochmal geöffnet
    simulateInit(aSandbox);
    openLink(aSandbox, link);
    simulateInit(aSandbox);

    const fid = vm.runInContext("getFriendIdFromUrl()", aSandbox);
    const sentStats = vm.runInContext("loadSentStats()", aSandbox);
    assert(sentStats[fid] && sentStats[fid].gamesPlayed === 1 && sentStats[fid].gamesWon === 1,
        "Dreimaliges Öffnen desselben Links sollte nur einmal zählen, war: " + JSON.stringify(sentStats[fid]));
})();

console.log(`\n${passed} bestanden, ${failed} fehlgeschlagen.`);
process.exit(failed > 0 ? 1 : 0);
