// src/components/BottomNav.jsx
import React, { useState, useEffect, useRef } from 'react';
import '@components/components.css';

export default function BottomNav({ activeIndex, onTabChange, tabs = [] }) {
    const [isVisible, setIsVisible] = useState(true);
    
    const lastScrollY = useRef(0);
    const navTouchStartX = useRef(null);
    const navTouchStartY = useRef(null);
    const isRecoveryActive = useRef(false);
    const recoveryTouchStartY = useRef(null);

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

        // Swipe Left/Right (Safely bounded by dynamic tabs.length)
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
                    key={tab.id} // Better to use a stable ID than index
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