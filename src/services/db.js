// src/services/db.js
import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp, collection, addDoc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";

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

/**
 * Save a compact home summary (keep `users/{uid}` small)
 */
export const saveHomeSummary = async (uid, activeWidgets, layoutVersion = 1) => {
    try {
        const userRef = doc(db, "users", uid);
        await setDoc(userRef, {
            home: {
                activeWidgets,
                layoutVersion,
                updatedAt: serverTimestamp()
            }
        }, { merge: true });
    } catch (error) {
        console.error("Error saving home summary:", error);
        throw error;
    }
};

/**
 * Per-user widget helpers (each widget is its own doc in a subcollection)
 */
export const addWidget = async (uid, widgetObj) => {
    try {
        const widgetsCol = collection(db, 'users', uid, 'widgets');
        if (widgetObj.id) {
            const ref = doc(db, 'users', uid, 'widgets', widgetObj.id);
            await setDoc(ref, { ...widgetObj, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
            return widgetObj.id;
        } else {
            const docRef = await addDoc(widgetsCol, { ...widgetObj, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
            return docRef.id;
        }
    } catch (error) {
        console.error('Error adding widget:', error);
        throw error;
    }
};

export const updateWidget = async (uid, widgetId, patch) => {
    try {
        const ref = doc(db, 'users', uid, 'widgets', widgetId);
        await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
    } catch (error) {
        console.error('Error updating widget:', error);
        throw error;
    }
};

export const deleteWidget = async (uid, widgetId) => {
    try {
        const ref = doc(db, 'users', uid, 'widgets', widgetId);
        await deleteDoc(ref);
    } catch (error) {
        console.error('Error deleting widget:', error);
        throw error;
    }
};

export const getUserWidgets = async (uid) => {
    try {
        const widgetsCol = collection(db, 'users', uid, 'widgets');
        const snap = await getDocs(widgetsCol);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (error) {
        console.error('Error fetching widgets:', error);
        throw error;
    }
};