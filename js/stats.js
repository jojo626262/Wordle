const defaultStats = {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
};

const saveStats = (stats) => {
    localStorage.setItem('stats', JSON.stringify(stats));
}

const loadStats = () => {
    const stats = localStorage.getItem('stats');
    return stats ? JSON.parse(stats) : defaultStats;
}

const updateStats = (won) => {
    const stats = loadStats();
    stats.gamesPlayed += 1;
    if(won)
        stats.gamesWon += 1;
    else{
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


console.log("Stats loaded:", loadStats());