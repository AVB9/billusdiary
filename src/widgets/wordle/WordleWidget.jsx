// src/widgets/wordle/WordleWidget.jsx
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WidgetBase from '@widgets/WidgetBase';

// Views
import WordleLobby from './state/WordleLobby';
import WordleBoard from './state/WordleBoard';
import WordleAdmire from './state/WordleAdmire';
import WordleStats from './state/WordleStats';

// Overlays
import HintOverlay from './overlays/HintOverlay';
import AnswerOverlay from './overlays/AnswerOverlay';
import UnderDevOverlay from './overlays/UnderDevOverlay';

import * as Icons from '@ui/Icons'; 
import useWordleEngine from './usewordleengine';

const RoomIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
);

export default function WordleWidget({ widgetId }) {
    const [currentState, setCurrentState] = useState('lobby');
    const [activeOverlay, setActiveOverlay] = useState(null);
    const [gameDate, setGameDate] = useState(new Date().toLocaleDateString());
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [answerReason, setAnswerReason] = useState('won');
    
    const isPlaying = currentState === 'board';
    const engine = useWordleEngine(isPlaying, gameDate);

    useEffect(() => {
        const telemetry = { renders: 1, view: currentState, syncScope: 'ISOLATED_SOLO' };
        window.dispatchEvent(new CustomEvent('widget_telemetry_uplink', {
            detail: { type: 'wordle', data: telemetry }
        }));
    }, [currentState]);

    useEffect(() => {
        if (currentState !== 'board') return;

        if (engine.gameStatus === 'won') {
            setAnswerReason('won');
            const timer = setTimeout(() => setActiveOverlay('answer'), 1500);
            return () => clearTimeout(timer);
        } else if (engine.gameStatus === 'lost') {
            setAnswerReason('lost');
            const timer = setTimeout(() => setActiveOverlay('answer'), 1500);
            return () => clearTimeout(timer);
        }
    }, [engine.gameStatus, currentState]);

    const renderTRS = () => {
        const iconStyle = { cursor: 'pointer', display: 'flex', color: 'var(--color-text-muted)', transition: 'color 0.2s ease', '&:hover': { color: 'var(--color-text-main, #FFF)' } };
        
        switch (currentState) {
            case 'lobby':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}><RoomIcon /></Box>
                        <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                    </Box>
                );
            case 'board':
                const isGameActive = engine.gameStatus === 'playing';
                
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        
                        {isGameActive ? (
                            /* ACTIVE GAME: Show Keyboard Toggle & Hint */
                            <>
                                <Box sx={iconStyle} onClick={() => setShowKeyboard(!showKeyboard)}>
                                    {showKeyboard ? <Icons.KeyboardShow /> : <Icons.KeyboardHide />}
                                </Box>
                                <Box sx={{ ...iconStyle, color: 'var(--color-primary)' }} onClick={() => setActiveOverlay('hint')}>
                                    <Icons.Hint />
                                </Box>
                            </>
                        ) : (
                            /* GAME OVER: Show Room & Stats Icons */
                            <>
                                <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}>
                                    <RoomIcon />
                                </Box>
                                <Box sx={iconStyle} onClick={() => setCurrentState('stats')}>
                                    <Icons.Stats />
                                </Box>
                            </>
                        )}
                        
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-muted)' }}>{gameDate}</Typography>
                    </Box>
                );
            case 'stats':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}><RoomIcon /></Box>
                    </Box>
                );
            case 'admire':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-muted)' }}>{gameDate}</Typography>
                    </Box>
                );
            default: return null;
        }
    };

    return (
        <WidgetBase
            title="WORDLE"
            onTitleClick={() => setCurrentState('lobby')}
            headerActions={renderTRS()}
            toastMessage={engine.toastMessage}
            overlays={
                <>
                    <HintOverlay
                        isOpen={activeOverlay === 'hint'}
                        onClose={() => setActiveOverlay(null)}
                        targetWord={engine.targetWord}
                        onRevealAnswer={() => {
                            engine.markRevealed(); 
                            setAnswerReason('revealed');
                            setActiveOverlay('answer'); 
                        }}
                    />
                    <AnswerOverlay
                        isOpen={activeOverlay === 'answer'}
                        onClose={() => setActiveOverlay(null)}
                        targetWord={engine.targetWord}
                        reason={answerReason}
                        guessCount={engine.guesses.length}
                        isRevealed={engine.isRevealed} 
                        onGoHome={() => { setActiveOverlay(null); setCurrentState('lobby'); }}
                        onGoStats={() => { setActiveOverlay(null); setCurrentState('stats'); }}
                    />
                    
                    {/* THE MULTIPLAYER CATCH-ALL */}
                    <UnderDevOverlay 
                        isOpen={activeOverlay === 'underdev'} 
                        onClose={() => setActiveOverlay(null)} 
                    />
                </>
            }
        >
            {currentState === 'lobby' && (
                <WordleLobby
                    onStartSolo={(date) => { setGameDate(date); setCurrentState('board'); }}
                    onAdmire={(date) => { setGameDate(date); setCurrentState('admire'); }}
                    
                    /* SEALED: Lobby Buttons */
                    onJoinRoom={() => setActiveOverlay('underdev')}
                    onManageRooms={() => setActiveOverlay('underdev')}
                />
            )}
            
            {currentState === 'board' && <WordleBoard engine={engine} showKeyboard={showKeyboard} />}
            {currentState === 'admire' && <WordleAdmire engine={engine} />}
            {currentState === 'stats' && <WordleStats engine={engine} />}
            
        </WidgetBase>
    );
}