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

function buildShareUrl(word, lang, name){
    const url = new URL(window.location.href);
    url.hash = "w=" + encodeWord(word) + "&lang=" + lang + "&id=" + generateGameId() + "&from=" + encodeURIComponent(name || "");
    return url.toString();
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
    return match ? match[1] : "de";
}