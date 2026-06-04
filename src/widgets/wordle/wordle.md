Here is the complete architectural breakdown of your finalized `usewordleengine.js` file. You can copy and paste this directly into a `README.md` or a documentation file in your Wordle folder for future reference.

---

# Documentation: `usewordleengine.js` (The Brain)

This file is a **Custom React Hook**. It acts as the central logic engine for the Wordle widget. It does not render any UI; it strictly handles mathematics, state management, validation, and local persistence.

## 1. Global Configuration & Data Retrieval

```javascript
export const GAME_CONFIG = { WORD_LENGTH: 4, MAX_GUESSES: 4 };

const getActiveDictionary = () => { ... }
export const getLocalYYYYMMDD = () => { ... }

```

* **`GAME_CONFIG`**: The single source of truth for the game's difficulty. Changing `WORD_LENGTH` to 5 instantly alters the entire game's behavior.
* **`getActiveDictionary`**: Dynamically looks at `GAME_CONFIG.WORD_LENGTH` and pulls only the bucket of words matching that length from `wordlist.js` in $O(1)$ time.
* **`getLocalYYYYMMDD`**: A timezone-proof date formatter. Ensures the database keys and date seeds are always identical regardless of the user's browser locale settings.

## 2. The Game Mathematics

```javascript
export const getLetterStatus = (letter, index, targetWord, isEvaluatedRow) => { ... }
const getScatteredIndex = (dateStr, arrayLength) => { ... }
export const getWordForDateStr = (dateStr) => { ... }
export const getDefinitionForDateStr = (dateStr) => { ... }

```

* **`getLetterStatus`**: Evaluates a specific letter against the target word to return `correct` (green), `present` (yellow), or `absent` (gray).
* **`getScatteredIndex`**: The PRNG (Pseudo-Random Number Generator). Uses a Linear Congruential Generator (LCG) mathematical formula. It converts the date into a giant number, scrambles it, and spits out a random index. This prevents "alphabetical clumping" so users don't get 5 words starting with the letter "A" in the same week.
* **`getWord...` & `getDefinition...**`: Uses the scattered index to deterministically pick the daily word/definition. Because it relies on math, every player globally gets the exact same word on the exact same day without needing a server.

## 3. Storage & Stats Calculations

```javascript
export const getSaveDataForDate = (dateStr) => { ... }
export const checkIfPlayed = (dateStr) => { ... }
export const getGlobalWordleStats = () => { ... }

```

* **`getSaveDataForDate`**: Safely retrieves and parses the user's saved game from their browser's `localStorage` so they don't lose their progress if they refresh the page.
* **`checkIfPlayed`**: A lightweight helper for UI components to quickly check if a specific date's game is already won or lost.
* **`getGlobalWordleStats`**: Loops through the user's browser memory, tallies all won/lost games, calculates their maximum win streak, current win streak, and compiles the guess distribution array for the statistics bar chart.

## 4. The Hook (`useWordleEngine`)

```javascript
export default function useWordleEngine(isActive, dateStr) { ... }

```

This is the core manager that binds the math to React's lifecycle. It takes two props: `isActive` (is the user currently looking at the board?) and `dateStr` (which date are they playing?).

### State & Derived State

```javascript
const [guesses, setGuesses] = useState(...) // etc...

if (dateStr !== activeDate) { ... }

```

* Initializes the game state by checking if there is save data for the chosen date.
* **The Derived State Block (`if (dateStr !== activeDate)`)**: If the user clicks a different date in the Lobby, this block intercepts the render and instantly resets all variables (guesses, gameStatus) to the new date. This ensures a mathematically perfect, zero-flicker UI transition.

### Auto-Saver

```javascript
useEffect(() => {
    if (storageKey) {
        localStorage.setItem(...);
        saveWordleGameState(...);
    }
}, [...]);

```

* Runs automatically whenever the user makes a guess or the game status changes. It saves the progress locally (for instant loading) and pushes it to your database (`saveWordleGameState`).

### Network Validation

```javascript
const checkWordValidity = async (word) => { ... }

```

* **Step 1 (Fast-Pass)**: Checks if the user's guess exists in your local `TARGET_WORDS` array. If yes, instant approval.
* **Step 2 (API Call)**: Queries the Free Dictionary API. If it returns 404, the word is fake.
* **Step 3 (Network Resilience)**: Implements an `AbortController`. If the API takes longer than 3 seconds (due to bad internet or a server crash), the controller forces a timeout and gracefully rejects the word so the user's keyboard doesn't permanently freeze.

### The Input Controller

```javascript
const handleKeyInput = async (keyString) => { ... }

```

* Filters out inputs if the game is over or currently validating an API call.
* Handles **Backspace** (removes last letter) and **A-Z keys** (appends letter to `currentGuess`).
* Handles **Enter**:
1. Checks if the word is long enough.
2. Locks the keyboard (`setIsValidating(true)`).
3. Runs the API check.
4. Evaluates Win/Loss conditions based on `MAX_GUESSES`.
5. Triggers shake animations and toast messages for errors.



### The Export

```javascript
return { guesses, currentGuess, gameStatus, ... };

```

* Packages everything into a clean object so the `WordleWidget.jsx` controller can pass the required variables down to the dumb visual layers (like the Board and the Overlays).