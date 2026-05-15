// src/components/ui/ActionPair.jsx
import React from 'react';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';

export default function ActionPair({ 
    onCancel, 
    onConfirm, 
    cancelText = "Cancel", 
    confirmText = "Done",
    confirmColor = "primary" 
}) {
    return (
        // Stretch to 100% width
        <Stack direction="row" spacing={1.5} width="100%">
            
            {/* CANCEL BUTTON: Takes 30% */}
            <Button 
                variant="text" 
                color="inherit" 
                onClick={onCancel}
                sx={{ 
                    flex: 3, // 30% of the flex space!
                    borderRadius: '8px', // Rectangular edges
                    whiteSpace: 'nowrap', 
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.5)',
                    '&:hover': { background: 'rgba(255,255,255,0.05)', color: 'white' }
                }}
            >
                {cancelText}
            </Button>
            
            {/* SAVE BUTTON: Takes 70% */}
            <Button 
                variant="contained" 
                color={confirmColor} 
                onClick={onConfirm}
                sx={{ 
                    flex: 7, // 70% of the flex space!
                    borderRadius: '8px', // Rectangular edges
                    fontWeight: 'bold', 
                    color: '#000', 
                    whiteSpace: 'nowrap',
                    background: 'var(--color-primary, #60A5FA)',
                    '&:hover': { background: 'var(--color-primary, #3B82F6)' }
                }}
            >
                {confirmText}
            </Button>
            
        </Stack>
    );
}