// src/components/ui/GlassInput.jsx
import React from 'react';

export default function GlassInput({ style, ...props }) {
    return (
        <input 
            {...props}
            style={{ 
                padding: '12px', 
                borderRadius: '12px', 
                border: '1px solid var(--color-glass-border)', 
                background: 'rgba(0,0,0,0.5)', 
                color: 'var(--color-text)', 
                fontSize: '1rem', 
                outline: 'none',
                textAlign: 'center', 
                fontWeight: 'bold',
                width: '100%',
                boxSizing: 'border-box',
                ...style 
            }}
        />
    );
}