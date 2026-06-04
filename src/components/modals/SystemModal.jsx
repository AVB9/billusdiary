// src/components/modals/SystemModal.jsx
import React from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { ActionPair } from '@ui/Button';

export default function SystemModal({ 
    isOpen, 
    onClose, 
    title, 
    subtitle, 
    children, 
    onConfirm, 
    confirmText = "Save",
    cancelText = "Cancel",
    customLeftAction = null 
}) {
    return (
        <Dialog 
            open={isOpen} 
            onClose={onClose}
            // THE BILLU'S DIARY SCRIM: Darken the background and blur it heavily!
            slotProps={{
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(10px)',
                    }
                },
                // This targets the actual white box MUI generates
                paper: {
                    sx: {
                        width: '90vw',
                        maxWidth: '400px',
                        background: 'rgba(15, 15, 15, 0.85)', // Stealth black
                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                        borderRadius: '16px', // Billu's Diary sharp edges
                        boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
                        backgroundImage: 'none', // Kills MUI's default elevation gradient
                        m: 2 // Margin so it doesn't touch screen edges on tiny phones
                    }
                }
            }}
        >
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                
                {/* 1. TITLE & SUBTITLE */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                    {title && (
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>
                            {title}
                        </Typography>
                    )}
                    {subtitle && (
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', mt: 0.5 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>

                {/* --- HORIZONTAL SEPARATOR --- */}
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 3 }} />

                {/* 2. MODAL CONTENT */}
                <Box sx={{ width: '100%', mb: 3 }}>
                    {children}
                </Box>

                {/* --- HORIZONTAL SEPARATOR --- */}
                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

                {/* 3. ACTION PAIR */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                        {customLeftAction}
                    </Box>
                    
                    <Box sx={{ ml: 'auto' }}>
                        <ActionPair 
                            onCancel={onClose} 
                            onConfirm={onConfirm}
                            cancelText={cancelText}
                            confirmText={confirmText}
                        />
                    </Box>
                </Stack>

            </Box>
        </Dialog>
    );
}