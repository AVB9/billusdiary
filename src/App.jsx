// src/App.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import BottomNav from '@layout/BottomNav';
import HomeTab from '@tabs/home/HomeTab';
import OnBoarding from '@layout/OnBoarding'; 
import DevPanel from '@layout/DevPanel'; 
// 1. Updated the import to match your new file name
import Wordle from '@widgets/wordle/Wordle'; 
import { subscribeToAuthChanges } from './services/auth'; 

const APP_TABS = [
    { id: 'momentum', component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Momentum Placeholder</div> },
    { id: 'planner', component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Planner Placeholder</div> },
    { id: 'home', component: <HomeTab /> },
    { id: 'todo', component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Todo Placeholder</div> },
    { id: 'settings', component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Settings Placeholder</div> }
];

const MainOS = ({ activeIndex, handleTabChange, user }) => (
    <>
        <main id="app-container">
            <div style={{ width: '100%' }}>
                {APP_TABS.map((tab, idx) => (
                    <div key={tab.id} style={{ display: activeIndex === idx ? 'block' : 'none', width: '100%' }}>
                        {React.cloneElement(tab.component, { uid: user.uid })}
                    </div>
                ))}
            </div>
        </main>
        <BottomNav activeIndex={activeIndex} onTabChange={handleTabChange} />
    </>
);

export default function App() {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const startingIndex = APP_TABS.findIndex(tab => tab.id === 'home');
    const [activeIndex, setActiveIndex] = useState(startingIndex !== -1 ? startingIndex : 0);
    const scrollPositions = useRef({});

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges((currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleTabChange = (newIndex) => {
        scrollPositions.current[activeIndex] = window.scrollY;
        setActiveIndex(newIndex);
    };

    useEffect(() => {
        if (!user) return; 
        if (APP_TABS[activeIndex].id === 'home') {
            window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
        } else {
            const savedScroll = scrollPositions.current[activeIndex] || 0;
            window.scrollTo({ top: savedScroll, left: 0, behavior: 'instant' });
        }
    }, [activeIndex, user]);

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
                <Route path="/" element={<MainOS activeIndex={activeIndex} handleTabChange={handleTabChange} user={user} />} />
                
                {/* 2. Updated the element to use your new <Wordle /> component */}
                <Route path="/wordle" element={<Wordle user={user} />} />
            </Routes>
        </>
    );
}