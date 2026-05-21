// src/widgets/wordle/overlays/RoomOverlay.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import OverlayBase from '@widgets/OverlayBase';

export default function RoomOverlay({ isOpen, onClose, onConfirm }) {
    const [roomName, setRoomName] = useState('');
    const [codeLetter, setCodeLetter] = useState('S');
    const [codeNumbers, setCodeNumbers] = useState('');

    const isExistingRoom = roomName === 'test' && codeNumbers === '1234'; // Mock logic for button text

    const handleConfirm = () => {
        onConfirm({ name: roomName, code: `${codeLetter}-${codeNumbers}` });
    };

    return (
        <OverlayBase isOpen={isOpen} title="Rooms" onClose={onClose}>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', lineHeight: 1.2, mb: 0.1, display: 'block' }}>
                Just enter the room code to join an existing room.
            </Typography>

            {/* ROOM CODE INPUT */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <input 
                    type="text" 
                    maxLength={1}
                    value={codeLetter}
                    onChange={(e) => setCodeLetter(e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())}
                    style={{
                        width: '45px', padding: '12px 0', borderRadius: '12px', border: '1px solid var(--color-glass-border)',
                        background: 'rgba(0, 0, 0, 0.3)', color: 'var(--color-primary, #EF4444)', 
                        fontSize: '1rem', outline: 'none', fontWeight: 900, textAlign: 'center', textTransform: 'uppercase'
                    }}
                />
                <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900 }}>-</Typography>
                <input 
                    type="text" 
                    placeholder="XXXX"
                    maxLength={4}
                    value={codeNumbers}
                    onChange={(e) => setCodeNumbers(e.target.value.replace(/[^0-9]/g, ''))} // Numbers only
                    style={{
                        flexGrow: 1, width: '12px', padding: '12px', borderRadius: '12px', border: '1px solid var(--color-glass-border)',
                        background: 'rgba(0, 0, 0, 0.3)', color: 'var(--color-text-main, #FFF)', 
                        fontSize: '1rem', outline: 'none', fontWeight: 900, letterSpacing: '4px', textAlign: 'center'
                    }}
                />
            </Box>

            {/* DYNAMIC ACTION BUTTON */}
            <Button 
                fullWidth 
                variant="contained" 
                onClick={handleConfirm}
                disabled={codeNumbers.length < 4}
                sx={{ 
                    placeContent: 'bottom', mt: 1, py: 1.5, borderRadius: '12px', fontWeight: 900, fontSize: '0.85rem',
                    color: 'var(--color-text-on-primary, #000)', background: 'var(--color-primary, #EF4444)',
                    '&:hover': { background: 'var(--color-primary, #EF4444)', filter: 'brightness(1.1)' },
                    '&.Mui-disabled': { background: 'var(--color-glass-white)', color: 'var(--color-text-muted)' }
                }}
            >
                {isExistingRoom ? 'JOIN ROOM' : 'CREATE ROOM'}
            </Button>
        </OverlayBase>
    );
}