// src/widgets/wordle/states/WordleBoard.jsx
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

export default function WordleBoard({ guesses = [], currentGuess = '', targetWord = '', onKeyPress, shakeTrigger = 0, isValidating = false, gameStatus, showKeyboard }) {
    const boardRef = useRef(null);
    const hiddenInputRef = useRef(null);
    const [isBoardActive, setIsBoardActive] = useState(false); 
    const [isShaking, setIsShaking] = useState(false); 
    
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
        if (e.key === 'Backspace' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); }
        if (/^[a-zA-Z]$/.test(e.key) || e.key === 'Enter' || e.key === 'Backspace') {
            e.stopPropagation(); onKeyPress?.(e.key);
        }
    };

    const handleInput = (e) => {
        const val = e.target.value.toUpperCase();
        const lastChar = val.charAt(val.length - 1);
        if (/^[A-Z]$/.test(lastChar)) onKeyPress?.(lastChar);
        e.target.value = ' ';
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Enter') {
            e.preventDefault(); e.stopPropagation(); onKeyPress?.(e.key);
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
        if (i < guesses.length) { rowStr = guesses[i]; isEvaluatedRow = true; } 
        else if (i === guesses.length) { rowStr = currentGuess; }
        return { letters: rowStr.padEnd(GAME_CONFIG.WORD_LENGTH, ' ').split(''), isEvaluatedRow };
    });

    return (
        <Box 
            ref={boardRef} tabIndex={0}
            onClick={handleBoardClick} onKeyDown={handleBoxKeyDown}
            onFocus={() => setIsBoardActive(true)} onBlur={() => setIsBoardActive(false)}
            sx={{ 
                display: 'flex', flexDirection: 'column', height: '100%', width: '100%', 
                justifyContent: 'space-between', pb: 0.5, outline: 'none', position: 'relative', 
                cursor: 'text', containerType: 'inline-size'
            }}
        >
            <input 
                ref={hiddenInputRef} type="text" autoComplete="off" autoCorrect="off" 
                autoCapitalize="characters" spellCheck="false" defaultValue=" " 
                onInput={handleInput} onKeyDown={handleInputKeyDown}
                onBlur={() => setIsBoardActive(false)} onFocus={() => setIsBoardActive(true)}
                style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: '1px', height: '1px', top: 0, left: 0 }}
            />

            {/* 4x4 SCALING GRID */}
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                minHeight: 0,
                width: '100%'
            }}>
                <Box sx={{
                    display: 'grid',
                    gridTemplateRows: 'repeat(4, 1fr)',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '5px',
                    height: '100%',
                    maxHeight: '100%',
                    aspectRatio: '1/1'
                }}>
                    {rows.map((row, rowIndex) => {
                        const isActiveRow = rowIndex === guesses.length;
                        const applyShake = isActiveRow && isShaking;
                        const rowClass = applyShake ? (shakeTrigger % 2 === 0 ? 'wordle-shake-a' : 'wordle-shake-b') : '';

                        return row.letters.map((char, colIndex) => {
                            const status = getLetterStatus(char !== ' ' ? char : '', colIndex, targetWord, row.isEvaluatedRow);
                            const animationClass = row.isEvaluatedRow ? `cell-flip-${status}` : '';
                            
                            return (
                                <Box key={`${rowIndex}-${colIndex}`} className={`${rowClass} ${animationClass}`} sx={{ 
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    borderRadius: '6px', color: 'var(--color-text)',
                                    border: '1px solid var(--color-glass-border)',
                                    opacity: (isActiveRow && colIndex === currentGuess.length) ? 0.5 : 1,
                                    animationDelay: `${colIndex * 150}ms`,
                                    transition: 'all 0.2s ease',
                                    ...(char !== ' ' && !row.isEvaluatedRow && { border: '1px solid var(--color-text-muted)' })
                                }}>
                                    <Typography sx={{ 
                                        fontWeight: 900, lineHeight: 1, 
                                        fontSize: 'clamp(1rem, 6cqmin, 2rem)' 
                                    }}>
                                        {char !== ' ' ? char : ''}
                                    </Typography>
                                </Box>
                            );
                        });
                    })}
                </Box>
            </Box>

            {/* RESTORED KEYBOARD */}
            <Box sx={{ 
                display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', px: 0.5,
                mt: isKeyboardVisible ? 1 : 0, flexShrink: 0, 
                maxHeight: isKeyboardVisible ? '120px' : '0px',
                opacity: isKeyboardVisible ? 1 : 0, overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                pointerEvents: isKeyboardVisible ? 'auto' : 'none' 
            }}>
                {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                        {row.map(key => {
                            const status = getKeyboardKeyStatus(key);
                            const isEnterKey = key === 'ENTER';
                            const showLoader = isEnterKey && isValidating;

                            let keyBg = 'var(--color-glass-white)';
                            if (status === 'correct') keyBg = 'var(--color-wordle-correct)';
                            else if (status === 'present') keyBg = 'var(--color-wordle-present)';
                            else if (status === 'absent') keyBg = 'var(--color-wordle-absent)';

                            return (
                                <Box key={key} role="button" aria-label={key === 'BACK' ? 'Backspace' : key}
                                    onClick={(e) => { e.stopPropagation(); onKeyPress?.(key); }}
                                    sx={{
                                        flex: key === 'ENTER' || key === 'BACK' ? 1.5 : 1,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        height: 'clamp(20px, 8cqmin, 28px)', 
                                        borderRadius: '4px', background: keyBg, 
                                        border: '1px solid var(--color-glass-border)',
                                        cursor: showLoader ? 'wait' : 'pointer', userSelect: 'none',
                                        opacity: showLoader ? 0.6 : 1, transition: 'all 0.1s',
                                        
                                        '&:active': { transform: showLoader ? 'none' : 'scale(0.92)' },
                                        '@media (hover: hover) and (pointer: fine)': {
                                            '&:hover': { filter: 'brightness(1.2)' }
                                        }
                                    }}
                                >
                                    <Typography sx={{ 
                                        fontWeight: 900, 
                                        fontSize: key === 'ENTER' || key === 'BACK' ? 'clamp(0.5rem, 2cqmin, 0.65rem)' : 'clamp(0.7rem, 3cqmin, 0.9rem)',
                                        color: status === 'absent' ? 'var(--color-text-muted)' : 'var(--color-text)' 
                                    }}>
                                        {key === 'BACK' ? '⌫' : (showLoader ? '...' : key)}
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