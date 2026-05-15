//.src/components/BottomNav.jsx
import React, { useState, useEffect, useRef } from 'react';
import '@components/components.css';

export default function BottomNav({ activeIndex, onTabChange }) {
    const [isVisible, setIsVisible] = useState(true);
    
    const lastScrollY = useRef(0);
    const navTouchStartX = useRef(null);
    const navTouchStartY = useRef(null);
    const isRecoveryActive = useRef(false);
    const recoveryTouchStartY = useRef(null);

    const tabs = [
        { title: 'Momentum', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg> },
        { title: 'Planner', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
        { title: 'Home', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> },
        { title: 'Todo', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg> },
        { title: 'Settings', icon: (<svg width="24" height="24" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /> <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" /> </svg>) }
    ];

    // =======================================================
    // USEEFFECT: Jitter Fix & Tab Change Handler
    // =======================================================
    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            lastScrollY.current = window.scrollY;
        }, 50);
        return () => clearTimeout(timer);
    }, [activeIndex]);

    // =======================================================
    // THE ORIGINAL USEEFFECT: Global Scroll & Swipe Handler
    // =======================================================
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (isRecoveryActive.current && currentScrollY > 5) isRecoveryActive.current = false;
            
            if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY.current) {
                setIsVisible(true);
            }
            lastScrollY.current = currentScrollY;
        };

        const handleGlobalTouchStart = (e) => {
            if (!isRecoveryActive.current) return;
            if (e.touches[0].clientY > window.innerHeight - 100) recoveryTouchStartY.current = e.touches[0].clientY;
        };

        const handleGlobalTouchEnd = (e) => {
            if (!isRecoveryActive.current || recoveryTouchStartY.current === null) return;
            if (recoveryTouchStartY.current - e.changedTouches[0].clientY > 40) {
                setIsVisible(true);
                isRecoveryActive.current = false;
            }
            recoveryTouchStartY.current = null;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        document.addEventListener('touchstart', handleGlobalTouchStart, { passive: true });
        document.addEventListener('touchend', handleGlobalTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            document.removeEventListener('touchstart', handleGlobalTouchStart);
            document.removeEventListener('touchend', handleGlobalTouchEnd);
        };
    }, []);

    // =======================================================
    // LOCAL NAV GESTURES
    // =======================================================
    const handleNavTouchStart = (e) => {
        navTouchStartX.current = e.touches[0].clientX;
        navTouchStartY.current = e.touches[0].clientY;
    };

    const handleNavTouchEnd = (e) => {
        if (navTouchStartX.current === null || navTouchStartY.current === null) return;

        const diffX = navTouchStartX.current - e.changedTouches[0].clientX;
        const diffY = navTouchStartY.current - e.changedTouches[0].clientY;

        // Swipe Down
        if (diffY < -40) {
            setIsVisible(false);
            if (window.scrollY <= 5) isRecoveryActive.current = true;
            navTouchStartX.current = null;
            navTouchStartY.current = null;
            return; 
        }

        // Swipe Left/Right
        if (Math.abs(diffX) > 50) {
            if (diffX > 0 && activeIndex < tabs.length - 1) onTabChange(activeIndex + 1);
            else if (diffX < 0 && activeIndex > 0) onTabChange(activeIndex - 1);
        }
        
        navTouchStartX.current = null;
        navTouchStartY.current = null;
    };

    return (
        <nav 
            className={`bottom-pill-nav ${!isVisible ? 'nav-hidden' : ''}`} 
            id="bottomNav"
            onTouchStart={handleNavTouchStart}
            onTouchEnd={handleNavTouchEnd}
        >
            {tabs.map((tab, idx) => (
                <button 
                    key={idx}
                    className={`bottom-pill-btn ${activeIndex === idx ? 'active' : ''}`} 
                    title={tab.title}
                    onClick={() => onTabChange(idx)}
                >
                    {tab.icon}
                </button>
            ))}
        </nav>
    );
}