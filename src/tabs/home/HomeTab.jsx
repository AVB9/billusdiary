//.src/tabs/home/HomeTab.jsx
import React, { useState, useEffect } from 'react';
import Greetings from '@tabs/home/header/Greetings';
import Grid from '@tabs/home/grid/Grid';
import EditWidgetsModal from '@tabs/home/grid/EditWidgetsModal';
import EditBar from '@tabs/home/grid/EditBar';
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';
import '@tabs/home/hometab.css';

export default function HomeTab() {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
    const [backupLayout, setBackupLayout] = useState([]);

    const [userLayout, setUserLayout] = useState(() => {
        const savedLayout = localStorage.getItem('bento_layout_v4');
        return savedLayout ? JSON.parse(savedLayout) : []; 
    });

    useEffect(() => {
        if (!isEditMode) {
            localStorage.setItem('bento_layout_v4', JSON.stringify(userLayout));
        }
    }, [userLayout, isEditMode]);

    const handleLayoutSync = (newRglLayout) => {
        setUserLayout(prevLayout => 
            prevLayout.map(widget => {
                const rglData = newRglLayout.find(l => l.i === widget.id);
                if (rglData) {
                    return { ...widget, x: rglData.x, y: rglData.y, w: rglData.w, h: rglData.h };
                }
                return widget;
            })
        );
    };

    // --- OPTIMUM LAYOUT ENGINE ---
    const getOptimumSize = (widgetType) => {
        const config = WIDGET_DICTIONARY[widgetType];
        if (!config) return { w: 2, h: 2 }; 
        
        const isDesktop = window.innerWidth >= 768; 
        return {
            w: isDesktop ? config.oDW : config.oMW,
            h: isDesktop ? config.oDH : config.oMH
        };
    };

    // --- RESET LAYOUT ENGINE ---
    const handleResetLayout = () => {
        const resetLayout = userLayout.map(widget => {
            const opt = getOptimumSize(widget.type);
            return { ...widget, w: opt.w, h: opt.h, x: 0, y: 0 };
        });
        setUserLayout(resetLayout);
    };

    const toggleWidget = (widgetType) => {
        const exists = userLayout.find(w => w.type === widgetType);
        if (exists) {
            setUserLayout(userLayout.filter(w => w.type !== widgetType));
        } else {
            const opt = getOptimumSize(widgetType);
            setUserLayout([...userLayout, { 
                id: `widget-${Date.now()}`, 
                type: widgetType, 
                x: 0, y: 0, 
                w: opt.w, h: opt.h 
            }]);
        }
    };

    const handleEnterEditMode = () => {
        setBackupLayout(userLayout); 
        setIsEditMode(true);
    };

    const handleCancelEdit = () => {
        setUserLayout(backupLayout); 
        setIsEditMode(false);
    };

    const handleSaveEdit = () => {
        setIsEditMode(false);
    };

    return (
        <div className="app-tab">
            <div className="central-column">
                
                <Greetings />

                {/* 1. THE EDIT BAR */}
                {isEditMode && (
                    <EditBar 
                        onOpenModal={() => setIsWidgetModalOpen(true)}
                        onReset={handleResetLayout}
                        onCancel={handleCancelEdit}
                        onSave={handleSaveEdit}
                    />
                )}

                {/* 2. THE GRID (Now manages its own empty state natively) */}
                <Grid 
                    layoutConfig={userLayout} 
                    isEditMode={isEditMode} 
                    onLayoutChange={handleLayoutSync} 
                    onAddWidget={() => { 
                        handleEnterEditMode(); 
                        setIsWidgetModalOpen(true); 
                    }} 
                />
                
                {/* 3. THE DEV BUTTON */}
                {!isEditMode && userLayout.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                        <button onClick={handleEnterEditMode} style={{ padding: '10px 20px', opacity: 0.4, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem' }}>
                            Enter Edit Mode
                        </button>
                    </div>
                )}

            </div>

            {/* 4. THE MODAL */}
            <EditWidgetsModal 
                isOpen={isWidgetModalOpen}
                onClose={() => setIsWidgetModalOpen(false)}
                userLayout={userLayout}
                onSave={setUserLayout}
            />
        </div>
    );
}