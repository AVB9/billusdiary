// src/widgets/OverlayBase.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GlassPanel from '@ui/GlassPanel';

export default function OverlayBase({ isOpen, title, onClose, children }) {
    if (!isOpen) return null;

    return (
        // 1. THE DARK BACKDROP
        <Box 
            onClick={onClose} // Clicking outside closes it
            sx={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(4px)',
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                animation: 'fadeIn 0.2s ease'
            }}
        >
            {/* 2. THE SHRUNKEN GLASSPANEL OVERLAY */}
            <GlassPanel 
                onClick={(e) => e.stopPropagation()} // Prevents clicks inside the panel from closing it
                sx={{
                    width: '100%',
                    maxWidth: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    p: 2,
                    borderRadius: 'var(--rad-lg)',
                    border: '1px solid var(--color-glass-border)',
                    boxShadow: 'var(--shadow-lg)'
                }}
            >
                {/* OVERLAY HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography sx={{ fontWeight: 800, letterSpacing: '1px', color: 'var(--color-text-main, #FFF)', textTransform: 'uppercase', fontSize: '0.9rem' }}>
                        {title}
                    </Typography>
                    
                    {/* THE TRS: Masked X Close Button */}
                    <Box 
                        onClick={onClose} 
                        sx={{ 
                            cursor: 'pointer', display: 'flex', color: 'var(--color-text-muted)',
                            transition: 'color 0.2s ease', '&:hover': { color: 'var(--color-text-main, #FFF)' }
                        }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="11" />
                            <path d="M15 9L9 15M9 9L15 15" stroke="var(--color-bg, #000)" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </Box>
                </Box>

                {/* OVERLAY CONTENT */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {children}
                </Box>
            </GlassPanel>
        </Box>
    );
}