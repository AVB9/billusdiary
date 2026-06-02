import React from 'react';
import Typography from '@mui/material/Typography';
import OverlayBase from '@widgets/OverlayBase';
export default function InvitePlayerOverlay({ isOpen, onClose }) {
    return <OverlayBase isOpen={isOpen} title="INVITE PLAYER" onClose={onClose}><Typography sx={{ color: 'var(--color-text-muted)', textAlign: 'center', p: 2 }}>Search UI goes here</Typography></OverlayBase>;
}