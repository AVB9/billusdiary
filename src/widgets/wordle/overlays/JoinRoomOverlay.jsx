import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import OverlayBase from '@widgets/OverlayBase';

export default function JoinRoomOverlay({ isOpen, onClose }) {
    const [joinCode, setJoinCode] = useState('');
    const [isJoining, setIsJoining] = useState(false);

    const handleJoin = () => {
        setIsJoining(true);
        // Fake offline delay
        setTimeout(() => {
            alert(`[OFFLINE] Request sent for code: ${joinCode}`);
            setJoinCode('');
            setIsJoining(false);
            onClose();
        }, 600);
    };

    return (
        <OverlayBase isOpen={isOpen} title="JOIN ROOM" onClose={onClose}>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <input 
                    type="text" 
                    placeholder="5-LETTER CODE" 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    maxLength={5}
                    style={{ 
                        padding: '12px', borderRadius: '12px', border: '1px solid var(--color-glass-border)', 
                        background: 'rgba(0,0,0,0.5)', color: 'var(--color-text)', fontSize: '1.2rem', outline: 'none',
                        textAlign: 'center', fontWeight: 'bold', letterSpacing: '4px'
                    }}
                />
                <Button 
                    variant="contained" 
                    disabled={isJoining || joinCode.length !== 5}
                    onClick={handleJoin}
                    sx={{ 
                        py: 1.5, borderRadius: '12px', fontWeight: 900, 
                        background: joinCode.length === 5 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', 
                        color: joinCode.length === 5 ? 'var(--color-bg)' : 'rgba(255,255,255,0.3)',
                        boxShadow: 'none', '&:hover': { boxShadow: 'none', filter: 'brightness(1.1)' }
                    }}
                >
                    {isJoining ? 'SENDING...' : 'SEND REQUEST'}
                </Button>
            </Box>
        </OverlayBase>
    );
}