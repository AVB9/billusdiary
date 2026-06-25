// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from '@layout/BottomNav';
import OnBoarding from '@layout/OnBoarding'; 
import DevPanel from '@layout/DevPanel'; 
import Wordle from '@widgets/wordle/Wordle'; 

import { subscribeToAuthChanges } from './services/auth'; 

// THE NEW REGISTRY IMPORT
import { TAB_REGISTRY } from '@tabs/TabRegistry';

// ============================================================================
// MAIN OS WRAPPER
// ============================================================================
const MainOS = ({ activeIndex, handleTabChange, user, activeTabs }) => (
    <>
        <main id="app-container">
            <div style={{ width: '100%' }}>
                {activeTabs.map((tab, idx) => (
                    <div key={tab.id} style={{ display: activeIndex === idx ? 'block' : 'none', width: '100%' }}>
                        {React.cloneElement(tab.component, { uid: user.uid })}
                    </div>
                ))}
            </div>
        </main>
        <BottomNav activeIndex={activeIndex} onTabChange={handleTabChange} tabs={activeTabs} />
    </>
);

export default function App() {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    // DYNAMIC CONFIGURATION (Later, fetch these two from Firebase!)
    const [navConfig, setNavConfig] = useState(['momentum', 'planner', 'home', 'todo', 'settings']);
    const [defaultTabId, setDefaultTabId] = useState('home');

    // Resolve IDs to actual component objects using the new TabRegistry
    const activeTabs = navConfig.map(id => TAB_REGISTRY[id]).filter(Boolean);

    // Initial starting index based on the defaultTabId inside the user's config
    const startingIndex = navConfig.indexOf(defaultTabId) !== -1 ? navConfig.indexOf(defaultTabId) : 0;
    const [activeIndex, setActiveIndex] = useState(startingIndex);
    
    const scrollPositions = useRef({});

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
            
            // NOTE: Here is where you will fetch user doc from Firebase
            // and update setNavConfig(userData.navSequence) 
            // and setDefaultTabId(userData.defaultTab)
        });
        return () => unsubscribe();
    }, []);

    const handleTabChange = (newIndex) => {
        scrollPositions.current[activeIndex] = window.scrollY;
        setActiveIndex(newIndex);
    };

    useEffect(() => {
        if (!user) return; 
        // Look up by dynamic ID string instead of fixed position
        if (navConfig[activeIndex] === 'home') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } else {
            const savedScroll = scrollPositions.current[activeIndex] || 0;
            window.scrollTo({ top: savedScroll, left: 0, behavior: 'instant' });
        }
    }, [activeIndex, user, navConfig]);

    if (isAuthLoading) {
        return <div style={{ display: 'flex', minHeight: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading OS...</div>;
    }

    if (!user) {
        return (
            <>
                <DevPanel user={user} />
                <OnBoarding />
            </>
        );
    }

    return (
        <>
            <DevPanel user={user} />
            
            <Routes>
                <Route path="/" element={<MainOS activeIndex={activeIndex} handleTabChange={handleTabChange} user={user} activeTabs={activeTabs} />} />
                <Route path="/wordle" element={<Wordle user={user} />} />
            </Routes>
        </>
    );
}