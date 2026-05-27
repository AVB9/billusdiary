// src/services/auth.js
import { auth } from './firebase';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    signInAnonymously, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";

const googleProvider = new GoogleAuthProvider();

// 1. Google Login
export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Google Login Error:", error);
        throw error;
    }
};

// 2. Guest Login (For users who don't want an account yet)
export const loginAsGuest = async () => {
    try {
        const result = await signInAnonymously(auth);
        return result.user;
    } catch (error) {
        console.error("Guest Login Error:", error);
        throw error;
    }
};

// 3. Logout
export const logoutUser = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout Error:", error);
    }
};

// 4. Auth Listener (Tells React when the user logs in/out)
export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
};