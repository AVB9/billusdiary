// src/widgets/wordle/WordleLobby.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import PillTray from '@ui/PillTray';
import Pill from '@ui/Pill';
import DatePicker from '@ui/DatePicker';

export default function WordleLobby({ onStartSolo, onOpenRoomOverlay }) {
    const [mode, setMode] = useState('single'); 
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleAction = () => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        if (mode === 'single') {
            onStartSolo(dateStr);
        } else {
            onOpenRoomOverlay(dateStr);
        }
    };

    return (
        <Box sx={{ 
            display: 'flex', flexDirection: 'column', height: '100%', 
            justifyContent: 'center', alignItems: 'center',
            px: 1, py: 0, textAlign: 'center', animation: 'fadeIn 0.3s ease'
        }}>
            
            {/* GIANT WORDLE TEXT */}
            <Typography sx={{ 
                fontWeight: 900, fontSize: '2.5rem', letterSpacing: '8px', 
                color: 'var(--color-text-main, #FFF)', mb: 3 
            }}>
                WORDL<span style={{ color: 'var(--color-primary, #EF4444)' }}>E</span>
            </Typography>

            <Stack spacing={2.5} sx={{ width: '100%', maxWidth: '280px', alignItems: 'center' }}>
                
                {/* DATE PICKER PILL */}
                <DatePicker 
                    value={selectedDate} 
                    onChange={setSelectedDate} 
                    disableFuture={true} 
                />

                {/* MODE SELECTOR */}
                <Box sx={{ transform: 'scale(0.95)', width: '100%' }}>
                    <PillTray layout="brick">
                        <Pill label="Single Player" isActive={mode === 'single'} onClick={() => setMode('single')} />
                        <Pill label="Multiplayer" isActive={mode === 'multi'} onClick={() => setMode('multi')} />
                    </PillTray>
                </Box>

                {/* ACTION BUTTON */}
                <Button 
                    fullWidth 
                    variant="contained" 
                    onClick={handleAction}
                    sx={{ 
                        py: 1.5, borderRadius: '12px', fontWeight: 900, fontSize: '0.85rem',
                        color: 'var(--color-text-on-primary, #000)', background: 'var(--color-primary, #EF4444)',
                        '&:hover': { background: 'var(--color-primary, #EF4444)', filter: 'brightness(1.1)' }
                    }}
                >
                    {mode === 'single' ? 'START GAME' : 'JOIN ROOM'}
                </Button>
            </Stack>
        </Box>
    );
}