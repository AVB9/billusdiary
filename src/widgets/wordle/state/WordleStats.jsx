// src/widgets/wordle/state/WordleStats.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WordDatePicker from '../WordDatePicker';
import { getWordForDateStr, getSaveDataForDate, getGlobalWordleStats } from '../usewordleengine';

export default function WordleStats() {
    const [viewDate, setViewDate] = useState(new Date());

    const dateStr = viewDate.toISOString().split('T')[0];
    
    const realDataResolver = (dateLookupStr) => {
        const word = getWordForDateStr(dateLookupStr);
        const saveData = getSaveDataForDate(dateLookupStr);

        if (!saveData || saveData.gameStatus === 'playing') return { status: 'unplayed', word, guesses: 0 };
        
        let status = 'unplayed';
        if (saveData.isRevealed) status = 'revealed';
        else if (saveData.gameStatus === 'won') status = 'won';
        else if (saveData.gameStatus === 'lost') status = 'lost';

        return { status, word, guesses: saveData.guesses?.length || 0 };
    };

    const activeDayData = realDataResolver(dateStr);
    const globalStats = getGlobalWordleStats(); 

    let dailyStatText = '- / 4';
    let dailyStatColor = 'var(--color-text-muted)';
    
    if (activeDayData.status === 'won') {
        dailyStatText = `${activeDayData.guesses} / 4`;
        dailyStatColor = 'var(--color-primary)'; 
    } else if (activeDayData.status === 'lost') {
        dailyStatText = 'LOST';
        dailyStatColor = 'var(--color-text)'; 
    } else if (activeDayData.status === 'revealed') {
        dailyStatText = 'CHEATED';
        dailyStatColor = 'var(--color-text-muted)';
    }

    const StatBlock = ({ value, label }) => (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: 0.5 }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text)', lineHeight: 1 }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.5px' }}>
                {label}
            </Typography>
        </Box>
    );

    const maxDistribution = Math.max(...globalStats.distribution, 1);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 1, animation: 'fadeIn 0.3s ease' }}>
            
            {/* TOP ROW: Daily Score Card (Left) & WordDatePicker (Right) */}
            {/* THE FIX: Added gap: 1 to guarantee a buffer zone between the two elements */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5, pt: 0.5, gap: 1 }}>
                
                {/* THE FIX: Reverted to rectangle, reduced width to 90px to prevent collision */}
                <Box sx={{ 
                    background: 'var(--color-glass-white)', 
                    border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-sm)', 
                    width: '90px',       
                    height: '42px',       
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <Typography sx={{ fontSize: '1.1rem', fontWeight: 900, color: dailyStatColor, letterSpacing: '1px', lineHeight: 1 }}>
                        {dailyStatText}
                    </Typography>
                </Box>

                <WordDatePicker 
                    value={viewDate} 
                    onChange={setViewDate} 
                    disableFuture={true}
                    getWordForDate={realDataResolver}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflowY: 'auto', px: 0.5, pb: 0.5 }}>
                
                <Box sx={{ 
                    display: 'flex', justifyContent: 'center', width: '100%', 
                    py: 1, px: 1.5, 
                    background: 'var(--color-glass-white)', 
                    border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-md)',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    <StatBlock value={globalStats.played} label="Played" />
                    <StatBlock value={globalStats.winPercent} label="% Won" />
                    <StatBlock value={globalStats.maxStreak} label="Max Streak" />
                </Box>

                <Box sx={{ 
                    display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center', width: '100%', 
                    px: 1, py: 0.5 
                }}>
                    <Typography sx={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--color-text-muted)', textTransform: 'uppercase', mb: 1, letterSpacing: '1px' }}>
                        Guess Distribution
                    </Typography>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                        {globalStats.distribution.map((count, index) => {
                            const guessNum = index + 1;
                            const isCurrentDayMatch = activeDayData.status === 'won' && activeDayData.guesses === guessNum;
                            const barWidth = Math.max(8, (count / maxDistribution) * 100); 

                            return (
                                <Box key={guessNum} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: 'var(--color-text)', width: '8px', textAlign: 'center' }}>
                                        {guessNum}
                                    </Typography>
                                    
                                    <Box sx={{ flexGrow: 1, display: 'flex' }}>
                                        <Box sx={{ 
                                            width: `${barWidth}%`, 
                                            background: isCurrentDayMatch ? 'var(--color-primary)' : 'var(--color-glass-bg)', 
                                            border: '1px solid',
                                            borderColor: isCurrentDayMatch ? 'var(--color-primary)' : 'var(--color-glass-border)',
                                            display: 'flex', justifyContent: 'flex-end', alignItems: 'center', 
                                            px: 1, py: 0.25, borderRadius: 'var(--rad-sm)',
                                            transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s'
                                        }}>
                                            <Typography sx={{ 
                                                fontSize: '0.7rem', fontWeight: 900, lineHeight: 1,
                                                color: isCurrentDayMatch ? 'var(--color-bg)' : 'var(--color-text)' 
                                            }}>
                                                {count}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
                
            </Box>
        </Box>
    );
}