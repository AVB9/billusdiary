import React, { useState, useEffect } from 'react';
import Greetings from './Greetings';
import BentoGrid from './BentoGrid';
import SystemModal from '../../components/modals/SystemModal';
import { WIDGET_DICTIONARY } from '../../widgets/WidgetRegistry';

export default function HomeTab() {
    // 1. Core State
    const [isEditMode, setIsEditMode] = useState(false);
    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
    
    // 2. The Dashboard Data (Using LocalStorage & RGL Schema)
    const [userLayout, setUserLayout] = useState(() => {
        // We use a new key 'bento_layout_v2' so it doesn't crash from your old string data
        const savedLayout = localStorage.getItem('bento_layout_v2');
        if (savedLayout) {
            return JSON.parse(savedLayout);
        }
        // Default fallback with x, y, w, h coordinates
        return [
            { id: 'widget-1', type: 'goal-countdown', x: 0, y: 0, w: 1, h: 1 },
            { id: 'widget-2', type: 'focus-clock', x: 1, y: 0, w: 1, h: 1 },
            { id: 'widget-3', type: 'daily-habits', x: 0, y: 1, w: 1, h: 2 },
            { id: 'widget-4', type: 'weekly-stats', x: 1, y: 1, w: 2, h: 1 }
        ];
    });

    // Auto-save to LocalStorage every time layout changes
    useEffect(() => {
        localStorage.setItem('bento_layout_v2', JSON.stringify(userLayout));
    }, [userLayout]);

    // 3. Sync RGL Data back to our React State
    const handleLayoutSync = (newRglLayout) => {
        setUserLayout(prevLayout => 
            prevLayout.map(widget => {
                const rglData = newRglLayout.find(l => l.i === widget.id);
                // Merge the exact X, Y, W, H from the grid engine back into our React state
                if (rglData) {
                    return { ...widget, x: rglData.x, y: rglData.y, w: rglData.w, h: rglData.h };
                }
                return widget;
            })
        );
    };

    // 4. Handle Widget Toggling (From the Modal)
    const toggleWidget = (widgetType) => {
        const exists = userLayout.find(w => w.type === widgetType);
        if (exists) {
            // Remove it
            setUserLayout(userLayout.filter(w => w.type !== widgetType));
        } else {
            // Add it using RGL coordinate defaults
            setUserLayout([...userLayout, { 
                id: `widget-${Date.now()}`, 
                type: widgetType, 
                x: 0, 
                y: Infinity, // 'Infinity' pushes it to the bottom, RGL gravity sorts it!
                w: 1, 
                h: 1 
            }]);
        }
    };

    return (
        <div className="app-tab">
            <div className="central-column">
                
                <Greetings />

                {/* --- THE EDIT MODE BAR --- */}
                {isEditMode && (
                    <div className="edit-mode-bar glass-panel" style={{ padding: '12px 20px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button 
                            className="text-main-color" 
                            style={{ background: 'none', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => setIsWidgetModalOpen(true)}
                        >
                            + Add / Remove Widgets
                        </button>
                        <button 
                            style={{ background: 'var(--color-primary)', color: '#000', border: 'none', padding: '6px 16px', borderRadius: '16px', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => setIsEditMode(false)}
                        >
                            Done
                        </button>
                    </div>
                )}
                
                {/* The Upgraded RGL Engine */}
                <BentoGrid 
                    layoutConfig={userLayout} 
                    isEditMode={isEditMode} 
                    onLayoutChange={handleLayoutSync} 
                />
                
                {/* Temporary button to trigger edit mode for testing */}
                {!isEditMode && (
                    <button onClick={() => setIsEditMode(true)} style={{ marginTop: '20px', padding: '10px', opacity: 0.5, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '8px', cursor: 'pointer' }}>
                        Enter Edit Mode (Dev)
                    </button>
                )}

            </div>

            {/* --- THE WIDGET SELECTION MODAL --- */}
            <SystemModal 
                isOpen={isWidgetModalOpen}
                onClose={() => setIsWidgetModalOpen(false)}
                onDone={() => setIsWidgetModalOpen(false)}
                title="Manage Widgets"
                subtitle="Select the widgets you want on your dashboard."
            >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {Object.keys(WIDGET_DICTIONARY).map((widgetKey) => {
                        const isActive = userLayout.some(w => w.type === widgetKey);
                        
                        return (
                            <button
                                key={widgetKey}
                                onClick={() => toggleWidget(widgetKey)}
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    border: `1px solid ${isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.2)'}`,
                                    background: isActive ? 'rgba(96, 165, 250, 0.2)' : 'transparent',
                                    color: isActive ? 'var(--color-primary)' : 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                {widgetKey.replace('-', ' ')}
                            </button>
                        );
                    })}
                </div>
            </SystemModal>
            
        </div>
    );
}