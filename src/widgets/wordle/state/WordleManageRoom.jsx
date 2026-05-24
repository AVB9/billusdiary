// src/widgets/wordle/state/ManageRoom.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import * as Icons from '@ui/Icons';

export default function ManageRoom({ onOpenEdit, onOpenInvite }) {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', gap: 1.5, animation: 'fadeIn 0.3s ease' }}>
            
            {/* THE HEADER: 70/15/15 Split */}
            <Box sx={{ display: 'flex', gap: 1, px: 0.5, pt: 0.5 }}>
                
                {/* 70% Left: Room Dropdown */}
                <Box sx={{ 
                    flexGrow: 1, background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', 
                    borderRadius: 'var(--rad-sm)', display: 'flex', alignItems: 'center', px: 1.5, height: '42px',
                    boxShadow: 'var(--shadow-sm)', cursor: 'pointer', transition: 'opacity 0.2s ease', '&:hover': { opacity: 0.8 }
                }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-text)', letterSpacing: '1px' }}>
                        ROOM ▾
                    </Typography>
                </Box>

                {/* 15% Middle: Edit Icon */}
                <Box onClick={onOpenEdit} sx={{ 
                    width: '42px', height: '42px', flexShrink: 0, 
                    background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--rad-sm)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                    color: 'var(--color-text-muted)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease',
                    '&:hover': { color: 'var(--color-text)', background: 'var(--color-glass-bg)' } 
                }}>
                    <Icons.Edit />
                </Box>

                {/* 15% Right: Invite Icon (Add-User SVG) */}
                <Box onClick={onOpenInvite} sx={{ 
                    width: '42px', height: '42px', flexShrink: 0, 
                    background: 'var(--color-glass-white)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--rad-sm)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', 
                    color: 'var(--color-text-muted)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s ease',
                    '&:hover': { color: 'var(--color-text)', background: 'var(--color-glass-bg)' } 
                }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                </Box>
            </Box>

            {/* THE CONTENT: Permissions Table Placeholder */}
            <Box sx={{ 
                flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                border: '2px dashed var(--color-glass-border)', borderRadius: 'var(--rad-md)', mx: 0.5, mb: 0.5
            }}>
                <Typography sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Members Area
                </Typography>
            </Box>
        </Box>
    );
}