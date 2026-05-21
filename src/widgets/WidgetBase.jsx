// src/widgets/WidgetBase.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GlassPanel from '@ui/GlassPanel'; 

export default function WidgetBase({ 
    title, 
    onTitleClick, 
    headerActions, 
    children, 
    noPadding = false 
}) {
    return (
        // WidgetBase is now officially a GlassPanel!
        <GlassPanel sx={{ 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            p: noPadding ? 0 : 2, 
            background: 'var(--color-glass-bg)', 
            backdropFilter: 'var(--blur-glass)',
            borderRadius: 'var(--rad-lg)', 
            border: '1px solid var(--color-glass-border)'
        }}>
            {/* UNIFIED HEADER BAR */}
            {(title || headerActions) && (
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 2, 
                    flexShrink: 0 
                }}>
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
                            '&:hover': onTitleClick ? { color: 'var(--color-text)' } : {}
                        }}
                    >
                        {title}
                    </Typography>
                    
                    {/* CUSTOM INJECTED COMPONENT SPACE */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {headerActions}
                    </Box>
                </Box>
            )}

            {/* RESPONSIVE CONTENT SPACE */}
            <Box sx={{ 
                flexGrow: 1, 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                height: '100%',
                overflow: 'hidden' 
            }}>
                {children}
            </Box>
        </GlassPanel>
    );
}