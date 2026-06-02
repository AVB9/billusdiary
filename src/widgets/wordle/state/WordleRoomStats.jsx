// src/widgets/wordle/state/WordleRoomStats.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import WordDatePicker from '../WordDatePicker';
import { getWordForDateStr, getSaveDataForDate, getLocalYYYYMMDD } from '../usewordleengine';

export default function WordleRoomStats({ onManageRoom, onOpenRoomSelect }) {
    const [viewDateStr, setViewDateStr] = useState(getLocalYYYYMMDD());

    // Mock Data - To be replaced by Firebase Global Context
    const activeRoomName = "PEAKY BLINDERS";
    const mockLeaderboard = [
        { id: 2, name: 'Marcos', score: 3 },
        { id: 1, name: 'Billu (You)', score: 4 },
        { id: 3, name: 'Alex', score: null }, 
        { id: 4, name: 'Sarah', score: 6 },   
        { id: 5, name: 'John', score: 2 },
    ].sort((a, b) => {
        if (a.score === null) return 1;
        if (b.score === null) return -1;
        return a.score - b.score;
    });

    const realDataResolver = (dateLookupStr) => {
        const word = getWordForDateStr(dateLookupStr);
        const saveData = getSaveDataForDate(dateLookupStr);
        if (!saveData || saveData.gameStatus === 'playing') return { status: 'unplayed', word, guesses: 0 };
        return { status: saveData.isRevealed ? 'revealed' : saveData.gameStatus, word, guesses: saveData.guesses?.length || 0 };
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 1, animation: 'fadeIn 0.3s ease' }}>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 0.5, pt: 0.5, gap: 1 }}>
                <Box 
                    onClick={onOpenRoomSelect}
                    sx={{ 
                        flex: 1, 
                        height: '42px', 
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5,
                        background: 'transparent',
                        borderRadius: 'var(--rad-sm)',
                        cursor: 'pointer', transition: 'opacity 0.2s ease', 
                        '&:hover': { opacity: 0.6 },
                        overflow: 'hidden', whiteSpace: 'nowrap'
                    }}
                >
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {activeRoomName}
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
                        ▾
                    </Typography>
                </Box>

                <WordDatePicker 
                    value={viewDateStr} 
                    onChange={setViewDateStr} 
                    disableFuture={true}
                    getWordForDate={realDataResolver}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flexGrow: 1, overflowY: 'auto', px: 0.5, pb: 0.5 }}>
                
                <Box sx={{ 
                    flexGrow: 1, display: 'flex', flexDirection: 'column', 
                    background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-md)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden'
                }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75, borderBottom: '1px solid var(--color-glass-border)', background: 'rgba(0,0,0,0.2)' }}>
                        <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>PLAYERS</Typography>
                        <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>SCORE</Typography>
                    </Box>

                    <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                        {mockLeaderboard.map((player, idx) => {
                            let scoreText = '- / 4';
                            let scoreColor = 'var(--color-text-muted)';
                            
                            if (player.score !== null) {
                                if (player.score > 4) {
                                    scoreText = 'LOST';
                                    scoreColor = 'var(--color-text)';
                                } else {
                                    scoreText = `${player.score} / 4`;
                                    scoreColor = 'var(--color-primary)';
                                }
                            }

                            return (
                                <Box key={player.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1, borderBottom: idx !== mockLeaderboard.length - 1 ? '1px solid var(--color-glass-border)' : 'none' }}>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: player.name.includes('(You)') ? 900 : 600, color: 'var(--color-text)' }}>
                                        {player.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 900, color: scoreColor }}>
                                        {scoreText}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                </Box>

                <Button
                    fullWidth variant="outlined"
                    onClick={onManageRoom}
                    sx={{
                        py: 0.75, borderRadius: 'var(--rad-sm)', fontWeight: 900, fontSize: '0.7rem', flexShrink: 0,
                        color: 'var(--color-text)', borderColor: 'var(--color-glass-border)',
                        '&:hover': { background: 'var(--color-glass-white)', borderColor: 'var(--color-text)' }
                    }}
                >
                    MANAGE ROOM
                </Button>
            </Box>
        </Box>
    );
}