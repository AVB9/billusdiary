// src/widgets/wordle/WordleWidget.jsx
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WidgetBase from '@widgets/WidgetBase';

// Views
import WordleLobby from './states/WordleLobby';
import WordleBoard from './states/WordleBoard';
import WordleAdmire from './states/WordleAdmire';
import WordleStats from './states/WordleStats';

// Overlays
import HintOverlay from './overlays/HintOverlay';
import AnswerOverlay from './overlays/AnswerOverlay';
import UnderDevOverlay from './overlays/UnderDevOverlay';

import * as Icons from '@widgets/wordle/elements/Icons'; 
import useWordleEngine from './usewordleengine';

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
                        <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}><Icons.Room /></Box>
                        <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                    </Box>
                );
            case 'board':
                const isGameActive = engine.gameStatus === 'playing';
                
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        
                        {isGameActive ? (
                            <>
                                <Box sx={iconStyle} onClick={() => setShowKeyboard(!showKeyboard)}>
                                    {showKeyboard ? <Icons.KeyboardShow /> : <Icons.KeyboardHide />}
                                </Box>
                                <Box sx={{ ...iconStyle, color: 'var(--color-primary)' }} onClick={() => setActiveOverlay('hint')}>
                                    <Icons.Hint />
                                </Box>
                            </>
                        ) : (
                            <>
                                <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}>
                                    <Icons.Room />
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
                        <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}><Icons.Room /></Box>
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
                    
                    onJoinRoom={() => setActiveOverlay('underdev')}
                    onManageRooms={() => setActiveOverlay('underdev')}
                />
            )}
            
            {currentState === 'board' && (
                <WordleBoard 
                    guesses={engine.guesses}
                    currentGuess={engine.currentGuess}
                    targetWord={engine.targetWord}
                    gameStatus={engine.gameStatus}
                    onKeyPress={engine.onKeyPress}
                    toastMessage={engine.toastMessage}
                    shakeTrigger={engine.shakeTrigger}
                    showKeyboard={showKeyboard} 
                />
            )}
            {currentState === 'admire' && <WordleAdmire guesses={engine.guesses} targetWord={engine.targetWord} />}
            {currentState === 'stats' && <WordleStats />}
            
        </WidgetBase>
    );
}