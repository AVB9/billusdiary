// src/widgets/wordle/overlays/AnswerOverlay.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import OverlayBase from '@widgets/OverlayBase';

export default function AnswerOverlay({ 
    isOpen, 
    onClose, 
    targetWord = '', 
    definition = '', // Added definition prop
    reason, 
    guessCount, 
    onGoHome, 
    onGoStats,
    isRevealed 
}) {
    
    const getMessage = () => {
        if (reason === 'revealed') return "Meow whyy🐾";
        if (reason === 'lost') return "Purrrhaps next time!";
        if (reason === 'won') {
            if (isRevealed) return "Hmmmm Smartie";
            if (guessCount === 1) return "Genius!!";
            if (guessCount === 4) return "Pheww!!";
            return "Well Done!!";
        }
        return "";
    };

    // 1. Extract message and evaluate length
    const message = getMessage();
    const isLongMessage = message.length > 12;

    const actionBar = (
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
            <Button 
                onClick={onGoHome}
                sx={{ 
                    flex: 4, background: 'var(--color-primary)', color: 'var(--color-text)',
                    borderRadius: 'var(--rad-sm)', fontWeight: 'bold', textTransform: 'none',
                    '&:hover': { background: 'var(--color-primary)' }
                }}
            >
                Home
            </Button>
            <Button 
                variant="outlined" 
                onClick={onGoStats}
                sx={{ 
                    flex: 1, aspectRatio: '1/1', minWidth: 0, p: 0, color: 'var(--color-text)', 
                    borderColor: 'var(--color-glass-border)', borderRadius: 'var(--rad-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                </svg>
            </Button>
        </Box>
    );

    return (
        <OverlayBase title="ANSWER" isOpen={isOpen} onClose={onClose} footerActions={actionBar}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, width: '100%' }}>
                
                <Typography sx={{ 
                    fontWeight: 'bold', 
                    // 2. THE FIX: Dynamically shrink the font if it's a long sentence
                    fontSize: isLongMessage ? 'clamp(0.9rem, 5vw, 1.1rem)' : 'clamp(1.1rem, 6vw, 1.3rem)', 
                    textAlign: 'center',
                    color: 'var(--color-text)',
                    lineHeight: 1.1,
                    textWrap: 'balance' // 3. THE FIX: Allows long sentences to wrap beautifully to a second line
                }}>
                    {message}
                </Typography>

                <Box sx={{ 
                    background: 'var(--color-glass-white)', 
                    border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-sm)', 
                    py: 0.5, px: 1, textAlign: 'center' 
                }}>
                    <Typography sx={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-text)', letterSpacing: '2px' }}>
                        {targetWord}
                    </Typography>
                </Box>

                <Typography sx={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--color-text-muted)', 
                    lineHeight: 1.4,
                    pb: 1
                }}>
                    {/* Replaced hardcoded text with dynamic definition */}
                    {definition ? `"${definition}"` : "Fetching definition..."}
                </Typography>
            </Box>
        </OverlayBase>
    );
}