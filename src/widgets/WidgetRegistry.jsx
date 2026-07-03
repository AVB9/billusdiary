// src/widgets/WidgetRegistry.jsx
import React, { useRef, useEffect, useState, lazy } from 'react';

// =============================================================================
// ASYNC WIDGET IMPORTS (Code Splitting)
// =============================================================================
// Default exports can be imported directly via lazy()
const WordleWidget = lazy(() => import('@widgets/wordle/WordleWidget'));

// Named exports require mapping the specific export to a 'default' key for React.lazy()
const GoalTestWidget = lazy(() => import('./TestWidgets').then(module => ({ default: module.GoalTestWidget })));
const FocusTestWidget = lazy(() => import('./TestWidgets').then(module => ({ default: module.FocusTestWidget })));
const HabitsTestWidget = lazy(() => import('./TestWidgets').then(module => ({ default: module.HabitsTestWidget })));
const StatsTestWidget = lazy(() => import('./TestWidgets').then(module => ({ default: module.StatsTestWidget })));

// =============================================================================
// TELEMETRY HOC
// =============================================================================
const withTelemetry = (WrappedComponent, widgetType) => {
    return function TelemetryWrapper(props) {
        const renderCount = useRef(0);
        
        const initTime = useRef(performance.now());
        const mountLatency = useRef(0);
        const isMounted = useRef(false);

        const [liveView, setLiveView] = useState('lobby');
        const [liveScope, setLiveScope] = useState('ISOLATED_SOLO');

        renderCount.current += 1;

        useEffect(() => {
            if (!isMounted.current) {
                mountLatency.current = Math.round(performance.now() - initTime.current);
                isMounted.current = true;
            }

            const event = new CustomEvent('widget_telemetry_uplink', {
                detail: {
                    type: widgetType,
                    data: {
                        renders: renderCount.current,
                        mountTime: mountLatency.current,
                        view: liveView,
                        syncScope: liveScope
                    }
                }
            });
            window.dispatchEvent(event);
        }, [liveView, liveScope]); 

        return (
            <WrappedComponent 
                {...props} 
                reportTelemetryView={setLiveView}
                reportTelemetryScope={setLiveScope}
            />
        );
    };
};

// =============================================================================
// REGISTRY DICTIONARY
// =============================================================================
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