//./src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import BottomNav from '@layout/BottomNav';
import HomeTab from '@tabs/home/HomeTab';

const APP_TABS = [
    { id: 'momentum', component: <div className="app-tab" style={{ padding: '20px', color: 'var(--color-text)' }}>Momentum Placeholder</div> },
    { id: 'planner', component: <div className="app-tab" style={{ padding: '20px', color: 'var(--color-text)' }}>Planner Placeholder</div> },
    { id: 'home', component: <HomeTab /> },
    { id: 'todo', component: <div className="app-tab" style={{ padding: '20px', color: 'var(--color-text)' }}>Todo Placeholder</div> },
    { id: 'settings', component: <div className="app-tab" style={{ padding: '20px', color: 'var(--color-text)' }}>Settings Placeholder</div> }
];

export default function App() {
    const startingIndex = APP_TABS.findIndex(tab => tab.id === 'home');
    const [activeIndex, setActiveIndex] = useState(startingIndex !== -1 ? startingIndex : 0);
    
    // =======================================================
    // THE SCROLL MEMORY ENGINE
    // =======================================================
    // This object silently remembers where every tab was scrolled to.
    const scrollPositions = useRef({});

    const handleTabChange = (newIndex) => {
        // 1. Right before switching, save the CURRENT tab's scroll position
        scrollPositions.current[activeIndex] = window.scrollY;
        
        // 2. Change the tab
        setActiveIndex(newIndex);
    };

    useEffect(() => {
        // 3. Right after the new tab renders, teleport the window.
        if (APP_TABS[activeIndex].id === 'home') {
            // ALWAYS force Home to the top for the clean animation
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } else {
            // Restore the saved scroll position for other tabs (default to 0 if they haven't visited yet)
            const savedScroll = scrollPositions.current[activeIndex] || 0;
            window.scrollTo({ top: savedScroll, left: 0, behavior: 'instant' });
        }
    }, [activeIndex]);

    return (
        <>
            <main id="app-container">
                <div style={{ width: '100%' }}>
                    {APP_TABS.map((tab, idx) => (
                        <div 
                            key={tab.id} 
                            style={{ 
                                display: activeIndex === idx ? 'block' : 'none', 
                                width: '100%' 
                            }}
                        >
                            {tab.component}
                        </div>
                    ))}
                </div>
            </main>

            {/* Hook up our custom handleTabChange instead of directly setting the index */}
            <BottomNav activeIndex={activeIndex} onTabChange={handleTabChange} />
        </>
    );
}