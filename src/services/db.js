// src/services/db.js
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

/**
 * Save the user's active widgets and grid layout to Firebase.
 * Uses { merge: true } so we don't accidentally overwrite their future To-Do list data.
 */
export const saveHomeConfig = async (uid, activeWidgets, layoutData) => {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            home: {
                activeWidgets: activeWidgets,
                layout: layoutData,
                updatedAt: serverTimestamp() // CRITICAL: Resolves conflicts if user has app open on multiple devices
            }
        }, { merge: true }); 
        
        console.log("Layout saved to Firebase!");
    } catch (error) {
        console.error("Error saving layout:", error);
        throw error;
    }
};

/**
 * Fetch the user's home configuration when they open the app.
 */
export const getHomeConfig = async (uid) => {
    try {
        const userRef = doc(db, "users", uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists() && docSnap.data().home) {
            return docSnap.data().home;
        } else {
            // Return a default blank layout for brand new users
            return {
                activeWidgets: [], // Starts completely empty
                layout: { desktop: [], mobile: [] }
            };
        }
    } catch (error) {
        console.error("Error fetching layout:", error);
        throw error;
    }
};