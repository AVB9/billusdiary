import React from 'react';
import Typography from '@mui/material/Typography';
import OverlayBase from '@widgets/OverlayBase';
export default function RequestsOverlay({ isOpen, onClose }) {
    return <OverlayBase isOpen={isOpen} title="REQUESTS" onClose={onClose}><Typography sx={{ color: 'var(--color-text-muted)', textAlign: 'center', p: 2 }}>Inbox UI goes here</Typography></OverlayBase>;
}