// src/components/layout/OnBoarding.jsx
import React, { useState } from 'react';
import { loginWithGoogle, loginAsGuest } from '../../services/auth';

export default function OnBoarding() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const handleGoogleSignIn = async () => {
        setIsLoading(true);
        setError("");
        try {
            await loginWithGoogle();
            // We don't need to manually redirect here! 
            // App.jsx is listening to Firebase and will auto-switch the screen.
        } catch (err) {
            setError("Failed to sign in with Google.");
            setIsLoading(false);
        }
    };

    const handleGuestSignIn = async () => {
        setIsLoading(true);
        setError("");
        try {
            await loginAsGuest();
        } catch (err) {
            setError("Failed to continue as guest.");
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            minHeight: '100vh',
            padding: '20px'
        }}>
            {/* Using the global CSS class you defined in components.css */}
            <div className="glass-panel" style={{ maxWidth: '400px', height: 'auto', textAlign: 'center' }}>
                
                <h1 style={{ fontSize: '2rem', marginBottom: '8px', color: 'white' }}>Billu's Diary</h1>
                <p className="bento-sub" style={{ marginBottom: '32px' }}>
                    Your personal OS. Widgets, planners, and momentum.
                </p>

                {error && <p style={{ color: '#EF4444', marginBottom: '16px' }}>{error}</p>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <button 
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="bottom-pill-btn" 
                        style={{ 
                            background: 'rgba(255,255,255,0.1)', 
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            color: 'white'
                        }}
                    >
                        {isLoading ? 'Connecting...' : 'Sign in with Google'}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '8px 0' }}>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                        <span className="bento-sub" style={{ fontSize: '0.8rem' }}>OR</span>
                        <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>
                    </div>

                    <button 
                        onClick={handleGuestSignIn}
                        disabled={isLoading}
                        className="bottom-pill-btn"
                        style={{ borderRadius: '12px', background: 'rgba(255,255,255,0.05)' }}
                    >
                        Continue as Guest
                    </button>
                </div>

                <p className="bento-sub" style={{ fontSize: '0.75rem', marginTop: '24px', opacity: 0.5 }}>
                    *Guests have restricted access to multiplayer widgets (like Wordle) and data will not sync across devices.
                </p>

            </div>
        </div>
    );
}