// src/tabs/home/grid/Grid.jsx
import React, { useState, useEffect, useRef, useMemo, useCallback, Suspense } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';
import Button from '@mui/material/Button';
import EditGridBar from './EditGridBar';
import EditGridModal from './EditGridModal';
import '@tabs/home/hometab.css';

// =============================================================================
// DEVICE INPUT DETECTION (Strictly for Interaction Mechanics)
// =============================================================================
const IS_TOUCH = typeof window !== 'undefined'
    && window.matchMedia('(pointer: coarse)').matches;

// =============================================================================
// WIDGET ERROR BOUNDARY 
// =============================================================================
class WidgetErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, errorMsg: '' };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, errorMsg: error.message };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', textAlign: 'center',
                    background: 'var(--color-danger-bg)', border: '1px solid var(--color-danger-border)',
                    borderRadius: 'var(--rad-md)', padding: 'var(--pad-md)'
                }}>
                    <span style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</span>
                    <p style={{ color: 'var(--color-danger)', fontSize: '0.8rem', margin: 0, fontWeight: 'bold' }}>Widget Crashed</p>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.65rem', marginTop: '4px' }}>{this.state.errorMsg}</p>
                </div>
            );
        }
        return this.props.children;
    }
}

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
            setDimensions(prev => (prev.width === width && prev.height === height) ? prev : { width, height });
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
                <path d={mainRingPath} fill="none" stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" />
                <path d={resizeHandlePath} fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" />
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
    const backHistoryRef  = useRef(false); 

    const isMobileViewport = gridWidth < 768;

    useEffect(() => { setLiveLayout(userLayout); }, [userLayout, isEditMode]);

    useEffect(() => {
        if (!IS_TOUCH || !isEditMode) return;
        if (activeWidgetId && !backHistoryRef.current) {
            window.history.pushState({ gridSelection: true }, '');
            backHistoryRef.current = true;
        }
        if (!activeWidgetId) backHistoryRef.current = false;
    }, [activeWidgetId, isEditMode]);

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
    }, [isEditMode]); 

    // =========================================================================
    // EDGE AUTO-SCROLLER ENGINE (Physics Loop)
    // =========================================================================
    const edgeScrollLoop = useRef(null);
    const pointerY = useRef(null);

    useEffect(() => {
        // If not dragging, kill the engine
        if (!isDraggingGlobal) {
            if (edgeScrollLoop.current) cancelAnimationFrame(edgeScrollLoop.current);
            pointerY.current = null;
            return;
        }

        // Continually track where the user's finger/mouse currently is
        const handleMove = (e) => {
            pointerY.current = e.touches?.length > 0 ? e.touches[0].clientY : e.clientY;
        };

        const scrollLoop = () => {
            if (pointerY.current !== null) {
                const scrollZone = 120; // Activate scrolling within 120px of top/bottom edges
                const maxSpeed = 20;    // Max pixels per frame
                const { innerHeight } = window;

                if (pointerY.current < scrollZone) {
                    // Scrolling UP: The closer to 0, the higher the intensity
                    const intensity = (scrollZone - pointerY.current) / scrollZone;
                    window.scrollBy(0, -(maxSpeed * intensity));
                } else if (pointerY.current > innerHeight - scrollZone) {
                    // Scrolling DOWN: The closer to the bottom edge, the higher the intensity
                    const intensity = (pointerY.current - (innerHeight - scrollZone)) / scrollZone;
                    window.scrollBy(0, maxSpeed * intensity);
                }
            }
            // Loop infinitely as long as we are dragging
            edgeScrollLoop.current = requestAnimationFrame(scrollLoop);
        };

        window.addEventListener('pointermove', handleMove, { passive: true });
        window.addEventListener('touchmove', handleMove, { passive: true });
        
        // Ignite the engine
        edgeScrollLoop.current = requestAnimationFrame(scrollLoop);

        return () => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('touchmove', handleMove);
            if (edgeScrollLoop.current) cancelAnimationFrame(edgeScrollLoop.current);
        };
    }, [isDraggingGlobal]);

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

    useEffect(() => {
        if (!isEditMode) {
            setActiveWidgetId(null);
            setIsDraggingGlobal(false);
            setLayoutMemory({});
        }
    }, [isEditMode]);

    const getOptimumSize = useCallback((widgetType) => {
        const config = WIDGET_DICTIONARY[widgetType];
        if (!config) return { w: isMobileViewport ? 4 : 2, h: 2 };
        return { 
            w: isMobileViewport ? config.oMW : config.oDW, 
            h: isMobileViewport ? config.oMH : config.oDH 
        };
    }, [isMobileViewport]);

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

    const validItems = useMemo(() =>
        liveLayout.filter(item => item && WIDGET_DICTIONARY[item.type]),
    [liveLayout]);

    const generatedRGLLayout = useMemo(() =>
        validItems.map(item => ({
            i: String(item.id), x: Number(item.x) || 0, y: Number(item.y) || 0,
            w: Number(item.w) || (isMobileViewport ? 4 : 2), h: Number(item.h) || 2,
            minW: isMobileViewport ? 4 : 2,
            minH: 1, 
            maxW: 12,
            isDraggable: isEditMode && (!IS_TOUCH || activeWidgetId === item.id),
            isResizable: isEditMode && (!IS_TOUCH || activeWidgetId === item.id),
            resizeHandles: ['se']
        })),
    [validItems, isEditMode, activeWidgetId, isMobileViewport]);

    const handleContainerPointerDown = useCallback((e) => {
        const wrapper = e.target.closest('.react-grid-item');
        if (wrapper) {
            const id = wrapper.getAttribute('data-widget-id');
            if (id && setInspectedWidgetId) setInspectedWidgetId(id);
        } else {
            if (setInspectedWidgetId) setInspectedWidgetId(null);
            setTimeout(() => setActiveWidgetId(null), 0);
        }
    }, [setInspectedWidgetId]);

    const handleWidgetPointerDown = useCallback((e, id) => {
        if (!isEditMode) return;
        if (IS_TOUCH) {
            if (e.target.closest('.drag-handle')) {
                setTimeout(() => setActiveWidgetId(id), 0);
            }
        } else {
            setTimeout(() => setActiveWidgetId(id), 0);
        }
    }, [isEditMode]);

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
                {validItems.length === 0 && !isEditMode && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        height: '35vh', border: '1px dashed var(--color-glass-border)',
                        borderRadius: 'var(--rad-lg)', marginTop: '20px', animation: 'tabEnter 0.4s ease-out'
                    }}>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>Your workspace is empty.</p>
                        <Button variant="contained" 
                            onClick={() => { onEnterEditMode(); setIsModalOpen(true); }}
                            sx={{ borderRadius: 'var(--rad-pill)', fontWeight: 'bold', background: 'var(--color-primary)', color: '#000', px: 3, py: 1.5 }}
                        >
                            Edit Widgets
                        </Button>
                    </div>
                )}

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
                                        <div style={{ width: '100%', height: '100%', pointerEvents: isEditMode ? 'none' : 'auto' }}>
                                            <WidgetErrorBoundary>
                                                <Suspense fallback={<div style={{ width: '100%', height: '100%', background: 'var(--color-glass-bg)', borderRadius: 'var(--rad-md)' }} />}>
                                                    <WidgetComponent />
                                                </Suspense>
                                            </WidgetErrorBoundary>
                                        </div>

                                        {isEditMode && IS_TOUCH && (
                                            <>
                                                <div className="scroll-shield" style={{ position: 'absolute', inset: 0, zIndex: 5 }} />
                                                <div
                                                    className="drag-handle"
                                                    style={{
                                                        position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)',
                                                        width: '56px', height: '28px', zIndex: 10,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        background: 'var(--color-glass-white)', backdropFilter: 'var(--blur-glass)',
                                                        borderRadius: 'var(--rad-pill)', border: '1px solid var(--color-glass-border)',
                                                        boxShadow: 'var(--shadow-sm)',
                                                    }}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                                         stroke="var(--color-text)" strokeWidth="2.5"
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

            {validItems.length > 0 && !isEditMode && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px' }}>
                    <button onClick={onEnterEditMode} style={{
                        padding: '10px 20px', background: 'transparent',
                        border: '1px solid var(--color-glass-border)', color: 'var(--color-text-muted)',
                        borderRadius: 'var(--rad-md)', cursor: 'pointer', fontSize: '0.8rem',
                        transition: 'var(--trans-fast)'
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