// src/widgets/wordle/states/WordleLobby.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import DatePicker from '@ui/DatePicker';
import { PrimaryButton, SecondaryButton } from '@components/ui/Button';
import { checkIfPlayed } from '../usewordleengine';

const formatLocal = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// ============================================================================
// STYLES CONFIGURATION (Abstracted for clean JSX)
// ============================================================================
const styles = {
    container: {
        display: 'flex', flexDirection: 'column', height: '100%', width: '100%',
        alignItems: 'center', textAlign: 'center', animation: 'fadeIn 0.3s ease',
        px: 'clamp(12px, 4cqw, 20px)', 
        pt: 'clamp(16px, 5cqmin, 24px)', 
        pb: 'clamp(12px, 4cqmin, 20px)'
    },
    title: {
        fontWeight: 900, lineHeight: 1,
        color: 'var(--color-text-main, #FFF)', 
        fontSize: 'clamp(1.6rem, 14cqmin, 2.8rem)', 
        letterSpacing: 'clamp(4px, 4cqmin, 12px)'
    },
    bodySpring: {
        flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        width: '100%', minHeight: '30px'
    },
    footerStack: {
        width: '100%', maxWidth: '360px', alignItems: 'center'
    },
    secondaryBtn: {
        flex: 1, py: '9px', fontSize: 'clamp(0.75rem, 4cqmin, 0.9rem)'
    },
    primaryBtn: {
        py: '10px', fontSize: 'clamp(0.85rem, 4.5cqmin, 1rem)'
    }
};

// ============================================================================
// COMPONENT
// ============================================================================
export default function WordleLobby({ onStartSolo, onAdmire, onJoinRoom, onManageRooms }) {
    const [selectedDate, setSelectedDate] = useState(new Date());
    
    const dateStr = formatLocal(selectedDate);
    const isCompleted = checkIfPlayed(dateStr);

    return (
        <Box sx={styles.container}>
            
            <Typography sx={styles.title}>
                WORDL<span style={{ color: 'var(--color-primary, #EF4444)' }}>E</span>
            </Typography>

            <Box sx={styles.bodySpring}>
                <DatePicker 
                    value={selectedDate} 
                    onChange={setSelectedDate} 
                    disableFuture={true} 
                />
            </Box>

            <Stack spacing={'clamp(8px, 3cqmin, 14px)'} sx={styles.footerStack}>
                
                <Box sx={{ display: 'flex', gap: '8px', width: '100%' }}>
                    <SecondaryButton onClick={onJoinRoom} sx={styles.secondaryBtn}>
                        JOIN ROOM
                    </SecondaryButton>
                    
                    <SecondaryButton onClick={onManageRooms} sx={styles.secondaryBtn}>
                        MY ROOMS
                    </SecondaryButton>
                </Box>

                {isCompleted ? (
                    <PrimaryButton fullWidth onClick={() => onAdmire(dateStr)} sx={styles.primaryBtn}>
                        ADMIRE WORDLE
                    </PrimaryButton>
                ) : (
                    <PrimaryButton fullWidth onClick={() => onStartSolo(dateStr)} sx={styles.primaryBtn}>
                        PLAY WORDLE
                    </PrimaryButton>
                )}
            </Stack>
        </Box>
    );
}