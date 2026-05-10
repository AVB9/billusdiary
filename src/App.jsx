import React, { useState } from 'react';
import BottomNav from './components/BottomNav';
import HomeTab from './tabs/Home/HomeTab';

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

    return (
        <>
            {/* REMOVED inline height/overflow constraints so the window can scroll natively */}
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

            <BottomNav activeIndex={activeIndex} onTabChange={setActiveIndex} />
        </>
    );
}