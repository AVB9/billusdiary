// src/widgets/wordle/wordledb.js
import { db, auth } from '../../services/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

/**
 * Creates a brand new Wordle room in Firestore.
 */
export const createWordleRoom = async (roomName) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in to create a room.");
    if (!roomName || !roomName.trim()) throw new Error("Room name cannot be empty.");

    const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const roomRef = doc(db, 'wordle_rooms', roomId);

    const roomData = {
        roomName: roomName.trim(), 
        ownerId: user.uid,
        ownerName: user.displayName,
        memberIds: [user.uid], 
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

/**
 * Sends a request to join an existing Wordle Room.
 * @param {string} joinCode - The 5-character Room ID
 * @returns {string} - The name of the room they requested to join
 */
export const requestToJoinRoom = async (joinCode) => {
    const user = auth.currentUser;
    if (!user) throw new Error("You must be logged in.");
    if (!joinCode || joinCode.length !== 5) throw new Error("Invalid join code.");

    const roomRef = doc(db, 'wordle_rooms', joinCode.toUpperCase());
    const snap = await getDoc(roomRef);

    if (!snap.exists()) throw new Error("Room not found.");

    const roomData = snap.data();
    
    // Check if they are already in the room
    if (roomData.memberIds.includes(user.uid)) {
        throw new Error("You are already in this room!");
    }

    // Check if they already sent a request
    const alreadyRequested = roomData.joinRequests.some(req => req.uid === user.uid);
    if (alreadyRequested) {
        throw new Error("You already sent a request to this room!");
    }

    // Add their profile to the waiting list!
    await updateDoc(roomRef, {
        joinRequests: arrayUnion({
            uid: user.uid,
            name: user.displayName,
            timestamp: new Date().toISOString()
        })
    });

    return roomData.roomName;
};