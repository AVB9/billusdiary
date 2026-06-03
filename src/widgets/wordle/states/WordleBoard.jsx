// src/widgets/wordle/state/WordleBoard.jsx
import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { GAME_CONFIG, getLetterStatus } from '../usewordleengine';
import '../style.css'; 

const KEYBOARD_ROWS = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK']
];

export default function WordleBoard({ guesses = [], currentGuess = '', targetWord = '', onKeyPress, shakeTrigger = 0, gameStatus, showKeyboard }) {
    const boardRef = useRef(null);
    const hiddenInputRef = useRef(null);
    const [isBoardActive, setIsBoardActive] = useState(false); 
    const [isShaking, setIsShaking] = useState(false); 
    
    // FIX 1: Strict-Mode immune mount guard. 
    // We store the numeric value it mounts with, and ONLY shake if the number actually increases.
    const prevShakeRef = useRef(shakeTrigger);

    const isKeyboardVisible = showKeyboard && gameStatus === 'playing';

    useEffect(() => {
        if (shakeTrigger > prevShakeRef.current) {
            setIsShaking(true);
            prevShakeRef.current = shakeTrigger;
            const timer = setTimeout(() => setIsShaking(false), 400);
            return () => clearTimeout(timer);
        }
    }, [shakeTrigger]);

    const handleBoardClick = () => {
        if (gameStatus === 'playing') {
            hiddenInputRef.current?.focus();
            setIsBoardActive(true);
        }
    };

    const handleBoxKeyDown = (e) => {
        if (document.activeElement === hiddenInputRef.current) return; 
        if (!isBoardActive) return;
        
        const activeTag = document.activeElement?.tagName?.toLowerCase();
        if (activeTag === 'input' || activeTag === 'textarea') return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        if (e.key === 'Backspace' || e.key === ' ') {
            e.preventDefault(); 
        }

        if (/^[a-zA-Z]$/.test(e.key) || e.key === 'Enter' || e.key === 'Backspace') {
            e.stopPropagation(); // Stop Bubbling
            onKeyPress?.(e.key);
        }
    };

    const handleInput = (e) => {
        const val = e.target.value.toUpperCase();
        const lastChar = val.charAt(val.length - 1);
        if (/^[A-Z]$/.test(lastChar)) {
            onKeyPress?.(lastChar);
        }
        e.target.value = ' ';
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation(); // FIX 2: Stop bubbling so the parent Box doesn't double-fire!
            onKeyPress?.(e.key);
        }
    };

    const getKeyboardKeyStatus = (key) => {
        if (!guesses.length || !targetWord) return 'unused';
        let status = 'unused';
        for (const guess of guesses) {
            for (let i = 0; i < GAME_CONFIG.WORD_LENGTH; i++) {
                if (guess[i] === key) {
                    if (targetWord[i] === key) return 'correct'; 
                    if (targetWord.includes(key) && status !== 'correct') status = 'present';
                    else if (status === 'unused') status = 'absent';
                }
            }
        }
        return status;
    };

    const rows = Array.from({ length: GAME_CONFIG.MAX_GUESSES }).map((_, i) => {
        let rowStr = '';
        let isEvaluatedRow = false;
        if (i < guesses.length) {
            rowStr = guesses[i];
            isEvaluatedRow = true;
        } else if (i === guesses.length) {
            rowStr = currentGuess;
        }
        const letters = rowStr.padEnd(GAME_CONFIG.WORD_LENGTH, ' ').split('');
        return { letters, isEvaluatedRow };
    });

    return (
        <Box 
            ref={boardRef}
            tabIndex={0}
            onClick={handleBoardClick}
            onKeyDown={handleBoxKeyDown}
            onFocus={() => setIsBoardActive(true)}
            onBlur={() => setIsBoardActive(false)}
            sx={{ 
                display: 'flex', flexDirection: 'column', height: '100%', width: '100%', 
                justifyContent: 'space-between', pb: 0.5, outline: 'none',
                position: 'relative', cursor: 'text'
            }}
        >
            <input 
                ref={hiddenInputRef}
                type="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="characters"
                spellCheck="false"
                defaultValue=" " 
                onInput={handleInput}
                onKeyDown={handleInputKeyDown}
                onBlur={() => setIsBoardActive(false)}
                onFocus={() => setIsBoardActive(true)}
                style={{ 
                    position: 'absolute', opacity: 0, 
                    pointerEvents: 'none', width: '1px', height: '1px', 
                    top: 0, left: 0 
                }}
            />

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
                    
                    let rowClass = '';
                    if (applyShake) {
                        rowClass = shakeTrigger % 2 === 0 ? 'wordle-shake-a' : 'wordle-shake-b';
                    }

                    return (
                        <Box 
                            key={rowIndex} 
                            className={rowClass}
                            sx={{ 
                                display: 'flex', 
                                gap: isKeyboardVisible ? '4px' : '8px', 
                                transition: 'gap 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                width: '100%', 
                                justifyContent: 'center'
                            }}
                        >
                            {row.letters.map((char, colIndex) => {
                                const status = getLetterStatus(char !== ' ' ? char : '', colIndex, targetWord, row.isEvaluatedRow);
                               
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
                                <Box key={key} onClick={(e) => { e.stopPropagation(); onKeyPress?.(key); }}
                                    role="button"
                                    aria-label={key === 'BACK' ? 'Backspace' : key}
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