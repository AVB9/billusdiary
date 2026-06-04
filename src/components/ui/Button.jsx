// src/components/ui/Button.jsx
import React from 'react';
import Stack from '@mui/material/Stack';
import MuiButton from '@mui/material/Button';

// Base properties that all our custom buttons share
const baseSx = {
    borderRadius: 'var(--rad-sm, 8px)',
    fontWeight: 900,
    boxShadow: 'none',
    textTransform: 'uppercase', 
    whiteSpace: 'nowrap', 
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', 
    // MOBILE TACTILE FEEDBACK
    '&:active': { 
        transform: 'scale(0.96)' 
    },
    '&:hover': { 
        boxShadow: 'none' 
    }
};

export const PrimaryButton = ({ children, sx, fullWidth, onClick, disabled, ...props }) => (
    <MuiButton
        variant="contained"
        fullWidth={fullWidth}
        onClick={onClick}
        disabled={disabled}
        {...props}
        sx={{
            ...baseSx,
            color: 'var(--color-bg, #000000)',
            background: 'var(--color-primary, #EF4444)',
            '&:hover': { 
                background: 'var(--color-primary, #EF4444)', 
                filter: 'brightness(1.1)', 
                boxShadow: 'none',
                transform: 'translateY(-1px)' 
            },
            '&.Mui-disabled': {
                background: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)',
            },
            ...sx 
        }}
    >
        {children}
    </MuiButton>
);

// THE UPGRADE: The "Soft Tonal" aesthetic
export const SecondaryButton = ({ children, sx, fullWidth, onClick, disabled, ...props }) => (
    <MuiButton
        variant="text" // Removed outline
        fullWidth={fullWidth}
        onClick={onClick}
        disabled={disabled}
        {...props}
        sx={{
            ...baseSx,
            color: 'var(--color-text-muted, rgba(255,255,255,0.7))', // Muted text
            backgroundColor: 'rgba(255,255,255,0.06)', // Very faint structural background, NO BORDER
            '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.12)', // Background subtly brightens
                color: 'var(--color-text-main, #FFFFFF)', // Text pops to bright white
                transform: 'translateY(-1px)'
            },
            '&.Mui-disabled': {
                color: 'rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(255,255,255,0.02)',
            },
            ...sx
        }}
    >
        {children}
    </MuiButton>
);

// The 30/70 Layout specifically for forms and dialogs
export const ActionPair = ({ onCancel, onConfirm, cancelText = "Cancel", confirmText = "Done" }) => (
    <Stack direction="row" spacing={1.5} width="100%">
        <MuiButton 
            variant="text" 
            onClick={onCancel}
            sx={{ 
                flex: 3, 
                borderRadius: 'var(--rad-sm, 8px)', 
                whiteSpace: 'nowrap', 
                fontWeight: 900,
                color: 'rgba(255,255,255,0.6)',
                backgroundColor: 'rgba(255,255,255,0.06)', // Matches the soft tonal look
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:active': { transform: 'scale(0.96)' },
                '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.12)', 
                    color: '#FFFFFF' 
                }
            }}
        >
            {cancelText}
        </MuiButton>
        
        <PrimaryButton onClick={onConfirm} sx={{ flex: 7 }}>
            {confirmText}
        </PrimaryButton>
    </Stack>
);