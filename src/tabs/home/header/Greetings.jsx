// src/tabs/home/header/Greetings.jsx
import React, { useState, useEffect } from 'react';
import { Sun, Moon } from '@ui/Icons'; 

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
        day: <Sun />,   
        night: <Moon /> 
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
        const savedName = localStorage.getItem('userDisplayName') || 'avb';
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