// src/widgets/wordle/wordledb.js
import { db } from '../../services/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Creates a brand new Wordle room in Firestore.
 * @param {Object} user - The current logged-in user object from Firebase Auth
 * @returns {string} - The generated 5-character Room ID
 */
export const createWordleRoom = async (user) => {
    if (!user) throw new Error("You must be logged in to create a room.");

    // 1. Generate a random 5-character uppercase code
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();

    // 2. Point to the specific drawer (wordle_rooms) and the specific folder (roomId)
    const roomRef = doc(db, 'wordle_rooms', roomId);

    // 3. Define the Blueprint of a Wordle Room
    const roomData = {
        ownerId: user.uid,
        ownerName: user.displayName,
        // The owner is automatically the first member
        memberIds: [user.uid],
        // People trying to get in go here
        joinRequests: [],
        createdAt: serverTimestamp(),
        isActive: true
    };

    try {
        // 4. Save it to the database
        await setDoc(roomRef, roomData);
        console.log(`✅ Successfully created room: ${roomId}`);
        return roomId;
    } catch (error) {
        console.error("❌ Error creating room:", error);
        throw error;
    }
};