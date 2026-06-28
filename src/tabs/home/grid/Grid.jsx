// src/tabs/home/grid/Grid.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';
import Button from '@mui/material/Button';
import EditGridBar from './EditGridBar';
import EditGridModal from './EditGridModal';
import '@tabs/home/hometab.css';

// =============================================================================
// DEVICE DETECTION
// (pointer: coarse) specifically targets finger/touch as the PRIMARY input.
// Touchscreen laptops still report (pointer: fine) as primary — they get
// the desktop UX. Computed once at module level: synchronous, never changes.
// =============================================================================
const IS_TOUCH = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;


// =============================================================================
// SMART FOCUS RING
// =============================================================================
const SmartFocusRing = () => {
    const ringRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const el = ringRef.current;
        if (!el) return;
        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            // Guard: only update state if dimensions actually changed
            setDimensions(prev =>
                prev.width === width && prev.height === height ? prev : { width, height }
            );
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return <div ref={ringRef} className="smart-focus-ring-container" />;

    const r = 24, rightX = width, bottomY = height, leftX = 0, topY = 0;
    const handleStart = 32, gap = 16;

    const mainRingPath = `
        M ${rightX - handleStart - gap} ${bottomY}
        L ${leftX + r} ${bottomY}
        A ${r} ${r} 0 0 1 ${leftX} ${bottomY - r}
        L ${leftX} ${topY + r}
        A ${r} ${r} 0 0 1 ${leftX + r} ${topY}
        L ${rightX - r} ${topY}
        A ${r} ${r} 0 0 1 ${rightX} ${topY + r}
        L ${rightX} ${bottomY - handleStart - gap}
    `;
    const resizeHandlePath = `
        M ${rightX} ${bottomY - handleStart}
        L ${rightX} ${bottomY - r}
        A ${r} ${r} 0 0 1 ${rightX - r} ${bottomY}
        L ${rightX - handleStart} ${bottomY}
    `;

    return (
        <div ref={ringRef} className="smart-focus-ring-container">
            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                <path d={mainRingPath}     fill="none" stroke="var(--color-main, #60A5FA)"   strokeWidth="3" strokeLinecap="round" />
                <path d={resizeHandlePath} fill="none" stroke="var(--color-accent, #F472B6)" strokeWidth="4" strokeLinecap="round" />
            </svg>
        </div>
    );
};


