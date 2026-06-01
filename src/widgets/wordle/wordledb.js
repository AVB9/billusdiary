// src/widgets/wordle/wordledb.js
import { db, auth } from '../../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Creates a brand new Wordle room in Firestore.
 * @param {string} roomName - The custom name of the room (e.g., "Peaky Blinders")
 * @returns {string} - The generated 5-character Room ID (Join Code)
 */
export const createWordleRoom = async (roomName) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to create a room.");
    if (!roomName || !roomName.trim()) throw new Error("Room name cannot be empty.");

    // 1. Generate a random 5-character uppercase join code
    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();

    // 2. Point to the specific drawer (wordle_rooms) and folder (roomId)
    const roomRef = doc(db, 'wordle_rooms', roomId);

    // 3. Define the Blueprint of a Wordle Room
    const roomData = {
        roomName: roomName.trim(), // Save the human-readable name
        ownerId: user.uid,
        ownerName: user.displayName,
        memberIds: [user.uid], // The owner is automatically the first member
        joinRequests: [],
        createdAt: serverTimestamp(),
        isActive: true
    };

    try {
        await setDoc(roomRef, roomData);
        console.log(`✅ Successfully created room: ${roomName} (${roomId})`);
        return roomId;
    } catch (error) {
        console.error("❌ Error creating room:", error);
        throw error;
    }
};