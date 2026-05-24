// src/widgets/OverlayBase.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GlassPanel from '@ui/GlassPanel';

export default function OverlayBase({ isOpen, title, onClose, children, footerActions }) {
    if (!isOpen) return null;

    return (
        <Box 
            sx={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center',
                p: 1, animation: 'fadeIn 0.2s ease'
            }}
        >
            {/* 1. SIBLING BACKDROP LAYER: Safely handles the dimming and blur */}
            <Box 
                onClick={onClose} 
                sx={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)'
                }}
            />

            {/* 2. FOREGROUND CONTENT LAYER: Hardware accelerated & crisp! */}
            <GlassPanel 
                onClick={(e) => e.stopPropagation()} 
                sx={{
                    position: 'relative', zIndex: 1, // Sits safely above the backdrop sibling
                    maxWidth: '80%', maxHeight: '80%', 
                    display: 'flex', flexDirection: 'column',
                    p: 1.5, borderRadius: 'var(--rad-lg)',
                    border: '1px solid var(--color-glass-border)',
                    boxShadow: 'var(--shadow-lg)',
                    // Force the GPU to render this layer perfectly sharp
                    transform: 'translateZ(0)',
                    WebkitFontSmoothing: 'antialiased' 
                }}
            >
                {/* OVERLAY HEADER */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, flexShrink: 0 }}>
                    <Typography sx={{ fontWeight: 800, letterSpacing: '1px', color: 'var(--color-text-main, #FFF)', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                        {title}
                    </Typography>
                    
                    <Box onClick={onClose} sx={{ cursor: 'pointer', display: 'flex', color: 'var(--color-text-muted)', transition: 'color 0.2s ease', '&:hover': { color: 'var(--color-text-main, #FFF)' } }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="11" />
                            <path d="M15 9L9 15M9 9L15 15" stroke="var(--color-bg, #000)" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>
                    </Box>
                </Box>

                {/* OVERLAY CONTENT (Scrollable with Opacity Mask) */}
                <Box sx={{ 
                    display: 'flex', flexDirection: 'column', gap: 1, 
                    overflowY: 'auto', overflowX: 'hidden', flexGrow: 1, pr: 0.5,
                    WebkitMaskImage: footerActions ? 'linear-gradient(to bottom, black 85%, transparent 100%)' : 'none',
                    maskImage: footerActions ? 'linear-gradient(to bottom, black 85%, transparent 100%)' : 'none',
                }}>
                    {children}
                </Box>

                {/* NATIVE FOOTER */}
                {footerActions && (
                    <Box sx={{ display: 'flex', width: '100%', maxHeight: '30%', pt: 1.5, mt: 'auto', flexShrink: 0 }}>
                        {footerActions}
                    </Box>
                )}

            </GlassPanel>
        </Box>
    );
}