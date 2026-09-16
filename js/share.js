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

function buildShareUrl(word){
    const url = new URL(window.location.href);
    url.hash = "w=" + encodeWord(word);
    return url.toString();
}

function getWordFromUrl(){
    const match = window.location.hash.match(/w=([^&]+)/);
    if (match) {
        return decodeWord(match[1]);
    }
    return null;
}