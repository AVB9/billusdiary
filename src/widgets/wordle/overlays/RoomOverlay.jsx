// src/widgets/wordle/overlays/RoomOverlay.jsx
import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import OverlayBase from '@widgets/OverlayBase';

export default function RoomOverlay({ isOpen, onClose, onConfirm }) {
    const [roomName, setRoomName] = useState('');
    const [codeLetter, setCodeLetter] = useState('S');
    const [codeNumbers, setCodeNumbers] = useState('');

    const isExistingRoom = roomName === 'TEST' && codeNumbers === '1234'; 

    const handleConfirm = () => {
        onConfirm({ name: roomName, code: `${codeLetter}-${codeNumbers}` });
    };

    return (
        <OverlayBase isOpen={isOpen} title="Rooms" onClose={onClose}>
            <Typography variant="caption" sx={{ color: 'var(--color-text-muted)', lineHeight: 1.1, mb: 0.5, mt: 2, fontSize: '0.7rem', display: 'block', flexShrink: 0 }}>
                UNDER DEVELOPMENT 
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--color-primary)', fontSize: '1.8rem', display: 'block', flexShrink: 0 }}>
                GOOD THINGS TAKE TREATS!!
            </Typography>
        </OverlayBase>
    );
}