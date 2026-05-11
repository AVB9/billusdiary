import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function ModalOverlay({ children, isOpen, onClose }) {
    // Prevent background scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        
        // Cleanup function in case component unmounts
        return () => { document.body.style.overflow = 'auto'; };
    }, [isOpen]);

    // If it's not open, return nothing (zero memory footprint)
    if (!isOpen) return null; 

    // Teleport the modal directly to document.body
    return createPortal(
        <div 
            className="modal-backdrop" 
            style={{ 
                position: 'fixed', 
                inset: 0, 
                zIndex: 9999, 
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)' // Optional: blurs the app behind the modal
            }}
            // Clicking the dark background closes the modal
            onClick={onClose} 
        >
            <div 
                className="modal-container"
                // stopPropagation prevents clicks inside the modal box from closing it!
                onClick={(e) => e.stopPropagation()} 
            >
                {children}
            </div>
        </div>,
        document.body
    );
}