// src/widgets/wordle/state/RoomStats.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

export default function RoomStats({ onManageRoom }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 1.5, animation: 'fadeIn 0.3s ease' }}>
            
            {/* THE HEADER: 50/50 Split */}
            <Box sx={{ display: 'flex', gap: 1, px: 0.5, pt: 0.5 }}>
                {/* 50% Left: Room Dropdown */}
                <Box sx={{ 
                    flex: 1, background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'opacity 0.2s ease', '&:hover': { opacity: 0.8 }
                }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-text)', letterSpacing: '1px' }}>
                        ROOM ▾
                    </Typography>
                </Box>

                {/* 50% Right: Date Picker Placeholder */}
                <Box sx={{ 
                    flex: 1, background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '42px',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-text)', letterSpacing: '1px' }}>
                        TODAY ▾
                    </Typography>
                </Box>
            </Box>

            {/* THE LEADERBOARD: Placeholder */}
            <Box sx={{ 
                flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                border: '2px dashed var(--color-glass-border)', borderRadius: 'var(--rad-md)', mx: 0.5
            }}>
                <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Leaderboard Area
                </Typography>
            </Box>

            {/* THE FOOTER: Admin Routing */}
            <Box sx={{ px: 0.5, pb: 0.5 }}>
                <Button
                    fullWidth variant="outlined"
                    onClick={onManageRoom}
                    sx={{
                        py: 1, borderRadius: 'var(--rad-sm)', fontWeight: 900, fontSize: '0.75rem',
                        color: 'var(--color-text)', borderColor: 'var(--color-glass-border)',
                        '&:hover': { background: 'var(--color-glass-white)', borderColor: 'var(--color-text)' }
                    }}
                >
                    MANAGE ROOM
                </Button>
            </Box>
        </Box>
    );
}