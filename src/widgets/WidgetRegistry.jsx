// src/widgets/WidgetRegistry.jsx
import React, { useRef, useEffect, useState } from 'react';
import { GoalTestWidget, FocusTestWidget, HabitsTestWidget, StatsTestWidget } from './TestWidgets';
import WordleWidget from '@widgets/wordle/WordleWidget'; 

const withTelemetry = (WrappedComponent, widgetType) => {
    return function TelemetryWrapper(props) {
        const renderCount = useRef(0);
        
        // 1. FIX: Track initialization vs actual mount time
        const initTime = useRef(performance.now());
        const mountLatency = useRef(0);
        const isMounted = useRef(false);

        const [liveView, setLiveView] = useState('lobby');
        const [liveScope, setLiveScope] = useState('ISOLATED_SOLO');

        renderCount.current += 1;

        useEffect(() => {
            // 2. FIX: Only calculate latency once, the first time it hits the DOM
            if (!isMounted.current) {
                mountLatency.current = Math.round(performance.now() - initTime.current);
                isMounted.current = true;
            }

            const event = new CustomEvent('widget_telemetry_uplink', {
                detail: {
                    type: widgetType,
                    data: {
                        renders: renderCount.current,
                        mountTime: mountLatency.current, // Now a static number!
                        view: liveView,
                        syncScope: liveScope
                    }
                }
            });
            window.dispatchEvent(event);
        }); 

        return (
            <WrappedComponent 
                {...props} 
                reportTelemetryView={setLiveView}
                reportTelemetryScope={setLiveScope}
            />
        );
    };
};

export const WIDGET_DICTIONARY = {
    'goal-countdown': { 
        name: 'Goal Tracker',
        component: withTelemetry(GoalTestWidget, 'goal-countdown'), 
        oDW: 6, oDH: 1, 
        oMW: 12, oMH: 1  
    },
    'focus-clock': { 
        name: 'Focus Timer',
        component: withTelemetry(FocusTestWidget, 'focus-clock'), 
        oDW: 4, oDH: 2, 
        oMW: 12, oMH: 2 
    },
    'daily-habits': { 
        name: 'Habits',
        component: withTelemetry(HabitsTestWidget, 'daily-habits'), 
        oDW: 6, oDH: 3, 
        oMW: 12, oMH: 2 
    },
    'weekly-stats': { 
        name: 'Weekly Stats',
        component: withTelemetry(StatsTestWidget, 'weekly-stats'), 
        oDW: 12, oDH: 1, 
        oMW: 12, oMH: 2 
    },
    'wordle': {
        name: 'Wordle', 
        component: withTelemetry(WordleWidget, 'wordle'),
        oDW: 4, oDH: 4,
        oMW: 12, oMH: 4
    }
};