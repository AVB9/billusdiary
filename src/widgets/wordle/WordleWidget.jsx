// src/widgets/wordle/WordleWidget.jsx
import React, { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WidgetBase from '@widgets/WidgetBase';

// States
import WordleLobby from './states/WordleLobby';
import WordleBoard from './states/WordleBoard';
import WordleAdmire from './states/WordleAdmire';
import WordleStats from './states/WordleStats';

// Overlays
import HintOverlay from './overlays/HintOverlay';
import AnswerOverlay from './overlays/AnswerOverlay';
import UnderDevOverlay from './overlays/UnderDevOverlay';

// Elements & Engine
import * as Icons from './elements/Icons'; 
import useWordleEngine, { getLocalYYYYMMDD } from './usewordleengine';

export default function WordleWidget({ widgetId }) {
    
    // State Management
    const [currentState, setCurrentState] = useState('lobby');
    const [activeOverlay, setActiveOverlay] = useState(null);
    const [gameDate, setGameDate] = useState(getLocalYYYYMMDD()); 
    const [showKeyboard, setShowKeyboard] = useState(false);
    const [answerReason, setAnswerReason] = useState('won');
    
    const isPlaying = currentState === 'board';
    const engine = useWordleEngine(isPlaying, gameDate);

    // Telemetry Sync
    useEffect(() => {
        const telemetry = { renders: 1, view: currentState, syncScope: 'ISOLATED_SOLO' };
        window.dispatchEvent(new CustomEvent('widget_telemetry_uplink', {
            detail: { type: 'wordle', data: telemetry }
        }));
    }, [currentState]);

    // Game Over Overlay Listener
    useEffect(() => {
        if (currentState !== 'board') return;

        if (engine.gameStatus === 'won' || engine.gameStatus === 'lost') {
            setAnswerReason(engine.gameStatus);
            const timer = setTimeout(() => setActiveOverlay('answer'), 1500);
            return () => clearTimeout(timer);
        }
    }, [engine.gameStatus, currentState]);

    // Top Right Section (TRS) Configurator
    const headerActions = useMemo(() => {
        const iconStyle = { 
            cursor: 'pointer', 
            display: 'flex', 
            color: 'var(--color-text-muted)', 
            transition: 'color 0.2s ease', 
            '&:hover': { color: 'var(--color-text-main, #FFF)' } 
        };
        
        const DateLabel = () => (
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-muted)' }}>
                {gameDate}
            </Typography>
        );

        const actionConfigs = {
            lobby: (
                <>
                    <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}><Icons.Room /></Box>
                    <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                </>
            ),
            board: (
                <>
                    {engine.gameStatus === 'playing' ? (
                        <>
                            <Box sx={iconStyle} onClick={() => setShowKeyboard(prev => !prev)}>
                                {showKeyboard ? <Icons.KeyboardShow /> : <Icons.KeyboardHide />}
                            </Box>
                            <Box sx={{ ...iconStyle, color: 'var(--color-primary)' }} onClick={() => setActiveOverlay('hint')}>
                                <Icons.Hint />
                            </Box>
                        </>
                    ) : (
                        <>
                            <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}><Icons.Room /></Box>
                            <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                        </>
                    )}
                    <DateLabel />
                </>
            ),
            stats: (
                <Box sx={iconStyle} onClick={() => setActiveOverlay('underdev')}><Icons.Room /></Box>
            ),
            admire: (
                <>
                    <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                    <DateLabel />
                </>
            )
        };

        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {actionConfigs[currentState] || null}
            </Box>
        );
    }, [currentState, showKeyboard, engine.gameStatus, gameDate]);

    // Dynamic State Router
    const renderActiveView = () => {
        switch (currentState) {
            case 'lobby':
                return (
                    <WordleLobby
                        onStartSolo={(date) => { setGameDate(date); setCurrentState('board'); }}
                        onAdmire={(date) => { setGameDate(date); setCurrentState('admire'); }}
                        onJoinRoom={() => setActiveOverlay('underdev')}
                        onManageRooms={() => setActiveOverlay('underdev')}
                    />
                );
            case 'board':
                return (
                    <WordleBoard 
                        guesses={engine.guesses} 
                        currentGuess={engine.currentGuess}
                        targetWord={engine.targetWord} 
                        gameStatus={engine.gameStatus}
                        onKeyPress={engine.onKeyPress} 
                        toastMessage={engine.toastMessage}
                        shakeTrigger={engine.shakeTrigger} 
                        isValidating={engine.isValidating} 
                        showKeyboard={showKeyboard} 
                    />
                );
            case 'admire':
                return (
                    <WordleAdmire 
                        guesses={engine.guesses} 
                        targetWord={engine.targetWord} 
                        definition={engine.targetDefinition} 
                    />
                );
            case 'stats':
                return <WordleStats />;
            default:
                return null;
        }
    };

    return (
        <WidgetBase
            title="WORDLE"
            onTitleClick={() => setCurrentState('lobby')}
            headerActions={headerActions}
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
                        definition={engine.targetDefinition} 
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
            {renderActiveView()}
        </WidgetBase>
    );
}