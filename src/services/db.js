// src/services/db.js
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// ==========================================
// HOME TAB: Grid Layout Syncing
// ==========================================

export const getHomeLayout = async (uid) => {
    if (!uid) return [];
    try {
        const docRef = doc(db, 'users', uid, 'tabs', 'home');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists() && docSnap.data().layout) {
            return docSnap.data().layout;
        }
        return []; // Return empty array if user has no layout yet
    } catch (error) {
        console.error("Error fetching home layout:", error);
        return [];
    }
};

export const saveHomeLayout = async (uid, layoutArray) => {
    if (!uid) return;
    try {
        const docRef = doc(db, 'users', uid, 'tabs', 'home');
        // We use { merge: true } so we don't accidentally overwrite 
        // other home tab settings we might add in the future!
        await setDoc(docRef, { layout: layoutArray }, { merge: true });
        console.log("Layout saved to Firebase securely.");
    } catch (error) {
        console.error("Error saving home layout:", error);
    }
};