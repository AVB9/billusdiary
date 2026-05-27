import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import WordDatePicker from '../WordDatePicker';
import { getWordForDateStr, getSaveDataForDate } from '../usewordleengine';

export default function WordleRoomStats({ onManageRoom }) {
    const [viewDate, setViewDate] = useState(new Date());

    // Mock Data - To be replaced by Firebase Global Context
    const activeRoomName = "PEAKY BLINDERS";
    const mockLeaderboard = [
        { id: 2, name: 'Marcos', score: 3 },
        { id: 1, name: 'Billu (You)', score: 4 },
        { id: 3, name: 'Alex', score: null }, // Unplayed
        { id: 4, name: 'Sarah', score: 6 },   // Lost
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
            
            {/* THE HEADER: 50/50 Split */}
            <Box sx={{ display: 'flex', gap: 1, px: 0.5, pt: 0.5, alignItems: 'center' }}>
                {/* 50% Left: Room Dropdown */}
                <Box sx={{ 
                    flex: 1, background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', 
                    borderRadius: '50px', display: 'flex', alignItems: 'center', px: 1.5, height: '36px',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'opacity 0.2s ease', 
                    '&:hover': { opacity: 0.8 }, overflow: 'hidden', whiteSpace: 'nowrap'
                }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.65rem', color: 'var(--color-text)', letterSpacing: '1px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {activeRoomName} ▾
                    </Typography>
                </Box>

                {/* 50% Right: Date Picker */}
                <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', transform: 'scale(0.85)', transformOrigin: 'right center' }}>
                    <WordDatePicker 
                        value={viewDate} 
                        onChange={setViewDate} 
                        disableFuture={true}
                        getWordForDate={realDataResolver}
                    />
                </Box>
            </Box>

            {/* THE LEADERBOARD */}
            <Box sx={{ 
                flexGrow: 1, display: 'flex', flexDirection: 'column', 
                border: '1px solid var(--color-glass-border)', borderRadius: 'var(--rad-md)', 
                mx: 0.5, background: 'var(--color-glass-bg)', overflow: 'hidden'
            }}>
                {/* Table Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75, borderBottom: '1px solid var(--color-glass-border)', background: 'var(--color-glass-white)' }}>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>PLAYERS</Typography>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>SCORE</Typography>
                </Box>

                {/* Table Body (Scrollable) */}
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
                            <Box key={player.id} sx={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                px: 1.5, py: 0.75, borderBottom: idx !== mockLeaderboard.length - 1 ? '1px solid var(--color-glass-border)' : 'none' 
                            }}>
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

            {/* THE FOOTER */}
            <Box sx={{ px: 0.5, pb: 0.5 }}>
                <Button
                    fullWidth variant="outlined"
                    onClick={onManageRoom}
                    sx={{
                        py: 0.5, borderRadius: 'var(--rad-sm)', fontWeight: 900, fontSize: '0.7rem',
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