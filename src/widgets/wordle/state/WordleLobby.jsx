// src/widgets/wordle/state/WordleLobby.jsx
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DatePicker from '@ui/DatePicker';

export default function WordleLobby({ onStartSolo, onAdmire, onJoinRoom, onManageRooms }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isCompleted, setIsCompleted] = useState(false);

    useEffect(() => {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const key = `wordle_save_v1_${dateStr}`;
        const saved = localStorage.getItem(key);
        
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setIsCompleted(parsed.gameStatus === 'won' || parsed.gameStatus === 'lost');
            } catch (e) { 
                setIsCompleted(false); 
            }
        } else {
            setIsCompleted(false);
        }
    }, [selectedDate]);

    const dateStr = selectedDate.toISOString().split('T')[0];

    return (
        <Box sx={{ 
            display: 'flex', flexDirection: 'column', height: '100%', 
            justifyContent: 'center', alignItems: 'center',
            px: 1, textAlign: 'center', animation: 'fadeIn 0.3s ease'
        }}>
            
            <Typography sx={{ 
                fontWeight: 900, fontSize: '2.1rem', letterSpacing: '8px', 
                color: 'var(--color-text-main, #FFF)', mb: 4, lineHeight: 1
            }}>
                WORDL<span style={{ color: 'var(--color-primary, #EF4444)' }}>E</span>
            </Typography>

            <Stack spacing={2.5} sx={{ width: '100%', maxWidth: '240px', alignItems: 'center' }}>
                
                <DatePicker 
                    value={selectedDate} 
                    onChange={setSelectedDate} 
                    disableFuture={true} 
                />

                {/* THE MULTIPLAYER ROW: 50/50 Split */}
                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <Button 
                        variant="outlined" 
                        onClick={onJoinRoom}
                        sx={{ 
                            flex: 1, py: 1, borderRadius: 'var(--rad-sm)', fontWeight: 900, fontSize: '0.75rem',
                            color: 'var(--color-text-main, #FFF)', borderColor: 'var(--color-glass-border)',
                            '&:hover': { background: 'var(--color-glass-white)', borderColor: 'var(--color-text-main, #FFF)' }
                        }}
                    >
                        JOIN ROOM
                    </Button>
                    <Button 
                        variant="outlined" 
                        onClick={onManageRooms}
                        sx={{ 
                            flex: 1, py: 1, borderRadius: 'var(--rad-sm)', fontWeight: 900, fontSize: '0.75rem',
                            color: 'var(--color-text-main, #FFF)', borderColor: 'var(--color-glass-border)',
                            '&:hover': { background: 'var(--color-glass-white)', borderColor: 'var(--color-text-main, #FFF)' }
                        }}
                    >
                        MY ROOMS
                    </Button>
                </Box>

                {isCompleted ? (
                    <Button 
                        fullWidth variant="contained" 
                        onClick={() => onAdmire(dateStr)}
                        sx={{ 
                            py: 1.2, borderRadius: 'var(--rad-sm)', fontWeight: 900, fontSize: '0.85rem',
                            color: 'var(--color-bg)', background: 'var(--color-primary)',
                            boxShadow: 'none', '&:hover': { background: 'var(--color-primary)', filter: 'brightness(1.1)', boxShadow: 'none' }
                        }}
                    >
                        ADMIRE WORDLE
                    </Button>
                ) : (
                    <Button 
                        fullWidth variant="contained" 
                        onClick={() => onStartSolo(dateStr)}
                        sx={{ 
                            py: 1.2, borderRadius: 'var(--rad-sm)', fontWeight: 900, fontSize: '0.85rem',
                            color: 'var(--color-bg)', background: 'var(--color-primary)',
                            boxShadow: 'none', '&:hover': { background: 'var(--color-primary)', filter: 'brightness(1.1)', boxShadow: 'none' }
                        }}
                    >
                        PLAY WORDLE
                    </Button>
                )}

            </Stack>
        </Box>
    );
}