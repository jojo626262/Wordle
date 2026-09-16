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

const updateFriendStats = (name, won) => {
    if (!name) return;
    const all = loadFriendStats();
    if (!all[name]) all[name] = { gamesPlayed: 0, gamesWon: 0, gamesLost: 0 };
    all[name].gamesPlayed += 1;
    if (won) all[name].gamesWon += 1;
    else all[name].gamesLost += 1;
    saveFriendStats(all);
}


console.log("Stats loaded:", loadStats());