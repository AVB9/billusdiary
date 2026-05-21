// src/components/ui/GlassPanel.jsx
import React from 'react';
import Box from '@mui/material/Box'; 

export default function GlassPanel({ children, className = '', sx = {}, ...props }) {
    return (
        <Box 
            className={`glass-panel ${className}`} 
            sx={{ 
                position: 'relative', 
                overflow: 'hidden',
                ...sx 
            }}
            {...props} 
        >
            
            {children}
        </Box>
    );
}