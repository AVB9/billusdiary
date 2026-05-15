// src/components/ui/Pill.jsx
import React from 'react';
import ButtonBase from '@mui/material/ButtonBase';

export default function Pill({ 
    label, 
    isActive = false, 
    isDashed = false, // For Folders and "+ Add" buttons
    customColor = 'var(--color-primary, #60A5FA)', // Fallback to primary if no color provided
    onClick 
}) {
    return (
        <ButtonBase
            onClick={onClick}
            sx={{
                borderRadius: '100px', // TRUE PILL SHAPE!
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: isActive ? 800 : 600,
                whiteSpace: 'nowrap', // Prevents text from breaking into two lines
                flexShrink: 0, // Prevents squishing in horizontal scroll trays
                
                // Only transition colors/shadows to prevent layout jitter
                transition: 'background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease',
                
                // --- BASE STATE (Muted Grey or Dashed) ---
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: isDashed ? '1px dashed rgba(255, 255, 255, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.5)',

                // --- ACTIVE STATE (The "color-mix" tint from your legacy code!) ---
                ...(isActive && {
                    // Uses modern CSS color-mix to tint the background safely
                    backgroundColor: `color-mix(in srgb, ${customColor} 15%, transparent)`,
                    borderColor: customColor, 
                    color: customColor, 
                    borderStyle: 'solid', // Forces solid if a dashed pill becomes active
                }),

                // --- SQUISH PHYSICS ---
                '&:active': {
                    transform: 'scale(0.94)'
                }
            }}
        >
            {label}
        </ButtonBase>
    );
}