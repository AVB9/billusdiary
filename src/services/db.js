// src/services/db.js
import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";

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
                layout: layoutData
            }
        }, { merge: true }); // CRITICAL: Merge prevents overwriting other app data
        
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
            // Return a default layout if they are a brand new user
            return {
                activeWidgets: ["wordle"], // Default starting widget
                layout: { desktop: [], mobile: [] }
            };
        }
    } catch (error) {
        console.error("Error fetching layout:", error);
        throw error;
    }
};