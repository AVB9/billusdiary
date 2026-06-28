// src/tabs/home/homedb.js
import { db } from '@services/firebase';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

/**
 * Fetch the user's home tab grid layout based on device type.
 *
 * Firestore path: users/{uid}/tabs/home
 * Shape:          { layouts: { desktop: [...], mobile: [...] }, updatedAt: Timestamp }
 */
export const getHomeLayout = async (uid, isMobileDevice) => {
    if (!uid) return [];
    try {
        const docRef  = doc(db, 'users', uid, 'tabs', 'home');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const deviceKey = isMobileDevice ? 'mobile' : 'desktop';
            
            // Return the specific device layout if it exists
            if (data.layouts && Array.isArray(data.layouts[deviceKey])) {
                return data.layouts[deviceKey];
            }
        }
        return []; // New user or device layout doesn't exist yet
    } catch (error) {
        console.error('[homedb] getHomeLayout failed:', error);
        return [];
    }
};

/**
 * Persist the user's home tab grid layout without overwriting other devices.
 *
 * Uses updateDoc with dot-notation (e.g., 'layouts.mobile') to safely update
 * a specific nested field. Falls back to setDoc if the document is brand new.
 */
export const saveHomeLayout = async (uid, layoutArray, isMobileDevice) => {
    if (!uid) return;
    
    const docRef = doc(db, 'users', uid, 'tabs', 'home');
    const deviceKey = isMobileDevice ? 'mobile' : 'desktop';
    const targetField = `layouts.${deviceKey}`;

    try {
        try {
            // Attempt a surgical update using dot-notation.
            // This prevents replacing the entire 'layouts' object.
            await updateDoc(docRef, {
                [targetField]: layoutArray,
                updatedAt: serverTimestamp()
            });
        } catch (error) {
            // updateDoc fails if the document does not exist (new user).
            // Catch the specific 'not-found' error and initialize the document.
            if (error.code === 'not-found') {
                await setDoc(docRef, {
                    layouts: {
                        [deviceKey]: layoutArray
                    },
                    updatedAt: serverTimestamp()
                });
            } else {
                throw error; // Rethrow actual database or permission errors
            }
        }
    } catch (error) {
        console.error('[homedb] saveHomeLayout failed:', error);
    }
};