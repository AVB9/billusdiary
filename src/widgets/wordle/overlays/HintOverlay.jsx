// src/widgets/wordle/overlays/HintOverlay.jsx
import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import OverlayBase from '@widgets/OverlayBase';

export default function HintOverlay({ isOpen, onClose, targetWord = '', onRevealAnswer }) {
    const [revealedVowel, setRevealedVowel] = useState(false);
    const [revealedConsonant, setRevealedConsonant] = useState(false);

    const [vowel, setVowel] = useState('');
    const [consonant, setConsonant] = useState('');

    useEffect(() => {
        if (!targetWord) return;
        
        const vowelsList = ['A', 'E', 'I', 'O', 'U'];
        const letters = targetWord.toUpperCase().split('');
        
        setVowel(letters.find(char => vowelsList.includes(char)) || '');
        setConsonant(letters.find(char => !vowelsList.includes(char)) || '');
        
        setRevealedVowel(false);
        setRevealedConsonant(false);
    }, [targetWord]);

    const handleRevealVowel = () => setRevealedVowel(true);
    const handleRevealConsonant = () => setRevealedConsonant(true);

    return (
        <OverlayBase title="HINT" isOpen={isOpen} onClose={onClose}>
            <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 2 }}>
                
                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box 
                        onClick={handleRevealVowel}
                        sx={{ 
                            aspectRatio: '1/1', 
                            border: '1px solid var(--color-glass-border)', 
                            borderRadius: 'var(--rad-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: revealedVowel ? 'default' : 'pointer',
                            animation: revealedVowel ? 'hintFlip 0.4s ease forwards' : 'none',
                            '@keyframes hintFlip': {
                                '0%': { transform: 'rotateX(0deg)' },
                                '50%': { transform: 'rotateX(90deg)' },
                                '100%': { transform: 'rotateX(0deg)' }
                            }
                        }}
                    >
                        <Typography sx={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: 'var(--color-text)',
                            opacity: revealedVowel ? 1 : 0,
                            transition: 'opacity 0.2s',
                            transitionDelay: '0.2s' 
                        }}>
                            {vowel}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 'bold' }}>
                        VOWEL
                    </Typography>
                </Box>

                <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box 
                        onClick={handleRevealConsonant}
                        sx={{ 
                            aspectRatio: '1/1', 
                            border: '1px solid var(--color-glass-border)', 
                            borderRadius: 'var(--rad-sm)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: revealedConsonant ? 'default' : 'pointer',
                            animation: revealedConsonant ? 'hintFlip 0.4s ease forwards' : 'none'
                        }}
                    >
                        <Typography sx={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: 'var(--color-text)',
                            opacity: revealedConsonant ? 1 : 0,
                            transition: 'opacity 0.2s',
                            transitionDelay: '0.2s'
                        }}>
                            {consonant}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', textAlign: 'center', fontWeight: 'bold' }}>
                        CONSONANT
                    </Typography>
                </Box>

            </Box>

            <Button 
                variant="outlined" 
                onClick={onRevealAnswer}
                sx={{ 
                    width: '100%', 
                    borderColor: 'var(--color-glass-border)', 
                    color: 'var(--color-text-muted)',
                    borderRadius: 'var(--rad-sm)',
                    textTransform: 'none'
                }}
            >
                Reveal Answer
            </Button>
        </OverlayBase>
    );
}