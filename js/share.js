function encodeWord(word){
    return btoa(unescape(encodeURIComponent(word)));
}

function decodeWord(word){
    try{
        return decodeURIComponent(escape(atob(word)));
    } catch (e) {
        console.error("Fehler beim Decodieren des Words:", e);
        return null;
    }
}

function generateGameId(){
    return Math.random().toString(36).slice(2, 10);
}

function buildShareUrl(word, lang, name, prevResult, friendId){
    const url = new URL(window.location.href);
    const fid = friendId || generateGameId();
    let hash = "w=" + encodeWord(word) + "&lang=" + lang + "&id=" + generateGameId() + "&from=" + encodeURIComponent(name || "") + "&fid=" + fid;
    if (prevResult) {
        hash += "&prevWon=" + (prevResult.won ? "1" : "0") + "&prevTries=" + prevResult.tries;
    }
    url.hash = hash;
    return url.toString();
}

function getFriendIdFromUrl(){
    const match = window.location.hash.match(/fid=([^&]+)/);
    return match ? match[1] : null;
}

function getPrevResultFromUrl(){
    const hash = window.location.hash;
    const wonMatch = hash.match(/prevWon=([01])/);
    if (!wonMatch) return null;
    const triesMatch = hash.match(/prevTries=(\d+)/);
    return {
        won: wonMatch[1] === "1",
        tries: triesMatch ? parseInt(triesMatch[1], 10) : 0
    };
}

function getNameFromUrl(){
    const match = window.location.hash.match(/from=([^&]*)/);
    return match ? decodeURIComponent(match[1]) : "";
}

function getWordFromUrl(){
    const match = window.location.hash.match(/w=([^&]+)/);
    if (match) {
        return decodeWord(match[1]);
    }
    return null;
}

function getLangFromUrl(){
    const match = window.location.hash.match(/lang=([a-z]+)/);
    return match ? match[1] : "en";
}