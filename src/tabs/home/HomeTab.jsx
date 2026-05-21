// src/tabs/home/HomeTab.jsx
import React, { useState, useEffect } from 'react';
import Greetings from '@tabs/home/header/Greetings';
import Grid from '@tabs/home/grid/Grid';
import EditWidgetsModal from '@tabs/home/grid/EditWidgetsModal';
import EditBar from '@tabs/home/grid/EditBar';
import DevPanel from '@components/ui/DevPanel'; 
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';
import '@tabs/home/hometab.css';

export default function HomeTab() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
    const [backupLayout, setBackupLayout] = useState([]);
    
    // FIX: Store the ID, not the object. This ensures DevPanel gets live resizing data!
    const [inspectedWidgetId, setInspectedWidgetId] = useState(null); 

    const [userLayout, setUserLayout] = useState(() => {
        const savedLayout = localStorage.getItem('bento_layout_v4');
        return savedLayout ? JSON.parse(savedLayout) : []; 
    });

    // Derive the live widget from the layout array
    const inspectedWidget = userLayout.find(w => w.id === inspectedWidgetId) || null;

    useEffect(() => {
        if (!isEditMode) {
            localStorage.setItem('bento_layout_v4', JSON.stringify(userLayout));
        }
    }, [userLayout, isEditMode]);

    const handleLayoutSync = (newRglLayout) => {
        setUserLayout(prevLayout => 
            prevLayout.map(widget => {
                const rglData = newRglLayout.find(l => l.i === widget.id);
                if (rglData) return { ...widget, x: rglData.x, y: rglData.y, w: rglData.w, h: rglData.h };
                return widget;
            })
        );
    };

    const getOptimumSize = (widgetType) => {
        const config = WIDGET_DICTIONARY[widgetType];
        if (!config) return { w: 2, h: 2 }; 
        return {
            w: window.innerWidth >= 768 ? config.oDW : config.oMW,
            h: window.innerWidth >= 768 ? config.oDH : config.oMH
        };
    };

    const handleResetLayout = () => {
        const resetLayout = userLayout.map(widget => {
            const opt = getOptimumSize(widget.type);
            return { ...widget, w: opt.w, h: opt.h, x: 0, y: 0 };
        });
        setUserLayout(resetLayout);
    };

    const handleEnterEditMode = () => {
        setBackupLayout(userLayout); 
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setUserLayout(backupLayout); 
        setIsEditMode(false);
    };

    return (
        <div className="app-tab">
            <DevPanel 
                selectedWidget={inspectedWidget}
                isEditMode={isEditMode}
                toggleEditMode={isEditMode ? handleCancelEdit : handleEnterEditMode}
            />

            <div className="central-column">
                <Greetings />

                {isEditMode && (
                    <EditBar 
                        onOpenModal={() => setIsWidgetModalOpen(true)}
                        onReset={handleResetLayout}
                        onCancel={handleCancelEdit}
                        onSave={() => setIsEditMode(false)}
                    />
                )}

                <div 
                    style={{ display: 'contents' }} 
                    onPointerDownCapture={(e) => {
                        const targetItem = e.target.closest('.react-grid-item');
                        const textSignature = targetItem?.innerText || '';
                        let deducedType = null;
                        if (/wordle/i.test(textSignature)) deducedType = 'wordle';
                        else if (/goal|countdown/i.test(textSignature)) deducedType = 'goal-countdown';
                        else if (/focus|timer|clock/i.test(textSignature)) deducedType = 'focus-clock';
                        else if (/habit/i.test(textSignature)) deducedType = 'daily-habits';
                        else if (/stat/i.test(textSignature)) deducedType = 'weekly-stats';

                        if (deducedType) {
                            const activeMatch = userLayout.find(w => w.type === deducedType);
                            // Store the ID, not the object snapshot
                            if (activeMatch) setInspectedWidgetId(activeMatch.id);
                        }
                    }}
                >
                    <Grid 
                        layoutConfig={userLayout} 
                        isEditMode={isEditMode} 
                        onLayoutChange={handleLayoutSync} 
                        onAddWidget={() => { 
                            handleEnterEditMode(); 
                            setIsWidgetModalOpen(true); 
                        }} 
                    />
                </div>
                
                {!isEditMode && userLayout.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                        <button onClick={handleEnterEditMode} style={{ padding: '10px 20px', opacity: 0.4, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Enter Edit Mode
                        </button>
                    </div>
                )}
            </div>

            <EditWidgetsModal 
                isOpen={isWidgetModalOpen}
                onClose={() => setIsWidgetModalOpen(false)}
                userLayout={userLayout}
                onSave={setUserLayout}
            />
        </div>
    );
}