import { db, auth } from '../../services/firebase';
import { doc, writeBatch, serverTimestamp } from 'firebase/firestore';

export const saveWordleGameState = async (dateStr, guesses, gameStatus, isRevealed) => {
    const user = auth.currentUser;
    if (!user) return; 

    try {
        const batch = writeBatch(db);

        // 1. Write to Private History Subcollection
        const historyRef = doc(db, `users/${user.uid}/wordle_history`, dateStr);
        batch.set(historyRef, {
            guesses,
            gameStatus,
            isRevealed,
            playedOn: dateStr,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // 2. Write to Public Root Leaderboard
        if (gameStatus === 'won' || gameStatus === 'lost' || isRevealed) {
            let finalScore = guesses.length;
            if (gameStatus === 'lost' || isRevealed) finalScore = null;

            // Notice the path: wordle_leaderboards / Date / scores / UID
            const publicScoreRef = doc(db, `wordle_leaderboards/${dateStr}/scores`, user.uid);
            batch.set(publicScoreRef, {
                score: finalScore,
                status: isRevealed ? 'revealed' : gameStatus,
                timestamp: serverTimestamp() 
            }, { merge: true });
        }

        await batch.commit();
        
    } catch (error) {
        console.error("Wordle DB Sync Error:", error);
    }
};