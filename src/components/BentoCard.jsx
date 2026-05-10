import React from 'react';
import './components.css';

export default function BentoCard({ children, className = '', index = 0, id }) {
    // Add a slight 0.1s base delay so the main tab has time to start fading in first
    const dynamicDelay = 0.1 + (index * 0.1); 

    return (
        <article 
            id={id}
            className={`glass-panel bento-card ${className}`}
            style={{ animationDelay: `${dynamicDelay}s` }}
        >
            {children}
        </article>
    );
}