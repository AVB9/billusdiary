// src/widgets/wordle/useWordleEngine.js
import { useState, useEffect, useMemo } from 'react';

const VALID_WORDS = [
    "BETA", "TEST", "WORD", "PLAY", "GAME", "CODE", "DATA", "NODE",
    "ROOT", "TREE", "LEAF", "CORE", "BASE", "LINK", "HTTP", "USER"
]; 
const MAX_GUESSES = 4;

export default function useWordleEngine(isActive, dateStr) {
    
    // 1. DYNAMIC STORAGE KEY
    const storageKey = dateStr ? `wordle_save_v1_${dateStr}` : null;

    // Helper to fetch data safely
    const loadSavedState = (key) => {
        if (!key) return { guesses: [], gameStatus: "playing" };
        const saved = localStorage.getItem(key);
        if (saved) {
            try { return JSON.parse(saved); } 
            catch (e) { console.error("Failed to parse save", e); }
        }
        return { guesses: [], gameStatus: "playing" };
    };

    // 2. STATE INITIALIZATION
    const [guesses, setGuesses] = useState(() => loadSavedState(storageKey).guesses);
    const [gameStatus, setGameStatus] = useState(() => loadSavedState(storageKey).gameStatus);
    const [currentGuess, setCurrentGuess] = useState("");
    const [toastMessage, setToastMessage] = useState(null); 

    // 3. THE BUG FIX: SYNCHRONOUS STATE DERIVATION
    // We track the active date. If it changes, we instantly wipe and reload the state 
    // BEFORE the render finishes, completely preventing the race condition.
    const [activeDate, setActiveDate] = useState(dateStr);
    
    if (dateStr !== activeDate) {
        const newState = loadSavedState(storageKey);
        setGuesses(newState.guesses);
        setGameStatus(newState.gameStatus);
        setCurrentGuess("");
        setActiveDate(dateStr);
    }

    // 4. DETERMINISTIC DAILY WORD GENERATOR
    const TARGET_WORD = useMemo(() => {
        if (!dateStr) return "BETA"; 
        
        // Convert "2026-05-20" into a mathematical seed: 20260520
        const numericSeed = parseInt(dateStr.replace(/-/g, ''), 10);
        const index = numericSeed % VALID_WORDS.length;
        
        return VALID_WORDS[index];
    }, [dateStr]);

    // 5. AUTO-SAVE TO LOCAL STORAGE
    // Now that the state is guaranteed to be clean, it is safe to save whenever it changes.
    useEffect(() => {
        if (storageKey) {
            localStorage.setItem(storageKey, JSON.stringify({ guesses, gameStatus }));
        }
    }, [guesses, gameStatus, storageKey]);

    // 6. GAME LOGIC & KEYBOARD ENGINE
    const evaluateGuess = (guess, target) => {
        const result = Array(4).fill('absent'); 
        const targetChars = target.split('');
        const guessChars = guess.split('');

        guessChars.forEach((char, i) => {
            if (char === targetChars[i]) {
                result[i] = 'correct';
                targetChars[i] = null; 
                guessChars[i] = null;
            }
        });

        guessChars.forEach((char, i) => {
            if (char !== null && targetChars.includes(char)) {
                result[i] = 'present';
                targetChars[targetChars.indexOf(char)] = null; 
            }
        });

        return result;
    };

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 2000);
    };

    useEffect(() => {
        if (!isActive || gameStatus !== 'playing') return;

        const handleKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === 'Backspace') {
                setCurrentGuess(prev => prev.slice(0, -1));
            } 
            else if (e.key === 'Enter') {
                if (currentGuess.length === 4) {
                    if (!VALID_WORDS.includes(currentGuess)) {
                        showToast("Not in word list");
                        return;
                    }

                    const colors = evaluateGuess(currentGuess, TARGET_WORD);
                    const newGuesses = [...guesses, { word: currentGuess, colors }];
                    
                    setGuesses(newGuesses);
                    setCurrentGuess(""); 

                    if (currentGuess === TARGET_WORD) {
                        setGameStatus("won");
                    } else if (newGuesses.length >= MAX_GUESSES) {
                        setGameStatus("lost");
                    }
                }
            } 
            else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < 4) {
                setCurrentGuess(prev => prev + e.key.toUpperCase());
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isActive, gameStatus, currentGuess, guesses, TARGET_WORD]); 

    return { guesses, currentGuess, gameStatus, targetWord: TARGET_WORD, toastMessage };
}