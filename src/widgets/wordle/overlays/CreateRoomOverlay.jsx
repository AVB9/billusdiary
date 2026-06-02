import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import OverlayBase from '@widgets/OverlayBase';

export default function CreateRoomOverlay({ isOpen, onClose }) {
    const [newRoomName, setNewRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = () => {
        setIsCreating(true);
        // Fake offline delay
        setTimeout(() => {
            alert(`[OFFLINE] Room "${newRoomName}" created!`);
            setNewRoomName('');
            setIsCreating(false);
            onClose();
        }, 600);
    };

    return (
        <OverlayBase isOpen={isOpen} title="CREATE SQUAD" onClose={onClose}>
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
                    disabled={isCreating || !newRoomName.trim()}
                    onClick={handleCreate}
                    sx={{ 
                        py: 1.5, borderRadius: '12px', fontWeight: 900, 
                        background: newRoomName.trim() ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)', 
                        color: newRoomName.trim() ? 'var(--color-bg)' : 'rgba(255,255,255,0.3)',
                        boxShadow: 'none', '&:hover': { boxShadow: 'none', filter: 'brightness(1.1)' }
                    }}
                >
                    {isCreating ? 'CREATING...' : 'CREATE ROOM'}
                </Button>
            </Box>
        </OverlayBase>
    );
}