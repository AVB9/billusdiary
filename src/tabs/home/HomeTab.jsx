// src/tabs/home/HomeTab.jsx
import React, { useState, useEffect } from 'react';
import Greetings from '@tabs/home/header/Greetings';
import Grid from '@tabs/home/grid/Grid';
import EditGridModal from '@tabs/home/grid/EditGridModal';
import EditGridBar from '@tabs/home/grid/EditGridBar';
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';
import { getHomeLayout, saveHomeLayout } from '@services/db'; 
import '@tabs/home/hometab.css';

export default function HomeTab({ uid }) { 
    const [isEditMode, setIsEditMode] = useState(false);
    const [isWidgetModalOpen, setIsWidgetModalOpen] = useState(false);
    
    const [isLoadingLayout, setIsLoadingLayout] = useState(true); 
    const [userLayout, setUserLayout] = useState([]);
    const [backupLayout, setBackupLayout] = useState([]);
    
    const [inspectedWidgetId, setInspectedWidgetId] = useState(null); 
    const inspectedWidget = userLayout.find(w => String(w.id) === String(inspectedWidgetId)) || null;

    // ========================================================================
    // 1. FIREBASE INITIAL FETCH
    // ========================================================================
    useEffect(() => {
        if (!uid) return;
        
        const loadLayoutFromFirebase = async () => {
            const savedLayout = await getHomeLayout(uid);
            setUserLayout(savedLayout);
            setIsLoadingLayout(false);
        };
        
        loadLayoutFromFirebase();
    }, [uid]);

    // ========================================================================
    // 2. DEV PANEL SYNC & LISTENERS
    // ========================================================================
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('DEV_PANEL_SYNC', {
            detail: { selectedWidget: inspectedWidget, isEditMode } 
        }));
    }, [inspectedWidget, isEditMode]);

    useEffect(() => {
        const handleToggle = () => {
            setIsEditMode(prev => {
                if (!prev) {
                    setBackupLayout(userLayout);
                    return true;
                }
                return false;
            });
        };
        window.addEventListener('DEV_PANEL_TOGGLE_EDIT', handleToggle);
        return () => window.removeEventListener('DEV_PANEL_TOGGLE_EDIT', handleToggle);
    }, [userLayout]); 

    // ========================================================================
    // 3. LAYOUT HANDLERS & FIREBASE SAVING
    // ========================================================================
    const handleLayoutSync = (newRglLayout) => {
        setUserLayout(prevLayout => 
            prevLayout.map(widget => {
                const rglData = newRglLayout.find(l => String(l.i) === String(widget.id));
                if (rglData) return { ...widget, x: rglData.x, y: rglData.y, w: rglData.w, h: rglData.h };
                return widget;
            })
        );
    };

    const handleSaveEditMode = async () => {
        setIsEditMode(false);
        await saveHomeLayout(uid, userLayout);
    };

    const handleCancelEditMode = () => {
        setUserLayout(backupLayout); 
        setIsEditMode(false);
        setInspectedWidgetId(null);
    };

    const handleModalSave = async (newLayout) => {
        setUserLayout(newLayout);
        await saveHomeLayout(uid, newLayout);
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

    return (
        <div className="app-tab">
            <div className="central-column">
                {/* 1. Greetings loads INSTANTLY */}
                <Greetings />

                {/* 2. Show the Grid Loader OR the actual Grid depending on Firebase */}
                {isLoadingLayout ? (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        height: '35vh', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 'var(--rad-lg, 24px)',
                        marginTop: '20px', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}>
                        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }`}</style>
                        <p style={{ opacity: 0.4, fontWeight: 600, letterSpacing: '1px', fontSize: '0.85rem' }}>
                            LOADING WORKSPACE...
                        </p>
                    </div>
                ) : (
                    <>
                        {isEditMode && (
                            <EditGridBar 
                                onOpenModal={() => setIsWidgetModalOpen(true)}
                                onReset={handleResetLayout}
                                onCancel={handleCancelEditMode}
                                onSave={handleSaveEditMode}
                            />
                        )}

                        <div 
                            style={{ display: 'contents' }} 
                            onPointerDownCapture={(e) => {
                                const targetWrapper = e.target.closest('.react-grid-item');
                                if (targetWrapper) {
                                    const widgetId = targetWrapper.getAttribute('data-widget-id');
                                    if (widgetId) {
                                        setInspectedWidgetId(widgetId);
                                    } else {
                                        console.warn("DEV PANEL WARNING: Clicked a widget, but the 'data-widget-id' attribute is missing on the Grid item wrapper!");
                                    }
                                } else {
                                    setInspectedWidgetId(null);
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
                                <button 
                                    onClick={handleEnterEditMode} 
                                    style={{ padding: '10px 20px', opacity: 0.4, background: 'transparent', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem' }}
                                >
                                    Enter Edit Mode
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            <EditGridModal 
                isOpen={isWidgetModalOpen}
                onClose={() => setIsWidgetModalOpen(false)}
                userLayout={userLayout}
                onSave={handleModalSave} 
            />
        </div>
    );
}