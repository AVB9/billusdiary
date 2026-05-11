import React from 'react';
import GlassPanel from '../components/GlassPanel';

export const GoalTestWidget = () => (
    <GlassPanel>
        <div className="bento-title">Goal</div>
        <div className="bento-value text-main-color" style={{ fontSize: '3rem' }}>124</div>
        <div className="bento-sub">Days remaining</div>
    </GlassPanel>
);

export const FocusTestWidget = () => (
    <GlassPanel style={{ background: 'var(--color-primary, #60A5FA)', color: '#000' }} className="bento-centered">
        <div className="bento-title" style={{ color: 'rgba(0,0,0,0.7)' }}>Focus</div>
        <div className="bento-value" style={{ color: '#000' }}>25:00</div>
        <div className="bento-sub" style={{ color: 'rgba(0,0,0,0.7)' }}>Pomodoro</div>
    </GlassPanel>
);

export const HabitsTestWidget = () => (
    <GlassPanel>
        <div className="bento-title">Habits</div>
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' }}>Read 10 Pages</div>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '8px' }}>Drink Water</div>
        </div>
    </GlassPanel>
);

export const StatsTestWidget = () => (
    <GlassPanel>
        <div className="bento-title">Weekly Stats</div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '4px', marginTop: '10px' }}>
            {/* Fake bar chart */}
            <div style={{ width: '20%', height: '40%', background: 'var(--color-primary)' }} />
            <div style={{ width: '20%', height: '70%', background: 'var(--color-primary)' }} />
            <div style={{ width: '20%', height: '30%', background: 'var(--color-primary)' }} />
            <div style={{ width: '20%', height: '100%', background: 'var(--color-primary)' }} />
            <div style={{ width: '20%', height: '50%', background: 'var(--color-primary)' }} />
        </div>
    </GlassPanel>
);