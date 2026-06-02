// src/widgets/wordle/overlays/UnderDevOverlay.jsx
import React from 'react';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box'; 
import OverlayBase from '@widgets/OverlayBase';

export default function UnderDevOverlay({ isOpen, onClose }) {
    return (
        <OverlayBase isOpen={isOpen} title="MEOOOWWWW 🐾" onClose={onClose}>
            {/* Main container to manage height */}
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%' 
            }}>
                {/* Anchored to the top */}
                <Typography 
                    variant="caption" 
                    sx={{ 
                        color: 'var(--color-text-muted)', 
                        lineHeight: 1.1, 
                        mb: 0.5, 
                        mt: 1, 
                        fontSize: '0.8rem', 
                        display: 'block', 
                        textAlign: 'left',
                        letterSpacing: '1px',
                        flexShrink: 0 
                    }}
                >
                    UNDER DEVELOPMENT
                </Typography>

                {/* Wrapper for the bottom text to center it in available space */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', // Centers vertically
                    alignItems: 'flex-start', // Keeps text aligned left
                    flexGrow: 1               // Takes up all remaining vertical space
                }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: 'var(--color-primary)', 
                            fontSize: '1.8rem', 
                            fontWeight: 900,
                            lineHeight: 1.2,
                            flexShrink: 0 
                        }}
                    >
                        GOOD THINGS TAKE TREATS!!
                    </Typography>
                </Box>
            </Box>
        </OverlayBase>
    );
}