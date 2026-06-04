import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import DatePicker from '@ui/DatePicker';
import { PrimaryButton, SecondaryButton } from '@ui/Button';
import { checkIfPlayed } from '../usewordleengine';

const formatLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function WordleLobby({ onStartSolo, onAdmire, onJoinRoom, onManageRooms }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const dateStr = formatLocal(selectedDate);
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
                    <SecondaryButton 
                        onClick={onJoinRoom}
                        sx={{ flex: 1, py: 1, fontSize: '0.75rem' }}
                    >
                        JOIN ROOM
                    </SecondaryButton>
                    
                    <SecondaryButton 
                        onClick={onManageRooms}
                        sx={{ flex: 1, py: 1, fontSize: '0.75rem' }}
                    >
                        MY ROOMS
                    </SecondaryButton>
                </Box>

                {isCompleted ? (
                    <PrimaryButton 
                        fullWidth 
                        onClick={() => onAdmire(dateStr)}
                        sx={{ py: 1.2, fontSize: '0.85rem' }}
                    >
                        ADMIRE WORDLE
                    </PrimaryButton>
                ) : (
                    <PrimaryButton 
                        fullWidth 
                        onClick={() => onStartSolo(dateStr)}
                        sx={{ py: 1.2, fontSize: '0.85rem' }}
                    >
                        PLAY WORDLE
                    </PrimaryButton>
                )}
            </Stack>
        </Box>
    );
}