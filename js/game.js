// Kernlogik: Vergleich Rateversuch vs. Geheimwort, Spielzustand.

const MAX_ATTEMPTS = 6;

// Vergleicht guess mit secret nach Wordle-Regeln.
// Rückgabe: Array von "correct" | "present" | "absent", eines pro Buchstabe.
function evaluateGuess(guess, secret) {
  const secretArr = secret.split("");
  const guessArr = guess.split("");
  const result = new Array(guessArr.length).fill("absent");

  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === secretArr[i]) {
      result[i] = "correct";
      secretArr[i] = null;
      guessArr[i] = null;
    }
  }

  for (let i = 0; i < guessArr.length; i++) {
    if (guessArr[i] === null) continue;
    const idx = secretArr.indexOf(guessArr[i]);
    if (idx !== -1) {
      result[i] = "present";
      secretArr[idx] = null;
    }
  }

  return result;
}

class WordleGame {
  constructor(secret, maxAttempts = MAX_ATTEMPTS) {
    this.secret = secret.toUpperCase();
    this.maxAttempts = maxAttempts;
    this.attempts = [];
    this.status = "playing"; // "playing" | "won" | "lost"
  }

  guess(word) {
    if (this.status !== "playing") return null;
    const upper = word.toUpperCase();
    const result = evaluateGuess(upper, this.secret);
    this.attempts.push({ word: upper, result });

    if (upper === this.secret) {
      this.status = "won";
    } else if (this.attempts.length >= this.maxAttempts) {
      this.status = "lost";
    }

    return result;
  }

  get attemptsUsed() {
    return this.attempts.length;
  }
}
