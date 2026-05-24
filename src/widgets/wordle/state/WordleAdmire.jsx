// src/widgets/wordle/state/WordleAdmire.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function WordleAdmire({ engine }) {
    if (!engine) return null;

    const { guesses = [], targetWord = '' } = engine;
    const wordLength = 4;

    const getLetterStatus = (letter, index, isEvaluatedRow) => {
        if (!isEvaluatedRow || !letter || !targetWord) return 'unused';
        if (targetWord[index] === letter) return 'correct';
        if (targetWord.includes(letter)) return 'present';
        return 'absent';
    };

    const rows = Array.from({ length: 4 }).map((_, i) => {
        const rowStr = i < guesses.length ? guesses[i] : '';
        const letters = rowStr.padEnd(wordLength, ' ').split('');
        return { letters, isEvaluatedRow: i < guesses.length };
    });

    return (
        <Box sx={{ 
            display: 'flex', flexDirection: 'column', height: '100%', width: '100%', 
            justifyContent: 'space-between', pb: 0.5 
        }}>
            {/* THE SHRUNK GRID */}
            <Box sx={{ 
                flexGrow: 1, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', gap: '6px', minHeight: 0 
            }}>
                {rows.map((row, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: 'flex', gap: '6px', width: '100%', justifyContent: 'center' }}>
                        {row.letters.map((char, colIndex) => {
                            const status = getLetterStatus(char !== ' ' ? char : '', colIndex, row.isEvaluatedRow);
                            
                            let cellSx = {
                                width: '100%',
                                maxWidth: '36px',
                                aspectRatio: '1/1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                borderRadius: 'var(--rad-sm)', color: 'var(--color-text)',
                                background: 'transparent', border: '1px solid var(--color-glass-border)',
                                animation: 'fadeIn 0.4s ease backwards',
                                animationDelay: `${(rowIndex * 100) + (colIndex * 50)}ms` 
                            };

                            if (row.isEvaluatedRow) {
                                const colors = {
                                    correct: 'var(--color-wordle-correct, #538d4e)',
                                    present: 'var(--color-wordle-present, #b59f3b)',
                                    absent: 'var(--color-wordle-absent, #3a3a3c)'
                                };
                                const color = colors[status];
                                cellSx = { ...cellSx, background: color, border: `1px solid ${color}` };
                            } else if (char !== ' ') {
                                cellSx.border = '1px solid var(--color-text-muted)';
                            }

                            return (
                                <Box key={colIndex} sx={cellSx}>
                                    <Typography sx={{ fontWeight: 900, fontSize: '1.25rem', lineHeight: 1 }}>
                                        {char !== ' ' ? char : ''}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                ))}
            </Box>

            {/* THE MUSEUM PLAQUE */}
            <Box sx={{ 
                flexShrink: 0, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                background: 'var(--color-glass-white)',
                borderTop: '1px solid var(--color-glass-border)',
                borderRadius: 'var(--rad-sm)',
                p: 1, mx: 0.5,
                animation: 'fadeIn 0.5s ease backwards',
                animationDelay: '0.6s'
            }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--color-text)', flexShrink: 0 }}>
                    {targetWord}
                </Typography>
                
                {/* THE FIX: Locked to exactly 2 lines of height (2.8em), but naturally scrollable! */}
                <Typography sx={{ 
                    fontSize: '0.65rem', 
                    color: 'var(--color-text-muted)', 
                    textAlign: 'center', 
                    lineHeight: 1.4, 
                    mt: 0.5,
                    maxHeight: '2.8em', 
                    overflowY: 'auto',
                    pr: 0.5 
                }}>
                    A definition of the word goes here. This is a read-only snapshot of your victory or defeat. If you replace this placeholder with an incredibly long string of text, you will see that it now neatly scrolls inside this box without breaking the beautiful grid layout above it!
                </Typography>
            </Box>
        </Box>
    );
}