import React from 'react';

export default function GlassPanel({ children, className = '', ...props }) {
    return (
        <div 
            className={`glass-panel ${className}`} 
            {...props} // This safely catches style, onClick, id, and anything else you throw at it!
        >
            {children}
        </div>
    );
}