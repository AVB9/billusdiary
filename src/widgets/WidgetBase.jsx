// src/widgets/WidgetBase.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GlassPanel from '@components/ui/GlassPanel'; 

export default function WidgetBase({ 
    title, 
    onTitleClick, 
    headerActions, 
    children, 
    overlays,
    toastMessage, 
    noPadding = false 
}) {
    return (
        <GlassPanel 
            className="widget-outer-area"
            sx={{ 
                height: '100%', display: 'flex', flexDirection: 'column', 
                p: noPadding ? 0 : 1.25, 
                background: 'var(--color-glass-bg)', backdropFilter: 'var(--blur-glass)',
                borderRadius: 'var(--rad-lg)', border: '1px solid var(--color-glass-border)',
                position: 'relative'
            }}
        >
            {/* UNIFIED HEADER BAR */}
            {(title || headerActions) && (
                <Box className="widget-header-area" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1, height: '28px', flexShrink: 0, overflow: 'hidden' }}>
                    <Typography 
                        variant="subtitle2" 
                        onClick={onTitleClick}
                        sx={{ 
                            fontWeight: 800, 
                            letterSpacing: '2px', 
                            color: 'var(--color-text-muted)', 
                            textTransform: 'uppercase', 
                            cursor: onTitleClick ? 'pointer' : 'default', 
                            transition: 'color 0.2s ease', 
                            lineHeight: 1, 
                            
                            // THE FIX: Wrap the title's hover state in the media query!
                            '@media (hover: hover) and (pointer: fine)': {
                                '&:hover': onTitleClick ? { color: 'var(--color-text)' } : {}
                            }
                        }}
                    >
                        {title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                        {headerActions}
                    </Box>
                </Box>
            )}

            {/* RESPONSIVE CONTENT SPACE */}
            <Box className="widget-content-area" sx={{ 
                flexGrow: 1, display: 'flex', flexDirection: 'column', 
                position: 'relative', height: '100%', overflow: 'hidden',
                containerType: 'inline-size' 
            }}>
                {children}
            </Box>

            {/* OVERLAY LAYER */}
            {overlays}

            {/* THE UNIVERSAL WIDGET TOAST */}
            {toastMessage && (
                <Box sx={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', zIndex: 9999
                }}>
                    <Box sx={{
                        background: 'white', backdropFilter: 'var(--blur-heavy)',
                        border: '1px solid var(--color-glass-border)', boxShadow: 'var(--shadow-lg)',
                        color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.8rem',
                        letterSpacing: '1px', textTransform: 'uppercase',
                        px: 2.5, py: 1.25, borderRadius: 'var(--rad-pill)', whiteSpace: 'nowrap',
                        animation: 'fadeIn 0.1s ease'
                    }}>
                        {toastMessage}
                    </Box>
                </Box>
            )}
        </GlassPanel>
    );
}