// src/widgets/wordle/state/WordleBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

export default function WordleBoard({ engine, showKeyboard }) {
    const boardRef = useRef(null);
    const [isShaking, setIsShaking] = useState(false);
    const [isBoardActive, setIsBoardActive] = useState(true); 
    const wordLength = 4;

    if (!engine) return null;
    
    const { guesses = [], currentGuess = '', targetWord = '', onKeyPress, toastMessage, gameStatus } = engine;

    // THE FIX: Automatically hide keyboard if the game is over!
    const isKeyboardVisible = showKeyboard && gameStatus === 'playing';

    useEffect(() => {
        if (toastMessage) {
            setIsShaking(true);
            const timer = setTimeout(() => setIsShaking(false), 370); 
            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (boardRef.current && !boardRef.current.contains(e.target)) {
                setIsBoardActive(false); 
            } else {
                setIsBoardActive(true);  
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if (!isBoardActive) return;

            const activeTag = document.activeElement?.tagName?.toLowerCase();
            if (activeTag === 'input' || activeTag === 'textarea') return;

            if (e.ctrlKey || e.metaKey || e.altKey) return;

            if (e.key === 'Backspace' || e.key === ' ') {
                e.preventDefault(); 
            }

            onKeyPress?.(e.key);
        };

        window.addEventListener('keydown', handleGlobalKeyDown, { passive: false });
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [onKeyPress, isBoardActive]); 

    const getLetterStatus = (letter, index, isEvaluatedRow) => {
        if (!isEvaluatedRow || !letter || !targetWord) return 'unused';
        if (targetWord[index] === letter) return 'correct';
        if (targetWord.includes(letter)) return 'present';
        return 'absent';
    };

    const getKeyboardKeyStatus = (key) => {
        if (!guesses.length || !targetWord) return 'unused';
        let status = 'unused';
        for (const guess of guesses) {
            for (let i = 0; i < wordLength; i++) {
                if (guess[i] === key) {
                    if (targetWord[i] === key) return 'correct'; 
                    if (targetWord.includes(key) && status !== 'correct') status = 'present';
                    else if (status === 'unused') status = 'absent';
                }
            }
        }
        return status;
    };

    const rows = Array.from({ length: 4 }).map((_, i) => {
        let rowStr = '';
        let isEvaluatedRow = false;
        if (i < guesses.length) {
            rowStr = guesses[i];
            isEvaluatedRow = true;
        } else if (i === guesses.length) {
            rowStr = currentGuess;
        }
        const letters = rowStr.padEnd(wordLength, ' ').split('');
        return { letters, isEvaluatedRow };
    });

    return (
        <Box 
            ref={boardRef}
            sx={{ 
                display: 'flex', flexDirection: 'column', height: '100%', width: '100%', 
                justifyContent: 'space-between', pb: 0.5, outline: 'none' 
            }}
        >
            <Box sx={{ 
                flexGrow: 1, display: 'flex', flexDirection: 'column', 
                alignItems: 'center', justifyContent: 'center', 
                gap: isKeyboardVisible ? '4px' : '8px', 
                transition: 'gap 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                minHeight: 0 
            }}>
                {rows.map((row, rowIndex) => {
                    const isActiveRow = rowIndex === guesses.length;
                    const applyShake = isActiveRow && isShaking;

                    return (
                        <Box key={rowIndex} sx={{ 
                            display: 'flex', 
                            gap: isKeyboardVisible ? '4px' : '8px', 
                            transition: 'gap 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            width: '100%', justifyContent: 'center',
                            animation: applyShake ? 'shake 0.37s ease-in-out' : 'none',
                            '@keyframes shake': {
                                '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
                                '20%, 60%': { transform: 'translate3d(-4px, 0, 0)' },
                                '40%, 80%': { transform: 'translate3d(4px, 0, 0)' }
                            }
                        }}>
                            {row.letters.map((char, colIndex) => {
                                const status = getLetterStatus(char !== ' ' ? char : '', colIndex, row.isEvaluatedRow);
                                
                                let cellSx = {
                                    width: '100%',
                                    maxWidth: isKeyboardVisible ? '36px' : '52px', 
                                    aspectRatio: '1/1',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: 'var(--rad-sm)', color: 'var(--color-text)',
                                    background: 'transparent', 
                                    border: '1px solid var(--color-glass-border)',
                                    opacity: 1,
                                    transition: 'max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease, opacity 0.2s ease'
                                };

                                if (row.isEvaluatedRow) {
                                    const colors = {
                                        correct: 'var(--color-wordle-correct, #538d4e)',
                                        present: 'var(--color-wordle-present, #b59f3b)',
                                        absent: 'var(--color-wordle-absent, #3a3a3c)'
                                    };
                                    const color = colors[status];
                                    
                                    cellSx = {
                                        ...cellSx,
                                        border: '1px solid var(--color-text-muted)',
                                        animation: `flip_${status} 0.5s ease-in-out forwards`,
                                        animationDelay: `${colIndex * 150}ms`,
                                        [`@keyframes flip_${status}`]: {
                                            '0%': { transform: 'rotateX(0deg)', background: 'transparent', borderColor: 'var(--color-text-muted)' },
                                            '49.9%': { transform: 'rotateX(90deg)', background: 'transparent', borderColor: 'var(--color-text-muted)' },
                                            '50%': { transform: 'rotateX(90deg)', background: color, borderColor: color },
                                            '100%': { transform: 'rotateX(0deg)', background: color, borderColor: color }
                                        }
                                    };
                                } else if (char !== ' ') {
                                    cellSx.border = '1px solid var(--color-text-muted)';
                                } else if (gameStatus === 'playing' && isBoardActive && isActiveRow && colIndex === currentGuess.length) {
                                    cellSx.border = '1px solid var(--color-text-muted)';
                                    cellSx.opacity = 0.5;
                                }

                                return (
                                    <Box key={colIndex} sx={cellSx}>
                                        <Typography sx={{ 
                                            fontWeight: 900, 
                                            fontSize: isKeyboardVisible ? '1.25rem' : '1.75rem', 
                                            transition: 'font-size 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                                            lineHeight: 1,
                                            whiteSpace: 'nowrap'
                                        }}>
                                            {char !== ' ' ? char : ''}
                                        </Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    );
                })}
            </Box>

            <Box sx={{ 
                display: 'flex', flexDirection: 'column', gap: 0.5, flexShrink: 0, width: '100%', px: 0.5,
                maxHeight: isKeyboardVisible ? '100px' : '0px',
                opacity: isKeyboardVisible ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                pointerEvents: isKeyboardVisible ? 'auto' : 'none' 
            }}>
                {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                        {row.map(key => {
                            const status = getKeyboardKeyStatus(key);
                            let keyBg = 'var(--color-glass-white)';
                            if (status === 'correct') keyBg = 'var(--color-wordle-correct, #538d4e)';
                            else if (status === 'present') keyBg = 'var(--color-wordle-present, #b59f3b)';
                            else if (status === 'absent') keyBg = 'var(--color-wordle-absent, #3a3a3c)';

                            return (
                                <Box key={key} onClick={() => onKeyPress?.(key)}
                                    sx={{
                                        flex: key === 'ENTER' || key === 'BACK' ? 1.5 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        height: '24px', borderRadius: 'var(--rad-sm)',
                                        background: keyBg, border: '1px solid var(--color-glass-border)',
                                        cursor: 'pointer', userSelect: 'none',
                                        '&:active': { transform: 'scale(0.95)' }
                                    }}
                                >
                                    <Typography sx={{ fontSize: key === 'ENTER' || key === 'BACK' ? '0.55rem' : '0.75rem', fontWeight: 900, color: status === 'absent' ? 'var(--color-text-muted)' : 'var(--color-text)' }}>
                                        {key === 'BACK' ? '⌫' : key}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}