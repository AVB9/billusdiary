// src/widgets/wordle/useWordleEngine.js
import { useState, useEffect } from 'react';
import { saveWordleGameState } from './wordledb';

export const VALID_WORDS = [
    "BETA", "TEST", "WORD", "PLAY", "GAME", "CODE", "DATA", "NODE",
    "ROOT", "TREE", "LEAF", "CORE", "BASE", "LINK", "HTTP", "USER"
]; 

export const GAME_CONFIG = {
    WORD_LENGTH: 4,
    MAX_GUESSES: 4
};

export const getLocalYYYYMMDD = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

export const getLetterStatus = (letter, index, targetWord, isEvaluatedRow) => {
    if (!isEvaluatedRow || !letter || !targetWord) return 'unused';
    if (targetWord[index] === letter) return 'correct';
    if (targetWord.includes(letter)) return 'present';
    return 'absent';
};

export const getWordForDateStr = (dateStr) => {
    if (!dateStr) return "BETA"; 
    const numericSeed = parseInt(dateStr.replace(/-/g, ''), 10);
    const index = numericSeed % VALID_WORDS.length;
    return VALID_WORDS[index];
};

export const getSaveDataForDate = (dateStr) => {
    const key = `wordle_save_v1_${dateStr}`;
    const saved = localStorage.getItem(key);
    if (saved) {
        try { return JSON.parse(saved); } 
        catch (e) { return null; }
    }
    return null;
};

export const getGlobalWordleStats = () => {
    let played = 0, won = 0, maxStreak = 0, currentStreak = 0;
    let previousDate = null;
    const playedDates = [];
    
    const distribution = Array(GAME_CONFIG.MAX_GUESSES).fill(0); 

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('wordle_save_v1_')) {
            const puzzleDate = key.replace('wordle_save_v1_', '');
            const data = JSON.parse(localStorage.getItem(key));

            if (data.gameStatus === 'won' || data.gameStatus === 'lost' || data.isRevealed) {
                played++;
                const isLegitWin = data.gameStatus === 'won' && !data.isRevealed;
                
                if (isLegitWin) {
                    won++;
                    const guessCount = data.guesses?.length || 0;
                    if (guessCount >= 1 && guessCount <= GAME_CONFIG.MAX_GUESSES) {
                        distribution[guessCount - 1]++;
                    }
                }

                const playedOn = data.playedOn || puzzleDate; 
                if (playedOn === puzzleDate) playedDates.push({ date: puzzleDate, won: isLegitWin });
            }
        }
    }

    playedDates.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    playedDates.forEach(record => {
        if (record.won) {
            if (previousDate) {
                const prev = new Date(previousDate);
                const curr = new Date(record.date);
                const diffDays = Math.round(Math.abs(curr - prev) / (1000 * 60 * 60 * 24));
                if (diffDays === 1) currentStreak++; 
                else if (diffDays > 1) currentStreak = 1; 
            } else { currentStreak = 1; }
            if (currentStreak > maxStreak) maxStreak = currentStreak;
        } else { currentStreak = 0; }
        previousDate = record.date;
    });

    const winPercent = played === 0 ? 0 : Math.round((won / played) * 100);
    return { played, winPercent, maxStreak, distribution };
};

export default function useWordleEngine(isActive, dateStr) {
    const storageKey = dateStr ? `wordle_save_v1_${dateStr}` : null;
    const [guesses, setGuesses] = useState(() => getSaveDataForDate(dateStr)?.guesses || []);
    const [gameStatus, setGameStatus] = useState(() => getSaveDataForDate(dateStr)?.gameStatus || "playing");
    const [isRevealed, setIsRevealed] = useState(() => getSaveDataForDate(dateStr)?.isRevealed || false);
    const [playedOn, setPlayedOn] = useState(() => getSaveDataForDate(dateStr)?.playedOn || null);
    const [currentGuess, setCurrentGuess] = useState("");
    const [toastMessage, setToastMessage] = useState(null); 
    
    // NEW: Reliable numeric trigger for animations
    const [shakeTrigger, setShakeTrigger] = useState(0);
    
    const [activeDate, setActiveDate] = useState(dateStr);
    
    if (dateStr !== activeDate) {
        const newState = getSaveDataForDate(dateStr) || { guesses: [], gameStatus: 'playing', isRevealed: false, playedOn: null };
        setGuesses(newState.guesses); setGameStatus(newState.gameStatus);
        setIsRevealed(newState.isRevealed); setPlayedOn(newState.playedOn);
        setCurrentGuess(""); setActiveDate(dateStr);
    }

    const TARGET_WORD = getWordForDateStr(dateStr);

    useEffect(() => {
        if (storageKey) {
            // 1. Instant local persistence for offline resilience
            localStorage.setItem(storageKey, JSON.stringify({ guesses, gameStatus, isRevealed, playedOn }));
            
            // 2. Asynchronous cloud sync
            // NOTE: activeRoomIds is passed as an empty array for now. 
            // When we connect the global user context in Phase 5, we will pass the user's active rooms here.
            saveWordleGameState(dateStr, guesses, gameStatus, isRevealed, []);
        }
    }, [guesses, gameStatus, isRevealed, playedOn, storageKey, dateStr]);

    const showToast = (msg) => { setToastMessage(msg); setTimeout(() => setToastMessage(null), 2000); };
    
    const stampFinishedDate = () => { if (!playedOn) setPlayedOn(getLocalYYYYMMDD()); };

    const markRevealed = () => { setIsRevealed(true); stampFinishedDate(); };

    const handleKeyInput = (keyString) => {
        if (!isActive || gameStatus !== 'playing') return;
        const key = keyString.toUpperCase();

        if (key === 'BACKSPACE' || key === 'BACK') setCurrentGuess(prev => prev.slice(0, -1));
        else if (key === 'ENTER') {
            if (currentGuess.length === GAME_CONFIG.WORD_LENGTH) {
                if (!VALID_WORDS.includes(currentGuess)) { 
                    showToast("Not in word list"); 
                    setShakeTrigger(prev => prev + 1); // Trigger Shake
                    return; 
                }
                const newGuesses = [...guesses, currentGuess];
                setGuesses(newGuesses); setCurrentGuess(""); 
                if (currentGuess === TARGET_WORD) { setGameStatus("won"); stampFinishedDate(); } 
                else if (newGuesses.length >= GAME_CONFIG.MAX_GUESSES) { setGameStatus("lost"); stampFinishedDate(); }
            } else {
                // NEW: Handle incomplete words
                showToast("Not enough letters");
                setShakeTrigger(prev => prev + 1); // Trigger Shake
            }
        } 
        else if (/^[A-Z]$/.test(key) && currentGuess.length < GAME_CONFIG.WORD_LENGTH) setCurrentGuess(prev => prev + key);
    };

    return { guesses, currentGuess, gameStatus, targetWord: TARGET_WORD, toastMessage, shakeTrigger, onKeyPress: handleKeyInput, isRevealed, markRevealed };
}