// src/tabs/home/grid/EditGridBar.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ActionPair } from '@ui/Button'; 

const ResetIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
    </svg>
);

export default function EditGridBar({ onOpenModal, onReset, onCancel, onSave }) {
    return (
        <Box className="glass-panel" sx={{ p: 2, mb: 2, width: '100%' }}>
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                alignItems="stretch" // 2. THE FIX: Allow children to stretch to the max height dynamically
                spacing={2}
                sx={{ width: '100%' }}
            >
                
                {/* LEFT SIDE: Edit + Reset */}
                <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" // Keep the left items centered vertically
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    <Button 
                        variant="outlined" 
                        color="inherit" 
                        onClick={onOpenModal}
                        sx={{ 
                            flex: 1, 
                            borderRadius: '12px',
                            borderColor: 'rgba(255,255,255,0.3)',
                            whiteSpace: 'nowrap',
                            height: '100%' // Adapts dynamically
                        }}
                    >
                        Edit Widgets
                    </Button>
                    
                    <Tooltip title="Reset Layout" placement="top" arrow>
                        <IconButton 
                            onClick={onReset}
                            sx={{ 
                                aspectRatio: '1/1', // Forces a perfect square without magic numbers
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.2)', 
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    background: 'rgba(255,255,255,0.15)',
                                    borderColor: 'rgba(255,255,255,0.4)'
                                }
                            }}
                        >
                            <ResetIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>

                {/* THE MAGIC SPACER */}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

                {/* RIGHT SIDE: Action Pair */}
                <Box sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center' // Naturally centers the ActionPair within the stretched height
                }}>
                    <ActionPair 
                        onCancel={onCancel} 
                        onConfirm={onSave} 
                    />
                </Box>

            </Stack>
        </Box>
    );
}