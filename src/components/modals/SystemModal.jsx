import React from 'react';
import ModalOverlay from './ModalOverlay';

export default function SystemModal({ 
    isOpen, 
    onClose, 
    onDone, 
    title, 
    subtitle, 
    layout = 'vertical', // defaults to vertical
    cancelText = 'Cancel',
    doneText = 'Done',
    children 
}) {
    return (
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            {/* The layout string determines horizontal vs vertical CSS classes */}
            <div className={`system-modal modal-${layout} glass-panel`} style={{ minWidth: '300px', maxWidth: '500px', padding: '0' }}>
                
                {/* Header Section */}
                <div className="modal-header" style={{ padding: '20px', textAlign: 'center' }}>
                    <h3 style={{ margin: '0 0 5px 0' }}>{title}</h3>
                    {subtitle && <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9em' }}>{subtitle}</p>}
                </div>
                
                {/* Top Divider */}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: 0 }} />
                
                {/* Dynamic Content Section */}
                <div className="modal-content" style={{ padding: '20px' }}>
                    {children} 
                </div>

                {/* Bottom Divider */}
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: 0 }} />
                
                {/* Footer Actions */}
                <div className="modal-footer" style={{ display: 'flex' }}>
                    <button 
                        onClick={onClose}
                        style={{ flex: 1, padding: '15px', background: 'transparent', border: 'none', borderRight: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text)', cursor: 'pointer' }}
                    >
                        {cancelText}
                    </button>
                    <button 
                        onClick={onDone}
                        style={{ flex: 1, padding: '15px', background: 'transparent', border: 'none', color: 'var(--color-primary)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {doneText}
                    </button>
                </div>

            </div>
        </ModalOverlay>
    );
}