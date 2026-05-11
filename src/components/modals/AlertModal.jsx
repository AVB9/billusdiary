import React from 'react';
import ModalOverlay from './ModalOverlay';

export default function AlertModal({ 
    isOpen, 
    onClose, 
    title, 
    message, 
    buttonText = "OK" 
}) {
    return (
        // Teleports to the top of the document, just like the SystemModal!
        <ModalOverlay isOpen={isOpen} onClose={onClose}>
            
            <div className="alert-modal" style={{ textAlign: 'center', padding: '20px', maxWidth: '300px' }}>
                
                <div className="alert-content">
                    {/* Only render the title if one is provided */}
                    {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
                    
                    <p style={{ margin: '15px 0', opacity: 0.8 }}>{message}</p>
                </div>
                
                <hr className="modal-separator" style={{ margin: '15px -20px' }} />
                
                <div className="alert-footer">
                    <button 
                        className="text-main-color" 
                        onClick={onClose}
                        style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {buttonText}
                    </button>
                </div>

            </div>
            
        </ModalOverlay>
    );
}