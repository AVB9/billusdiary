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
        
        // 1. Gather ALL vowels and consonants present in the word
        const availableVowels = letters.filter(char => vowelsList.includes(char));
        const availableConsonants = letters.filter(char => !vowelsList.includes(char));
        
        // 2. Create a deterministic seed by adding up the ASCII values of the word.
        // This ensures the hint jumps around the word, but remains identical for 
        // every single player in the world on that specific day!
        const seed = letters.reduce((acc, char) => acc + char.charCodeAt(0), 0);
        
        // 3. Select a hint using modulo math (safely falling back to '' if none exist)
        const selectedVowel = availableVowels.length > 0 
            ? availableVowels[seed % availableVowels.length] 
            : '';
            
        const selectedConsonant = availableConsonants.length > 0 
            ? availableConsonants[seed % availableConsonants.length] 
            : '';
        
        setVowel(selectedVowel);
        setConsonant(selectedConsonant);
        
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