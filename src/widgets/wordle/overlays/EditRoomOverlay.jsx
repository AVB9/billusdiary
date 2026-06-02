import React from 'react';
import Typography from '@mui/material/Typography';
import OverlayBase from '@widgets/OverlayBase';
export default function EditRoomOverlay({ isOpen, onClose }) {
    return <OverlayBase isOpen={isOpen} title="EDIT ROOM" onClose={onClose}><Typography sx={{ color: 'var(--color-text-muted)', textAlign: 'center', p: 2 }}>Edit Room UI goes here</Typography></OverlayBase>;
}