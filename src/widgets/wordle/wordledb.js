import { db, auth } from '../../services/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';

/**
 * Secure Dual-Write: Saves private state to the user's profile and 
 * logs a daily score integer for future multiplayer leaderboards.
 * Uses atomic batching to prevent orphaned records.
 */
export const saveWordleGameState = async (dateStr, guesses, gameStatus, isRevealed) => {
    const user = auth.currentUser;
    if (!user) return; // Fail silently if operating offline or as a guest

    try {
        // Initialize an atomic batch write
        const batch = writeBatch(db);

        // 1. Write to Private History (For Admire View)
        const historyRef = doc(db, `users/${user.uid}/wordle_history`, dateStr);
        batch.set(historyRef, {
            guesses,
            gameStatus,
            isRevealed,
            playedOn: dateStr,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // 2. Write to Public Scores collection (Leaderboard Data)
        if (gameStatus === 'won' || gameStatus === 'lost' || isRevealed) {
            let finalScore = guesses.length;
            if (gameStatus === 'lost' || isRevealed) finalScore = null;

            const publicScoreRef = doc(db, `users/${user.uid}/wordle_scores`, dateStr);
            batch.set(publicScoreRef, {
                score: finalScore,
                status: isRevealed ? 'revealed' : gameStatus,
                timestamp: serverTimestamp() // Server-enforced time prevents clock manipulation
            }, { merge: true });
        }

        // Commit all queued operations simultaneously
        await batch.commit();
        
    } catch (error) {
        console.error("Wordle DB Sync Error:", error);
    }
};