// =============================================================================
// GRID ENGINE & WORKSPACE MANAGER
// =============================================================================
export default function Grid({
    userLayout = [],
    isEditMode,
    onSave,
    onCancel,
    onEnterEditMode,
    setInspectedWidgetId
}) {
    const [liveLayout,       setLiveLayout]       = useState(userLayout);
    const [layoutMemory,     setLayoutMemory]     = useState({});
    const [isModalOpen,      setIsModalOpen]      = useState(false);
    const [activeWidgetId,   setActiveWidgetId]   = useState(null);
    const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
    const [isResizingGlobal, setIsResizingGlobal] = useState(false);
    const [gridWidth,        setGridWidth]        = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [transitionsOn,    setTransitionsOn]    = useState(false);
    const [isRevealed,       setIsRevealed]       = useState(false);

    const containerRef    = useRef(null);
    const currentWidthRef = useRef(gridWidth);
    const initialLoadDone = useRef(false);

    // =========================================================================
    // SYNC WITH PARENT DB STATE
    // =========================================================================
    useEffect(() => { setLiveLayout(userLayout); }, [userLayout, isEditMode]);

    // =========================================================================
    // HARDWARE BACK BUTTON — MOBILE ONLY
    //
    // WHY TWO EFFECTS:
    // The original single-effect ran cleanup (which called history.back())
    // every time activeWidgetId changed — including when the user simply
    // tapped a different widget. That history.back() fired popstate, which
    // triggered the listener on the newly selected widget and immediately
    // deselected it. You could never hold a selection while switching widgets.
    //
    // The fix: a ref guards against multiple pushes, and the two effects
    // have separate, single responsibilities. No history.back() in cleanup.
    // =========================================================================
    const backHistoryRef = useRef(false); // true while we have an injected entry

    // Effect 1: push one fake history entry the FIRST time a widget is selected
    useEffect(() => {
        if (!IS_TOUCH || !isEditMode) return;

        if (activeWidgetId && !backHistoryRef.current) {
            window.history.pushState({ gridSelection: true }, '');
            backHistoryRef.current = true;
        }

        if (!activeWidgetId) {
            backHistoryRef.current = false;
        }
    }, [activeWidgetId, isEditMode]);

    // Effect 2: stable popstate listener — set up once per edit session
    useEffect(() => {
        if (!IS_TOUCH || !isEditMode) return;

        const onBack = () => {
            setActiveWidgetId(null);
            backHistoryRef.current = false;
        };

        window.addEventListener('popstate', onBack);
        return () => {
            window.removeEventListener('popstate', onBack);
            backHistoryRef.current = false;
        };
    }, [isEditMode]); // Intentionally stable — only re-runs if edit mode changes

    // =========================================================================
    // FLICKER-FREE WIDTH MEASUREMENT
    // =========================================================================
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        let revealTimer;
        const observer = new ResizeObserver(entries => {
            const w = entries[0].contentRect.width;
            if (initialLoadDone.current && Math.abs(currentWidthRef.current - w) < 10) return;
            if (w > 50) {
                currentWidthRef.current = w;
                setTransitionsOn(false);
                setGridWidth(w);
                if (revealTimer) clearTimeout(revealTimer);
                revealTimer = setTimeout(() => {
                    if (!initialLoadDone.current) { setIsRevealed(true); initialLoadDone.current = true; }
                    setTransitionsOn(true);
                }, 80);
            }
        });
        observer.observe(el);
        return () => { observer.disconnect(); if (revealTimer) clearTimeout(revealTimer); };
    }, []);

    // Clean up when exiting edit mode
    useEffect(() => {
        if (!isEditMode) {
            setActiveWidgetId(null);
            setIsDraggingGlobal(false);
            setLayoutMemory({});
        }
    }, [isEditMode]);


    // =========================================================================
    // WIDGET MANAGEMENT (stabilized with useCallback)
    // =========================================================================
    const getOptimumSize = useCallback((widgetType) => {
        const config = WIDGET_DICTIONARY[widgetType];
        if (!config) return { w: 2, h: 2 };
        const useDesktop = !IS_TOUCH && gridWidth >= 768;
        return { w: useDesktop ? config.oDW : config.oMW, h: useDesktop ? config.oDH : config.oMH };
    }, [gridWidth]);

    const handleToggleWidget = useCallback((widgetType) => {
        setLiveLayout(prevLayout => {
            const existing = prevLayout.find(w => w.type === widgetType);
            if (existing) {
                setLayoutMemory(prev => ({ ...prev, [widgetType]: existing }));
                return prevLayout.filter(w => w.type !== widgetType);
            }
            const restored = layoutMemory[widgetType];
            return [...prevLayout, restored || {
                id: `widget-${Date.now()}`, type: widgetType, x: 0, y: 0, ...getOptimumSize(widgetType)
            }];
        });
    }, [layoutMemory, getOptimumSize]);

    const handleResetLayout = useCallback(() => {
        setLiveLayout(prev => prev.map(w => ({ ...w, ...getOptimumSize(w.type), x: 0, y: 0 })));
    }, [getOptimumSize]);

    const handleRglLayoutChange = useCallback((newRgl) => {
        setLiveLayout(prev => prev.map(w => {
            const r = newRgl.find(l => String(l.i) === String(w.id));
            return r ? { ...w, x: r.x, y: r.y, w: r.w, h: r.h } : w;
        }));
    }, []);


    // =========================================================================
    // LAYOUT GENERATION (memoized to prevent expensive RGL recalculations)
    // =========================================================================
    const validItems = useMemo(() =>
        liveLayout.filter(item => item && WIDGET_DICTIONARY[item.type]),
    [liveLayout]);

    const generatedRGLLayout = useMemo(() =>
        validItems.map(item => ({
            i: String(item.id), x: Number(item.x) || 0, y: Number(item.y) || 0,
            w: Number(item.w) || 2, h: Number(item.h) || 2,
            minW: 2, minH: 1, maxW: 12,
            // THE GATE:
            // Desktop → all widgets draggable in edit mode.
            // Touch   → two-tap UX: tap handle to SELECT, tap again to DRAG.
            //           Only the selected widget is draggable (isDraggable: true).
            //           This is reinforced by draggableHandle=".drag-handle" on GridLayout.
            isDraggable: isEditMode && (!IS_TOUCH || activeWidgetId === item.id),
            isResizable: isEditMode && (!IS_TOUCH || activeWidgetId === item.id),
            resizeHandles: ['se']
        })),
    [validItems, isEditMode, activeWidgetId]);


    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================

    // Deselect when tapping the empty grid background
    const handleContainerPointerDown = useCallback((e) => {
        const wrapper = e.target.closest('.react-grid-item');
        if (wrapper) {
            const id = wrapper.getAttribute('data-widget-id');
            if (id && setInspectedWidgetId) setInspectedWidgetId(id);
        } else {
            if (setInspectedWidgetId) setInspectedWidgetId(null);
            // setTimeout pushes state update to end of JS event loop, giving
            // RGL time to finish its native DOM calculations first (prevents
            // the stuck blue dashed box glitch).
            setTimeout(() => setActiveWidgetId(null), 0);
        }
    }, [setInspectedWidgetId]);

    // Select a widget on tap/click
    const handleWidgetPointerDown = useCallback((e, id) => {
        if (!isEditMode) return;

        if (IS_TOUCH) {
            // Touch: ONLY the drag handle pill can select (and later drag) a widget.
            // Tapping the widget body does nothing — scroll shield handles that.
            if (e.target.closest('.drag-handle')) {
                setTimeout(() => setActiveWidgetId(id), 0);
            }
        } else {
            // Desktop: clicking anywhere on the widget body selects it.
            setTimeout(() => setActiveWidgetId(id), 0);
        }
    }, [isEditMode]);


    // =========================================================================
    // RENDER
    // =========================================================================
    const layoutClasses = [
        'layout',
        transitionsOn    ? 'animations-on' : 'animations-off',
        isResizingGlobal ? 'is-resizing'   : '',
        isEditMode       ? 'edit-mode-on'  : '',
        isDraggingGlobal ? 'is-dragging'   : '',
    ].filter(Boolean).join(' ');

    return (
        <div style={{ display: 'contents' }}>
            {isEditMode && (
                <EditGridBar
                    onOpenModal={() => setIsModalOpen(true)}
                    onReset={handleResetLayout}
                    onCancel={onCancel}
                    onSave={() => onSave(liveLayout)}
                />
            )}

            <div
                ref={containerRef}
                style={{ width: '100%', minHeight: '100px', paddingBottom: '40px' }}
                onPointerDownCapture={handleContainerPointerDown}
            >
                {/* ── EMPTY STATE ─────────────────────────────────────────── */}
                {validItems.length === 0 && !isEditMode && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        height: '35vh', border: '2px dashed rgba(255,255,255,0.05)',
                        borderRadius: 'var(--rad-lg, 24px)', marginTop: '20px', animation: 'tabEnter 0.4s ease-out'
                    }}>
                        <p style={{ opacity: 0.6, marginBottom: '20px' }}>Your workspace is empty.</p>
                        <Button variant="contained" color="primary"
                            onClick={() => { onEnterEditMode(); setIsModalOpen(true); }}
                            sx={{ borderRadius: 4, fontWeight: 'bold', color: '#000', px: 3, py: 1.5 }}
                        >
                            Edit Widgets
                        </Button>
                    </div>
                )}

                {/* ── GRID ────────────────────────────────────────────────── */}
                {validItems.length > 0 && gridWidth > 0 && (
                    <GridLayout
                        className={layoutClasses}
                        layout={generatedRGLLayout}
                        width={gridWidth}
                        cols={12} rowHeight={120} margin={[16, 16]} compactType="vertical"
                        useCSSTransforms={true}
                        onLayoutChange={handleRglLayoutChange}
                        onDragStart={() => setIsDraggingGlobal(true)}
                        onDragStop={() => setIsDraggingGlobal(false)}
                        onResizeStart={() => setIsResizingGlobal(true)}
                        onResizeStop={() => setIsResizingGlobal(false)}
                        // Belt-and-suspenders with isDraggable gating above:
                        // draggableHandle ensures even if isDraggable is somehow true,
                        // the drag can still only START from the handle on touch.
                        draggableHandle={IS_TOUCH ? '.drag-handle' : undefined}
                    >
                        {validItems.map((item) => {
                            const WidgetComponent = WIDGET_DICTIONARY[item.type].component;
                            const isSelected = isEditMode && activeWidgetId === item.id;

                            return (
                                <div
                                    key={String(item.id)}
                                    data-widget-id={String(item.id)}
                                    className={isSelected ? 'is-selected' : ''}
                                    style={{ outline: 'none' }}
                                >
                                    <div
                                        className={`widget-glass-wrapper ${isRevealed ? 'revealed' : ''}`}
                                        onPointerDownCapture={(e) => handleWidgetPointerDown(e, item.id)}
                                    >
                                        {/* Block in-widget interactions while editing */}
                                        <div style={{ width: '100%', height: '100%', pointerEvents: isEditMode ? 'none' : 'auto' }}>
                                            <WidgetComponent />
                                        </div>

                                        {/* ── TOUCH ONLY OVERLAYS ─────────────────────────────── */}
                                        {isEditMode && IS_TOUCH && (
                                            <>
                                                {/* SCROLL SHIELD
                                                    Covers entire widget body. No event handlers — completely silent.
                                                    Page scrolls because @media (pointer: coarse) in CSS sets
                                                    touch-action: pan-y on .react-grid-item, which the browser
                                                    honours regardless of JS. The shield just blocks accidental
                                                    taps on widget buttons/inputs below it. */}
                                                <div className="scroll-shield" style={{ position: 'absolute', inset: 0, zIndex: 5 }} />

                                                {/* DRAG HANDLE PILL
                                                    The ONLY interactive surface on touch. First tap selects
                                                    the widget (via handleWidgetPointerDown above). Second tap
                                                    drags it (isDraggable becomes true after first tap).
                                                    .drag-handle { touch-action: none } in CSS gives JS full
                                                    control of the touch so react-draggable can track the gesture. */}
                                                <div
                                                    className="drag-handle"
                                                    style={{
                                                        position: 'absolute',
                                                        top: '12px', left: '50%', transform: 'translateX(-50%)',
                                                        width: '56px', height: '28px', zIndex: 10,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'rgba(255, 255, 255, 0.15)',
                                                        backdropFilter: 'blur(8px)',
                                                        borderRadius: '16px',
                                                        border: '1px solid rgba(255, 255, 255, 0.2)',
                                                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                                    }}
                                                >
                                                    {/* pointerEvents: none forces the browser to target the
                                                        parent div, not individual SVG strokes */}
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                         stroke="rgba(255,255,255,0.8)" strokeWidth="2.5"
                                                         strokeLinecap="round" strokeLinejoin="round"
                                                         style={{ pointerEvents: 'none' }}>
                                                        <circle cx="9"  cy="12" r="1" /><circle cx="9"  cy="5"  r="1" />
                                                        <circle cx="9"  cy="19" r="1" /><circle cx="15" cy="12" r="1" />
                                                        <circle cx="15" cy="5"  r="1" /><circle cx="15" cy="19" r="1" />
                                                    </svg>
                                                </div>
                                            </>
                                        )}

                                        {isSelected && <SmartFocusRing />}
                                    </div>
                                </div>
                            );
                        })}
                    </GridLayout>
                )}
            </div>

            {/* Enter Edit Mode trigger */}
            {validItems.length > 0 && !isEditMode && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <button onClick={onEnterEditMode} style={{
                        padding: '10px 20px', opacity: 0.4, background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.3)', color: 'white',
                        borderRadius: '12px', cursor: 'pointer', fontSize: '0.8rem'
                    }}>
                        Enter Edit Mode
                    </button>
                </div>
            )}

            <EditGridModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                layout={liveLayout}
                onToggle={handleToggleWidget}
            />
        </div>
    );
}