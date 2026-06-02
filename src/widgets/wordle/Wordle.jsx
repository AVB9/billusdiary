// src/widgets/wordle/Wordle.jsx
import React, { useState } from 'react';
import WordleWidget from './WordleWidget'; 
import Typography from '@mui/material/Typography';

export default function Wordle({ user }) {
    const [isInIframe] = useState(() => window.self !== window.top);

    return (
        <div style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            flexDirection: 'column', 
            background: isInIframe ? 'transparent' : 'var(--color-bg)' 
        }}>
            
            {/* HEADER */}
            {!isInIframe && (
                <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#60A5FA', letterSpacing: '1px' }}>WORDLE HUB</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }}></div>
                        <span style={{ color: '#10B981', fontWeight: 'bold', fontSize: '0.9rem' }}>{user?.displayName || 'Guest'}</span>
                    </div>
                </header>
            )}

            {/* THE CONTENT AREA - INJECTING YOUR WIDGET */}
            <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: isInIframe ? '0' : '20px' }}>
                <div style={{ width: '100%', maxWidth: '500px', height: '500px' }}>
                    
                    <WordleWidget user={user} isStandalone={true} />
                    
                </div>
            </main>

            {/* FOOTER */}
            {!isInIframe && (
                <footer style={{ textAlign: 'center', padding: '16px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    Developed with 🤍 by <span style={{ fontWeight: 'bold', color: 'rgba(255,255,255,0.7)' }}>Billu's Diary</span>
                </footer>
            )}

        </div>
    );
}