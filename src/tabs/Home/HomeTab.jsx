import React, { useState, useEffect } from 'react';
import BentoCard from '../../components/BentoCard';

export default function HomeTab() {
    const [greeting, setGreeting] = useState('...');

    useEffect(() => {
        const updateGreeting = () => {
            const hour = new Date().getHours();
            if (hour >= 5 && hour < 12) setGreeting('Good Morning');
            else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
            else if (hour >= 17 && hour < 22) setGreeting('Good Evening');
            else setGreeting('Time to rest');
        };

        updateGreeting();
        const timer = setInterval(updateGreeting, 60000); 
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="app-tab">
            <div className="central-column">
                
                {/* Greeting Section */}
                <div className="greeting-header">
                    <div className="greeting-icon" id="timeIcon"></div>
                    <div className="greeting-text">
                        <h2>{greeting}</h2>
                        <p>gummi luck</p>
                    </div>
                </div>
                
                {/* Dynamic Bento Grid */}
                <div className="home-grid">
                    <div className="home-col-left">
                        <BentoCard index={1} id="openGoalModalBtn">
                            <div className="bento-title">Goal Countdown</div>
                            <div className="bento-value text-main-color">000</div>
                            <div className="bento-sub">Set your goal...</div>
                        </BentoCard>
                        
                        <BentoCard index={2} id="homeTargetWidget">
                            <div className="bento-title flex-between">Today's Target</div>
                            <div>
                                <div className="empty-task-text">Pulling from planner...</div>
                            </div>
                        </BentoCard>
                    </div>
                    
                    <BentoCard index={3} id="homeHabitWidget">
                        <div className="bento-title">Daily Momentum</div>
                        <div className="home-habit-list">
                            <div className="empty-task-text">No active habits.</div>
                        </div>
                    </BentoCard>
                    
                    <BentoCard index={4} className="bento-accent bento-centered" id="focusModeWidget">
                        <div className="bento-value text-md">Focus Mode</div>
                        <div className="bento-sub">Just a Clock</div>
                    </BentoCard>
                </div>

            </div>
        </div>
    );
}