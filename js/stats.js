const defaultStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    distribution: [0, 0, 0, 0, 0, 0],
};

const saveStats = (stats) => {
    localStorage.setItem('stats', JSON.stringify(stats));
}

const loadStats = () => {
    const stats = localStorage.getItem('stats');
    return stats ? JSON.parse(stats) : defaultStats;
}

const updateStats = (won, tries) => {
    const stats = loadStats();
    if (!stats.distribution) stats.distribution = [0, 0, 0, 0, 0, 0];
    stats.gamesPlayed += 1;
    if(won) {
        stats.gamesWon += 1;
        if (tries >= 1 && tries <= 6) stats.distribution[tries - 1] += 1;
    } else {
        stats.gamesLost += 1;
    }
    saveStats(stats);
    return stats;
}

const saveResults = (gameId, results) => {
    localStorage.setItem(`results_${gameId}`, JSON.stringify(results));
}

const loadResults = (gameId) => {
    const results = localStorage.getItem(`results_${gameId}`);
    return results ? JSON.parse(results) : "";
}

const loadFriendStats = () => {
    const raw = localStorage.getItem("friendStats");
    return raw ? JSON.parse(raw) : {};
}

const saveFriendStats = (data) => {
    localStorage.setItem("friendStats", JSON.stringify(data));
}

const updateFriendStats = (id, name, won, tries) => {
    if (!id) return;
    const all = loadFriendStats();
    if (!all[id]) all[id] = { name: name || "Unbekannt", gamesPlayed: 0, gamesWon: 0, gamesLost: 0, distribution: [0, 0, 0, 0, 0, 0] };
    if (name) all[id].name = name;
    if (!all[id].distribution) all[id].distribution = [0, 0, 0, 0, 0, 0];
    all[id].gamesPlayed += 1;
    if (won) {
        all[id].gamesWon += 1;
        if (tries >= 1 && tries <= 6) all[id].distribution[tries - 1] += 1;
    } else {
        all[id].gamesLost += 1;
    }
    saveFriendStats(all);
}

const loadSentStats = () => {
    const raw = localStorage.getItem("sentStats");
    return raw ? JSON.parse(raw) : {};
}

const saveSentStats = (data) => {
    localStorage.setItem("sentStats", JSON.stringify(data));
}

const updateSentStats = (id, name, won, tries) => {
    if (!id) return;
    const all = loadSentStats();
    if (!all[id]) all[id] = { name: name || "Unbekannt", gamesPlayed: 0, gamesWon: 0, gamesLost: 0, distribution: [0, 0, 0, 0, 0, 0] };
    if (name) all[id].name = name;
    if (!all[id].distribution) all[id].distribution = [0, 0, 0, 0, 0, 0];
    all[id].gamesPlayed += 1;
    if (won) {
        all[id].gamesWon += 1;
        if (tries >= 1 && tries <= 6) all[id].distribution[tries - 1] += 1;
    } else {
        all[id].gamesLost += 1;
    }
    saveSentStats(all);
}

function avgTries(distribution) {
    if (!distribution) return null;
    const totalWins = distribution.reduce((a, b) => a + b, 0);
    if (!totalWins) return null;
    const sum = distribution.reduce((acc, count, i) => acc + count * (i + 1), 0);
    return (sum / totalWins).toFixed(1);
}


const hasProcessedPrevResult = (gameId) => {
    return localStorage.getItem(`prevResult_${gameId}`) === "1";
}

const markPrevResultProcessed = (gameId) => {
    localStorage.setItem(`prevResult_${gameId}`, "1");
}

function resetAllStats() {
    localStorage.removeItem("stats");
    localStorage.removeItem("friendStats");
    localStorage.removeItem("sentStats");
    console.log("Alle Statistiken wurden zurückgesetzt.");
    if (typeof renderStatsWidget === "function") renderStatsWidget();
}

console.log("Stats loaded:", loadStats());