export const saveWordleGameState = async (dateStr, guesses, gameStatus, isRevealed, activeRoomIds = []) => {
    const user = auth.currentUser;
    if (!user) return; // Fail silently if operating offline/guest

    try {
        // 1. Write to Private History (For Admire View)
        const historyRef = doc(db, `users/${user.uid}/wordle_history`, dateStr);
        await setDoc(historyRef, {
            guesses,
            gameStatus,
            isRevealed,
            playedOn: dateStr,
            updatedAt: serverTimestamp()
        }, { merge: true });

        // 2. If the game is OVER, broadcast the score to Public Rooms
        if (gameStatus === 'won' || gameStatus === 'lost' || isRevealed) {
            let finalScore = guesses.length;
            if (gameStatus === 'lost' || isRevealed) finalScore = null;

            const scoreData = {
                score: finalScore,
                status: isRevealed ? 'revealed' : gameStatus,
                timestamp: new Date().getTime() // Epoch required for deterministic sorting
            };

            // Fan-out write to all rooms the user is currently active in
            const roomPromises = activeRoomIds.map(roomId => {
                const roomScoreRef = doc(db, `wordle_rooms/${roomId}/daily_scores`, dateStr);
                return setDoc(roomScoreRef, {
                    scores: {
                        [user.uid]: scoreData
                    }
                }, { merge: true });
            });

            await Promise.all(roomPromises);
        }
    } catch (error) {
        console.error("Wordle DB Sync Error:", error);
    }
};