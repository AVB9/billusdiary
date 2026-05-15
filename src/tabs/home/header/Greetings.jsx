//.src/tabs/home/header/Greetings.jsx
import React, { useState, useEffect } from 'react';

// You can eventually move this to a separate data file, but it's fine here for now.
const HOME_ASSETS = {
    greetings: (name) => [
        `How are you ${name}... :)`,         
        `Kashi ahes ${name}... :)`,         
        `Kemon acho ${name}... :)`,         
        `Kem cho ${name}... :)`,
        `Kese ho ${name}... :)`,
        `Kya haal hai bodmos... :)`,
        `Padhle bodmos... :)`,             
    ],
    icons: {
        day: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>,
        night: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    },
    getSubGreeting: (hour) => {
        if (hour >= 7 && hour < 12) return "gumiimornin";
        if (hour >= 12 && hour < 15) return "Good Afternoon";
        if (hour >= 15 && hour < 17) return "napi wapi";
        if (hour >= 17 && hour < 20) return "Good evening";
        if (hour >= 20 && hour < 23) return "sleepii time";
        if (hour >= 23 || hour < 5) return "gumiinini";
        return "waki waki"; // 5 AM to 7 AM
    }
};

export default function Greetings() {
    const [greeting, setGreeting] = useState('...');
    const [subGreeting, setSubGreeting] = useState('');
    const [icon, setIcon] = useState(null);
    const [isFading, setIsFading] = useState(false);

    useEffect(() => {
        // 1. Initialize data on mount
        const savedName = localStorage.getItem('userDisplayName') || 'jiruuuu';
        const messages = HOME_ASSETS.greetings(savedName);
        const currentHour = new Date().getHours();
        
        setGreeting(messages[Math.floor(Math.random() * messages.length)]);
        setIcon((currentHour >= 6 && currentHour < 18) ? HOME_ASSETS.icons.day : HOME_ASSETS.icons.night);
        setSubGreeting(HOME_ASSETS.getSubGreeting(currentHour));

        // 2. Start the fade sequence
        const fadeOutTimer = setTimeout(() => {
            setIsFading(true); // Trigger CSS opacity change
            
            const textChangeTimer = setTimeout(() => {
                setSubGreeting("gummi luck");
                setIsFading(false); // Fade back in
            }, 500); // Wait 0.5s for the CSS fade to finish before changing text

            return () => clearTimeout(textChangeTimer);
        }, 3500);

        // 3. Cleanup function if the component unmounts early
        return () => clearTimeout(fadeOutTimer);
    }, []);

    return (
        <div className="greeting-header">
            <div className="greeting-icon">
                {icon}
            </div>
            <div className="greeting-text">
                <h2>{greeting}</h2>
                <p style={{ 
                    transition: 'opacity 0.5s ease', 
                    opacity: isFading ? 0 : 1 
                }}>
                    {subGreeting}
                </p>
            </div>
        </div>
    );
}