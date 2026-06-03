// src/widgets/wordle/wordledb.js
import { db, auth } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Secure Dual-Write: Saves private state to the user's profile and 
 * logs a daily score integer for future multiplayer leaderboards.
 */
export const saveWordleGameState = async (dateStr, guesses, gameStatus, isRevealed) => {
    const user = auth.currentUser;
    if (!user) return; // Fail silently if operating offline or as a guest

    try {
        // 1. Write to Private History (For Admire View)
        // This stores the exact words they typed. Safe from snooping.
        const historyRef = doc(db, `users/${user.uid}/wordle_history`, dateStr);
        await setDoc(historyRef, {
            guesses,
            gameStatus,
            isRevealed,
            playedOn: dateStr,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // 2. If the game is OVER, write to the Public Scores collection
        // This only stores the score integer (e.g., 4/6) to keep exact guesses private.
        if (gameStatus === 'won' || gameStatus === 'lost' || isRevealed) {
            let finalScore = guesses.length;
            if (gameStatus === 'lost' || isRevealed) finalScore = null;

            const publicScoreRef = doc(db, `users/${user.uid}/wordle_scores`, dateStr);
            await setDoc(publicScoreRef, {
                score: finalScore,
                status: isRevealed ? 'revealed' : gameStatus,
                timestamp: new Date().getTime() // Epoch required for deterministic sorting later
            }, { merge: true });
        }
    } catch (error) {
        console.error("Wordle DB Sync Error:", error);
    }
};