// src/widgets/wordle/WordleWidget.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import WidgetBase from '@widgets/WidgetBase'; // Using your alias!

// Views
import WordleLobby from './state/WordleLobby';
import WordleBoard from './state/WordleBoard';

// Overlays
import RoomOverlay from './overlays/RoomOverlay';

export default function WordleWidget({ widgetId }) {
    // STATE MACHINE (5 States: 'lobby', 'board', 'stats', 'admire', 'room')
    const [currentState, setCurrentState] = useState('lobby');
    
    // OVERLAY ENGINE (4 Overlays: null, 'room', 'hint', 'answer', 'guessdistro')
    const [activeOverlay, setActiveOverlay] = useState(null);

    const [gameDate, setGameDate] = useState(null);

    // --- TRS RENDERING LOGIC ---
    const renderTRS = () => {
        switch (currentState) {
            case 'lobby':
                // Stats Icon SVG
                return (
                    <Box onClick={() => setCurrentState('stats')} sx={{ cursor: 'pointer', color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text-main, #FFF)' }}}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 20h16v2H4zM4 14h4v6H4zM10 8h4v12h-4zM16 11h4v9h-4z"/></svg>
                    </Box>
                );
            case 'board':
                return (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box onClick={() => setActiveOverlay('hint')} sx={{ cursor: 'pointer', color: 'var(--color-primary, #EF4444)' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7zm1 18h-2v1a1 1 0 0 0 2 0v-1z"/></svg>
                        </Box>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{gameDate || 'DAILY'}</Typography>
                    </Box>
                );
            case 'stats':
                return (
                    <Typography onClick={() => setCurrentState('admire')} sx={{ cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--color-primary, #EF4444)' }}>
                        ADMIRE WORDLE
                    </Typography>
                );
            case 'admire':
                return <Typography sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{gameDate}</Typography>;
            case 'room':
                return (
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <Box onClick={() => setActiveOverlay('room')} sx={{ cursor: 'pointer', color: 'var(--color-text-muted)', '&:hover': { color: 'var(--color-text-main, #FFF)' }}}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                        </Box>
                        <Typography sx={{ fontWeight: 'bold', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>ROOM NAME ▾</Typography>
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <WidgetBase 
            title="WORDLE"
            onTitleClick={() => setCurrentState('lobby')}
            headerActions={renderTRS()}
        >
            {/* --- 1. STATE RENDERER --- */}
            {currentState === 'lobby' && (
                <WordleLobby 
                    onStartSolo={(date) => { setGameDate(date); setCurrentState('board'); }}
                    onOpenRoomOverlay={(date) => { setGameDate(date); setActiveOverlay('room'); }}
                />
            )}
            
            {currentState === 'board' && (
                <WordleBoard /> // We'll re-wire the engine in the next step
            )}
            
            {currentState === 'stats' && <Box sx={{ p: 2 }}>Stats State Placeholder</Box>}
            {currentState === 'admire' && <Box sx={{ p: 2 }}>Admire State Placeholder</Box>}
            {currentState === 'room' && <Box sx={{ p: 2 }}>Room State Placeholder</Box>}

            {/* --- 2. OVERLAY RENDERER --- */}
            <RoomOverlay 
                isOpen={activeOverlay === 'room'} 
                onClose={() => setActiveOverlay(null)} 
                onConfirm={(roomData) => {
                    console.log("Joined Room:", roomData);
                    setActiveOverlay(null);
                    setCurrentState('room');
                }}
            />
            {/* Future overlays: HintOverlay, AnswerOverlay, GuessDistroOverlay will go here */}
            
        </WidgetBase>
    );
}