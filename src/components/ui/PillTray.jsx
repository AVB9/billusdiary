// src/components/ui/PillTray.jsx
import React from 'react';
import Box from '@mui/material/Box';

export default function PillTray({ children, layout = 'brick' }) {
    // Layout 1: "brick" -> Centered, wraps to next line (For Modals & Settings)
    const brickStyles = {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        py: 1
    };

    // Layout 2: "horizontal" -> Single line, side-scrolling (For Todo TFI)
    const horizontalStyles = {
        display: 'flex',
        flexWrap: 'nowrap',
        overflowX: 'auto',
        gap: '8px',
        width: '100%',
        pb: 1, // Padding for scrollbar clearance
        // Hides the ugly scrollbar but keeps it scrollable
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none', 
    };

    return (
        <Box sx={layout === 'horizontal' ? horizontalStyles : brickStyles}>
            {children}
        </Box>
    );
}