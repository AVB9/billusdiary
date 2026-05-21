// src/hooks/useWidgetTelemetry.js
import { useRef, useEffect } from 'react';

export default function useWidgetTelemetry(widgetId, onReport, currentState) {
    const renderCount = useRef(0);
    const mountTime = useRef(performance.now());

    useEffect(() => {
        renderCount.current += 1;
        
        if (onReport && widgetId) {
            onReport(widgetId, {
                renders: renderCount.current,
                mountTime: Math.round(performance.now() - mountTime.current),
                ...currentState // Spread in whatever state the widget wants to expose!
            });
        }
    }); // Runs on every single render intentionally to track performance
}