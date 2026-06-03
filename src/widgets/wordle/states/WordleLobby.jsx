// src/widgets/wordle/states/WordleLobby.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import DatePicker from '@ui/DatePicker';
import { checkIfPlayed } from '../usewordleengine';

// Timezone-safe local formatter
const formatLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function WordleLobby({ onStartSolo, onAdmire, onJoinRoom, onManageRooms }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const dateStr = formatLocal(selectedDate);
    // FIX 2: Using the pure helper function instead of direct localStorage access!
    const isCompleted = checkIfPlayed(dateStr);

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