// src/widgets/wordle/state/WordleAdmire.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GAME_CONFIG, getLetterStatus } from '../usewordleengine';

export default function WordleAdmire({ guesses = [], targetWord = '', definition = '' }) {
    if (!targetWord) return null;

    const rows = Array.from({ length: GAME_CONFIG.MAX_GUESSES }).map((_, i) => {
        const rowStr = i < guesses.length ? guesses[i] : '';
        const letters = rowStr.padEnd(GAME_CONFIG.WORD_LENGTH, ' ').split('');
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
                            const status = getLetterStatus(char !== ' ' ? char : '', colIndex, targetWord, row.isEvaluatedRow);
                           
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
                p: 1.5, mx: 0.5,
                animation: 'fadeIn 0.5s ease backwards',
                animationDelay: '0.6s'
            }}>
                <Typography sx={{ fontSize: '1.2rem', fontWeight: 900, letterSpacing: '2px', color: 'var(--color-text)', flexShrink: 0 }}>
                    {targetWord}
                </Typography>
               
                <Typography sx={{ 
                    fontSize: '0.75rem', 
                    color: 'var(--color-text)', 
                    fontStyle: 'italic',
                    textAlign: 'center', 
                    lineHeight: 1.4, 
                    mt: 0.5,
                    maxHeight: '3.2em', 
                    overflowY: 'auto',
                    pr: 0.5 
                }}>
                    "{definition}"
                </Typography>
            </Box>
        </Box>
    );
}