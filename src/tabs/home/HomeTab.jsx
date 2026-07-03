// src/tabs/home/HomeTab.jsx
import React, { useState, useEffect } from 'react';
import Greetings from '@tabs/home/header/Greetings';
import Grid from '@tabs/home/grid/Grid';
import { getHomeLayout, saveHomeLayout } from './homedb'; // co-located, use relative
import '@tabs/home/hometab.css';

// Device detection implemented to route Firebase calls to the correct nested layout field
const IS_TOUCH = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;

export default function HomeTab({ uid }) {

    const [isEditMode,       setIsEditMode]       = useState(false);
    const [isLoadingLayout,  setIsLoadingLayout]  = useState(true);
    const [userLayout,       setUserLayout]       = useState([]);
    const [backupLayout,     setBackupLayout]     = useState([]);

    // DevPanel telemetry: tracks which widget is currently tapped
    const [inspectedWidgetId, setInspectedWidgetId] = useState(null);
    const inspectedWidget = userLayout.find(
        w => String(w.id) === String(inspectedWidgetId)
    ) || null;

    // =========================================================================
    // 1. FIREBASE: Load layout on mount (runs once per uid)
    // =========================================================================
    useEffect(() => {
        if (!uid) return;
        (async () => {
            // Passed IS_TOUCH to fetch the correct device layout
            const savedLayout = await getHomeLayout(uid, IS_TOUCH);
            setUserLayout(savedLayout);
            setIsLoadingLayout(false);
        })();
    }, [uid]);

    // =========================================================================
    // 2. DEV PANEL: Broadcast selected widget + edit mode state upward
    // =========================================================================
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('DEV_PANEL_SYNC', {
            detail: { selectedWidget: inspectedWidget, isEditMode }
        }));
    }, [inspectedWidget, isEditMode]);

    // Dev panel "Enter Edit / Exit Edit" toggle button
    useEffect(() => {
        const handleToggle = () => {
            setIsEditMode(prev => {
                if (!prev) setBackupLayout(userLayout); // snapshot before entering
                return !prev;
            });
        };
        window.addEventListener('DEV_PANEL_TOGGLE_EDIT', handleToggle);
        return () => window.removeEventListener('DEV_PANEL_TOGGLE_EDIT', handleToggle);
    }, [userLayout]); // re-bind on every layout change so snapshot is fresh

    // =========================================================================
    // 3. EDIT MODE CALLBACKS — passed down to Grid, never called directly here
    // =========================================================================

    // Grid calls this with finalLayout when the user clicks "Save"
    const handleSave = async (finalLayout) => {
        setUserLayout(finalLayout);
        setIsEditMode(false);
        // Passed IS_TOUCH to save the layout to the correct device field
        await saveHomeLayout(uid, finalLayout, IS_TOUCH);
    };

    // Grid calls this when the user clicks "Cancel"
    const handleCancel = () => {
        setUserLayout(backupLayout); // revert to pre-edit snapshot
        setIsEditMode(false);
        setInspectedWidgetId(null);
    };

    // Grid calls this from the empty-state "Edit Widgets" button
    const handleEnterEditMode = () => {
        setBackupLayout(userLayout);
        setIsEditMode(true);
    };

    // =========================================================================
    // 4. RENDER
    // =========================================================================
    return (
        <div className="app-tab">
            <div className="central-column">

                {/* Greetings is intentionally outside the loading gate — renders instantly */}
                <Greetings />

                {isLoadingLayout ? (
                    <div style={{
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent: 'center',
                        height:         '35vh',
                        marginTop:      '20px',
                        border:         '2px dashed rgba(255,255,255,0.05)',
                        borderRadius:   'var(--rad-lg, 24px)',
                        animation:      'htPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                    }}>
                        {/* Scoped keyframe so it doesn't pollute global CSS */}
                        <style>{`
                            @keyframes htPulse {
                                0%, 100% { opacity: 1; }
                                50%       { opacity: .4; }
                            }
                        `}</style>
                        <p style={{
                            margin:       0,
                            opacity:      0.4,
                            fontWeight:   600,
                            fontSize:     '0.85rem',
                            letterSpacing:'1px'
                        }}>
                            LOADING WORKSPACE...
                        </p>
                    </div>
                ) : (
                    /*
                     * Grid owns everything below this point:
                     * — EditGridBar (edit mode toolbar)
                     * — EditGridModal (widget picker)
                     * — liveLayout draft state
                     * — RGL physics engine
                     * — "Enter Edit Mode" button (populated, non-edit state)
                     *
                     * HomeTab only owns Firebase load/save and the edit mode flag.
                     */
                    <Grid
                        userLayout={userLayout}
                        isEditMode={isEditMode}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onEnterEditMode={handleEnterEditMode}
                        setInspectedWidgetId={setInspectedWidgetId}
                    />
                )}
            </div>
        </div>
    );
}