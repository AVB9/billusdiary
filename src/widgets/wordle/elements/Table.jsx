// src/widgets/wordle/elements/Table.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function Table({ headers = [], children }) {
    return (
        <Box sx={{ 
            flexGrow: 1, display: 'flex', flexDirection: 'column', 
            border: '1px solid var(--color-glass-border)', borderRadius: 'var(--rad-md)', 
            mx: 0.5, mb: 0.5, background: 'var(--color-glass-bg)', overflow: 'hidden'
        }}>
            {/* Table Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1.5, py: 0.75, borderBottom: '1px solid var(--color-glass-border)', background: 'var(--color-glass-white)' }}>
                {headers.map((header, idx) => (
                    <Typography key={idx} sx={{ color: 'var(--color-text-muted)', fontWeight: 900, fontSize: '0.55rem', letterSpacing: '1px' }}>
                        {header}
                    </Typography>
                ))}
            </Box>

            {/* Table Body (Scrollable) */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>
        </Box>
    );
}