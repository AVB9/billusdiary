import { useState, useEffect } from 'react';
// import { saveUserTheme, getUserTheme } from '../services/db'; // Your Firebase logic

export function useThemeManager() {
    // 1. Initialize state with fallback defaults (Dark Mode)
    const [theme, setTheme] = useState({
        primary: '#ff3b3b',
        bg: '#0a0a0a',
        text: '#ffffff'
    });

    // 2. Load the user's saved theme from Firebase on initial load
    useEffect(() => {
        const loadTheme = async () => {
            // Mocking a DB call: const savedTheme = await getUserTheme(userId);
            const savedTheme = null; // Replace with actual DB call
            
            if (savedTheme) {
                setTheme(savedTheme);
                applyToDOM(savedTheme);
            } else {
                // If no saved theme, make sure DOM uses our defaults
                applyToDOM(theme);
            }
        };
        loadTheme();
    }, []);

    // 3. The function that actually changes the CSS variables in the browser
    const applyToDOM = (newTheme) => {
        const root = document.documentElement;
        root.style.setProperty('--color-primary', newTheme.primary);
        root.style.setProperty('--color-bg', newTheme.bg);
        root.style.setProperty('--color-text', newTheme.text);
    };

    // 4. Function for the UI to preview a color instantly without saving
    const previewColor = (key, value) => {
        const updatedTheme = { ...theme, [key]: value };
        setTheme(updatedTheme);
        applyToDOM(updatedTheme); // Instantly updates the UI
    };

    // 5. Function to permanently save the theme to Firebase
    const saveTheme = async () => {
        try {
            // await saveUserTheme(userId, theme);
            console.log("Theme saved to DB:", theme);
            // Show a success toast here!
        } catch (error) {
            console.error("Failed to save theme", error);
        }
    };

    // 6. Provide quick-switch preset themes
    const applyPreset = (presetName) => {
        const presets = {
            dark: { primary: '#ff3b3b', bg: '#0a0a0a', text: '#ffffff' },
            light: { primary: '#2196f3', bg: '#f5f5f7', text: '#1d1d1f' },
            hacker: { primary: '#00ff00', bg: '#000000', text: '#00ff00' }
        };
        
        if (presets[presetName]) {
            setTheme(presets[presetName]);
            applyToDOM(presets[presetName]);
        }
    };

    return { theme, previewColor, saveTheme, applyPreset };
}