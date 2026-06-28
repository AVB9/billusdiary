// src/tabs/home/grid/EditGridBar.jsx
import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { ActionPair } from '@ui/Button'; 
import { Reset } from '@ui/Icons'; 

export default function EditGridBar({ onOpenModal, onReset, onCancel, onSave }) {
    return (
        <Box className="glass-panel" sx={{ p: 2, mb: 2, width: '100%' }}>
            <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                alignItems="stretch" 
                spacing={2}
                sx={{ width: '100%' }}
            >
                
                {/* LEFT SIDE: Edit + Reset */}
                <Stack 
                    direction="row" 
                    spacing={2} 
                    alignItems="center" 
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
                            height: '100%' 
                        }}
                    >
                        Edit Widgets
                    </Button>
                    
                    <Tooltip title="Reset Layout" placement="top" arrow>
                        <IconButton 
                            onClick={onReset}
                            sx={{ 
                                aspectRatio: '1/1', 
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
                            <Reset /> 
                        </IconButton>
                    </Tooltip>
                </Stack>

                {/* THE MAGIC SPACER */}
                <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />

                {/* RIGHT SIDE: Action Pair */}
                <Box sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    display: 'flex',
                    alignItems: 'center' 
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