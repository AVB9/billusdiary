// src/widgets/wordle/WordleWidget.jsx
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WidgetBase from '@widgets/WidgetBase';
import OverlayBase from '@widgets/OverlayBase'; 

import WordleLobby from './state/WordleLobby';
import WordleBoard from './state/WordleBoard';
import WordleAdmire from './state/WordleAdmire';
import WordleStats from './state/WordleStats';
import RoomStats from './state/WordleRoomStats';
import ManageRoom from './state/WordleManageRoom';

import HintOverlay from './overlays/HintOverlay';
import AnswerOverlay from './overlays/AnswerOverlay';

import * as Icons from '@ui/Icons'; 
import useWordleEngine from './usewordleengine';
import { createWordleRoom } from './wordledb';

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


    // Room Creation State
    const [newRoomName, setNewRoomName] = useState('');
    const [isCreatingRoom, setIsCreatingRoom] = useState(false);

    const handleCreateRoom = async () => {
        if (!newRoomName.trim()) return;
        setIsCreatingRoom(true);
        try {
            const roomId = await createWordleRoom(newRoomName);
            alert(`Boom! Room "${newRoomName}" created!\n\nJoin Code: ${roomId}`);
            setNewRoomName('');
            setActiveOverlay(null); 
            // Future step: Automatically switch view to manage this new room!
        } catch (error) {
            console.error(error);
            alert("Failed to create room.");
        } finally {
            setIsCreatingRoom(false);
        }
    };

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
                        <Box sx={iconStyle} onClick={() => setCurrentState('roomstats')}><RoomIcon /></Box>
                        <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                    </Box>
                );
            case 'board':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={iconStyle} onClick={() => setShowKeyboard(!showKeyboard)}>
                            {showKeyboard ? <Icons.KeyboardShow /> : <Icons.KeyboardHide />}
                        </Box>
                        <Box sx={{ ...iconStyle, color: 'var(--color-primary)' }} onClick={() => setActiveOverlay('hint')}><Icons.Hint /></Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-muted)' }}>{gameDate}</Typography>
                    </Box>
                );
            case 'stats':
                // THE FIX: Removed ADMIRE bypass. Only the Room Icon is left.
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={iconStyle} onClick={() => setCurrentState('roomstats')}><RoomIcon /></Box>
                    </Box>
                );
            case 'admire':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text-muted)' }}>{gameDate}</Typography>
                    </Box>
                );
            case 'roomstats':
                // THE FIX: Removed ADMIRE bypass. Only the Stats Icon is left.
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={iconStyle} onClick={() => setCurrentState('stats')}><Icons.Stats /></Box>
                    </Box>
                );
            case 'manageroom':
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box sx={iconStyle} onClick={() => setActiveOverlay('createroom')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </Box>
                        <Box sx={{ ...iconStyle, position: 'relative' }} onClick={() => setActiveOverlay('managerequest')}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <Box sx={{ position: 'absolute', top: -2, right: -2, width: 8, height: 8, background: 'var(--color-primary)', borderRadius: '50%', border: '2px solid var(--color-glass-bg)' }} />
                        </Box>
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
                        onGoHome={() => {
                            setActiveOverlay(null);
                            setCurrentState('lobby');
                        }}
                        onGoStats={() => {
                            setActiveOverlay(null);
                            setCurrentState('stats');
                        }}
                    />

                    <OverlayBase isOpen={activeOverlay === 'joinroom'} title="JOIN ROOM" onClose={() => setActiveOverlay(null)}>
                        <Typography sx={{ color: 'var(--color-text-muted)', textAlign: 'center', p: 2 }}>[A - X X X X] Input goes here</Typography>
                    </OverlayBase>
                   <OverlayBase isOpen={activeOverlay === 'createroom'} title="CREATE SQUAD" onClose={() => setActiveOverlay(null)}>
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <input 
            type="text" 
            placeholder="e.g. Peaky Blinders..." 
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            maxLength={20}
            style={{ 
                padding: '12px', borderRadius: '12px', border: '1px solid var(--color-glass-border)', 
                background: 'rgba(0,0,0,0.5)', color: 'var(--color-text)', fontSize: '1rem', outline: 'none',
                textAlign: 'center', fontWeight: 'bold'
            }}
        />
        <Button 
            variant="contained" 
            disabled={isCreatingRoom || !newRoomName.trim()}
            onClick={handleCreateRoom}
            sx={{ 
                py: 1.5, borderRadius: '12px', fontWeight: 900, 
                background: newRoomName.trim() ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', 
                color: newRoomName.trim() ? 'var(--color-bg)' : 'rgba(255,255,255,0.3)',
                boxShadow: 'none', '&:hover': { boxShadow: 'none', filter: 'brightness(1.1)' }
            }}
        >
            {isCreatingRoom ? 'CREATING...' : 'CREATE ROOM'}
        </Button>
    </Box>
</OverlayBase>
                    <OverlayBase isOpen={activeOverlay === 'editroom'} title="EDIT ROOM" onClose={() => setActiveOverlay(null)}>
                        <Typography sx={{ color: 'var(--color-text-muted)', textAlign: 'center', p: 2 }}>Edit Room UI goes here</Typography>
                    </OverlayBase>
                    <OverlayBase isOpen={activeOverlay === 'managerequest'} title="REQUESTS" onClose={() => setActiveOverlay(null)}>
                        <Typography sx={{ color: 'var(--color-text-muted)', textAlign: 'center', p: 2 }}>Inbox UI goes here</Typography>
                    </OverlayBase>
                    <OverlayBase isOpen={activeOverlay === 'inviteplayer'} title="INVITE PLAYER" onClose={() => setActiveOverlay(null)}>
                        <Typography sx={{ color: 'var(--color-text-muted)', textAlign: 'center', p: 2 }}>Search UI goes here</Typography>
                    </OverlayBase>
                </>
            }
        >
            {currentState === 'lobby' && (
                <WordleLobby
                    onStartSolo={(date) => { setGameDate(date); setCurrentState('board'); }}
                    onAdmire={(date) => { setGameDate(date); setCurrentState('admire'); }}
                    onJoinRoom={() => setActiveOverlay('joinroom')}
                    onManageRooms={() => setCurrentState('manageroom')}
                />
            )}
            
            {currentState === 'board' && (
                <WordleBoard engine={engine} showKeyboard={showKeyboard} />
            )}
            
            {currentState === 'admire' && <WordleAdmire engine={engine} />}
            
            {currentState === 'stats' && <WordleStats engine={engine} />}

            {currentState === 'roomstats' && (
                <RoomStats 
                    onManageRoom={() => setCurrentState('manageroom')} 
                />
            )}

            {currentState === 'manageroom' && (
                <ManageRoom 
                    onOpenEdit={() => setActiveOverlay('editroom')}
                    onOpenInvite={() => setActiveOverlay('inviteplayer')}
                />
            )}
        </WidgetBase>
    );
}