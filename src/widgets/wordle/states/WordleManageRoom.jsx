import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as Icons from '@ui/Icons';

export default function WordleManageRoom({ onOpenEdit, onOpenInvite }) {
    
    // Mock Data - To be replaced by Firebase Global Context
    const activeRoomName = "PEAKY BLINDERS";
    const viewerRole = 'owner'; // 'owner' | 'mod' | 'member'
    
    const mockMembers = [
        { id: 1, name: 'Marcos (You)', role: 'owner' },
        { id: 2, name: 'Billu', role: 'mod' },
        { id: 3, name: 'Alex', role: 'member' },
        { id: 4, name: 'Sarah', role: 'member' },
        { id: 5, name: 'Sarah', role: 'member' },
        { id: 6, name: 'Sarah', role: 'member' },
        { id: 7, name: 'Sarah', role: 'member' },
        { id: 8, name: 'Sarah', role: 'member' },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 1, animation: 'fadeIn 0.3s ease' }}>
            
            {/* THE HEADER: 70/15/15 Split */}
            <Box sx={{ display: 'flex', gap: 1, px: 0.5, pt: 0.5 }}>
                
                {/* 70% Left: Room Dropdown */}
                <Box sx={{ 
                    flexGrow: 1, background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-sm)', display: 'flex', alignItems: 'center', px: 1.5, height: '36px',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'opacity 0.2s ease', 
                    '&:hover': { opacity: 0.8 }, overflow: 'hidden', whiteSpace: 'nowrap'
                }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.65rem', color: 'var(--color-text)', letterSpacing: '1px', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                        {activeRoomName} ▾
                    </Typography>
                </Box>

                {/* 15% Middle: Edit Icon (Locked to Owner) */}
                <Box onClick={viewerRole === 'owner' ? onOpenEdit : null} sx={{ 
                    width: '36px', height: '36px', flexShrink: 0, 
                    background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--rad-sm)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: viewerRole === 'owner' ? 'pointer' : 'not-allowed', 
                    opacity: viewerRole === 'owner' ? 1 : 0.3,
                    color: 'var(--color-text-muted)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease',
                    '&:hover': viewerRole === 'owner' ? { color: 'var(--color-text)', background: 'var(--color-glass-bg)' } : {}
                }}>
                    <Box sx={{ transform: 'scale(0.85)' }}><Icons.Edit /></Box>
                </Box>

                {/* 15% Right: Invite Icon (Locked to Owner) */}
                <Box onClick={viewerRole === 'owner' ? onOpenInvite : null} sx={{ 
                    width: '36px', height: '36px', flexShrink: 0, 
                    background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--rad-sm)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    cursor: viewerRole === 'owner' ? 'pointer' : 'not-allowed', 
                    opacity: viewerRole === 'owner' ? 1 : 0.3,
                    color: 'var(--color-text-muted)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease',
                    '&:hover': viewerRole === 'owner' ? { color: 'var(--color-text)', background: 'var(--color-glass-bg)' } : {}
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                </Box>
            </Box>

            {/* THE PERMISSIONS TABLE */}
            <Box sx={{ 
                flexGrow: 1, display: 'flex', flexDirection: 'column', 
                border: '1px solid var(--color-glass-border)', borderRadius: 'var(--rad-md)', 
                mx: 0.5, mb: 0.5, background: 'var(--color-glass-bg)', overflow: 'hidden'
            }}>
                {/* Table Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75, borderBottom: '1px solid var(--color-glass-border)', background: 'var(--color-glass-white)' }}>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>PLAYERS ({mockMembers.length}/20)</Typography>
                    <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>ACTIONS</Typography>
                </Box>

                {/* Table Body (Scrollable) */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                    {mockMembers.map((player, idx) => {
                        const isSelf = player.name.includes('(You)');
                        
                        return (
                            <Box key={player.id} sx={{ 
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                                px: 1.5, py: 0.75, borderBottom: idx !== mockMembers.length - 1 ? '1px solid var(--color-glass-border)' : 'none' 
                            }}>
                                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                    <Typography sx={{ fontSize: '0.75rem', fontWeight: isSelf ? 900 : 600, color: 'var(--color-text)', lineHeight: 1.1 }}>
                                        {player.name}
                                    </Typography>
                                    <Typography sx={{ fontSize: '0.5rem', fontWeight: 800, color: player.role === 'owner' ? 'var(--color-primary)' : 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                                        {player.role}
                                    </Typography>
                                </Box>
                                
                                {/* Action Buttons Logic based on viewerRole */}
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    {isSelf ? (
                                        <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-primary)', cursor: 'pointer' }}>LEAVE</Typography>
                                    ) : (
                                        <>
                                            {viewerRole === 'owner' && player.role !== 'owner' && (
                                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-muted)', cursor: 'pointer', '&:hover': { color: 'var(--color-text)' } }}>MOD</Typography>
                                            )}
                                            {(viewerRole === 'owner' || (viewerRole === 'mod' && player.role !== 'owner')) && (
                                                <Typography sx={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--color-text-muted)', cursor: 'pointer', ml: 1, '&:hover': { color: 'var(--color-primary)' } }}>KICK</Typography>
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
}