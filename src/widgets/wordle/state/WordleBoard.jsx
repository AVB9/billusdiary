// src/widgets/wordle/WordleBoard.jsx
import React from 'react';
import Box from '@mui/material/Box';

const WORD_LENGTH = 4;
const MAX_GUESSES = 4;

export default function WordleBoard({ guesses, currentGuess, gameStatus }) {
    
    const getColorStyles = (status) => {
        switch (status) {
            case 'correct':
                return { bg: '#10B981', border: '#10B981' };
            case 'present':
                return { bg: '#F59E0B', border: '#F59E0B' };
            case 'absent':
                return { bg: '#374151', border: '#374151' };
            default:
                return { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.1)' };
        }
    };

    const renderRow = (guessObj, isCurrentRow, rowIndex) => {
        // Handle both historical guess objects and the current active string
        const word = typeof guessObj === 'string' ? guessObj : (guessObj?.word || "");
        const colors = guessObj?.colors || Array(4).fill(null);
        
        const letters = word.padEnd(WORD_LENGTH, " ").split('');
        
        return (
            <Box key={rowIndex} sx={{ display: 'flex', gap: 1, mb: 1, justifyContent: 'center' }}>
                {letters.map((char, i) => {
                    const hasLetter = char.trim() !== '';
                    const isEvaluated = colors[i] !== null;
                    const styles = getColorStyles(colors[i]);

                    return (
                        <Box 
                            key={i}
                            sx={{
                                width: '45px', 
                                height: '45px',
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                fontSize: '1.5rem', 
                                fontWeight: 800, 
                                textTransform: 'uppercase',
                                color: 'white',
                                backgroundColor: isEvaluated ? styles.bg : (hasLetter ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.02)'),
                                border: '2px solid',
                                borderColor: isEvaluated ? styles.border : (hasLetter ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.1)'),
                                borderRadius: '8px',
                                
                                // Hardware-accelerated animations
                                transition: 'transform 0.1s ease-out, background-color 0.3s ease, border-color 0.3s ease',
                                transform: hasLetter && isCurrentRow ? 'scale(1.05)' : 'scale(1)',
                                
                                // Flip animation for evaluated tiles
                                animation: isEvaluated ? `flipIn 0.5s ease forwards ${i * 0.1}s` : 'none',
                                opacity: isEvaluated ? 0 : 1
                            }}
                        >
                            {char}
                        </Box>
                    );
                })}
            </Box>
        );
    };

    return (
        <Box sx={{ 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            animation: 'fadeIn 0.3s ease'
        }}>
            {/* Historical Guesses */}
            {guesses.map((guess, i) => renderRow(guess, false, i))}
            
            {/* Active Input Row */}
            {gameStatus === "playing" && guesses.length < MAX_GUESSES && renderRow(currentGuess, true, guesses.length)}
            
            {/* Remaining Empty Rows */}
            {Array.from({ length: MAX_GUESSES - guesses.length - (gameStatus === "playing" ? 1 : 0) }).map((_, i) => 
                renderRow("", false, i + guesses.length + 1)
            )}

            {/* Global Keyframes for the Board */}
            <style>
                {`
                @keyframes flipIn {
                    0% { transform: rotateX(-90deg); opacity: 0; }
                    100% { transform: rotateX(0); opacity: 1; }
                }
                `}
            </style>
        </Box>
    );
}