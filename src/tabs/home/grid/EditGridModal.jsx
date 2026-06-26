// src/tabs/home/grid/Grid.jsx
import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';
import Button from '@mui/material/Button';
import EditGridBar from './EditGridBar';
import EditGridModal from './EditGridModal';
import '@tabs/home/hometab.css'; 

// ============================================================================
// THE DYNAMIC SVG FOCUS RING
// ============================================================================
const SmartFocusRing = () => {
    const ringRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        if (!ringRef.current) return;
        const observer = new ResizeObserver(entries => {
            setDimensions({
                width: entries[0].contentRect.width,
                height: entries[0].contentRect.height
            });
        });
        observer.observe(ringRef.current);
        return () => observer.disconnect();
    }, []);

    const { width, height } = dimensions;
    if (width === 0 || height === 0) return <div ref={ringRef} className="smart-focus-ring-container" />;

    const r = 24; 
    const rightX = width;
    const bottomY = height;
    const leftX = 0;
    const topY = 0;
    const handleStart = 32; 
    const gap = 16; 

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
                <path d={mainRingPath} fill="none" stroke="var(--color-main, #60A5FA)" strokeWidth="3" strokeLinecap="round" />
                <path d={resizeHandlePath} fill="none" stroke="var(--color-accent, #F472B6)" strokeWidth="4" strokeLinecap="round" />
            </svg>
        </div>
    );
};

// ============================================================================
// THE GRID ENGINE & WORKSPACE MANAGER
// ============================================================================
export default function Grid({ 
    userLayout = [], 
    isEditMode, 
    onSave, 
    onCancel, 
    onEnterEditMode,
    setInspectedWidgetId
}) {
    // Acts as the drafting area during edit mode
    const [liveLayout, setLiveLayout] = useState(userLayout);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const [activeWidgetId, setActiveWidgetId] = useState(null);
    const [gridWidth, setGridWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
    const [transitionsOn, setTransitionsOn] = useState(false);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isResizingGlobal, setIsResizingGlobal] = useState(false);
    
    const containerRef = useRef(null);
    const currentWidthRef = useRef(gridWidth);
    const initialLoadDone = useRef(false);

    // Sync liveLayout with parent DB state when exiting edit mode
    useEffect(() => {
        setLiveLayout(userLayout);
    }, [userLayout, isEditMode]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        let revealTimer;
        const updateWidth = (newWidth) => {
            if (initialLoadDone.current && Math.abs(currentWidthRef.current - newWidth) < 10) return;

            if (newWidth > 50) {
                currentWidthRef.current = newWidth;
                setTransitionsOn(false); 
                setGridWidth(newWidth);  
                
                if (revealTimer) clearTimeout(revealTimer);
                revealTimer = setTimeout(() => {
                    if (!initialLoadDone.current) {
                        setIsRevealed(true);
                        initialLoadDone.current = true;
                    }
                    setTransitionsOn(true);
                }, 80); 
            }
        };

        const observer = new ResizeObserver(entries => updateWidth(entries[0].contentRect.width));
        if (el.offsetWidth > 50) updateWidth(el.offsetWidth);
        observer.observe(el);
        
        return () => {
            observer.disconnect();
            if (revealTimer) clearTimeout(revealTimer);
        };
    }, []);

    useEffect(() => {
        if (!isEditMode) setActiveWidgetId(null);
    }, [isEditMode]);

    // ============================================================================
    // WIDGET MANAGEMENT LOGIC
    // ============================================================================
    const getOptimumSize = (widgetType) => {
        const config = WIDGET_DICTIONARY[widgetType];
        if (!config) return { w: 2, h: 2 }; 
        return {
            w: window.innerWidth >= 768 ? config.oDW : config.oMW,
            h: window.innerWidth >= 768 ? config.oDH : config.oMH
        };
    };

    const handleToggleWidget = (widgetType) => {
        const exists = liveLayout.find(w => w.type === widgetType);
        if (exists) {
            setLiveLayout(liveLayout.filter(w => w.type !== widgetType));
        } else {
            const opt = getOptimumSize(widgetType);
            setLiveLayout([...liveLayout, { 
                id: `widget-${Date.now()}`, 
                type: widgetType, 
                x: 0, y: 0, 
                w: opt.w, h: opt.h 
            }]);
        }
    };

    const handleResetLayout = () => {
        const resetLayout = liveLayout.map(widget => {
            const opt = getOptimumSize(widget.type);
            return { ...widget, w: opt.w, h: opt.h, x: 0, y: 0 };
        });
        setLiveLayout(resetLayout);
    };

    const handleRglLayoutChange = (newRglLayout) => {
        setLiveLayout(prevLayout => 
            prevLayout.map(widget => {
                const rglData = newRglLayout.find(l => String(l.i) === String(widget.id));
                if (rglData) return { ...widget, x: rglData.x, y: rglData.y, w: rglData.w, h: rglData.h };
                return widget;
            })
        );
    };

    const validItems = liveLayout.filter(item => item && WIDGET_DICTIONARY[item.type]);

    const generateRGLLayout = () => {
        return validItems.map((item) => ({
            i: String(item.id), x: Number(item.x) || 0, y: Number(item.y) || 0,
            w: Number(item.w) || 2, h: Number(item.h) || 2,
            minW: 2, minH: 1, maxW: 12,
            isDraggable: isEditMode, isResizable: isEditMode && activeWidgetId === item.id,
            resizeHandles: ['se']
        }));
    };

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
                onPointerDownCapture={(e) => {
                    const targetWrapper = e.target.closest('.react-grid-item');
                    if (targetWrapper) {
                        const widgetId = targetWrapper.getAttribute('data-widget-id');
                        if (widgetId && setInspectedWidgetId) setInspectedWidgetId(widgetId);
                    } else {
                        if (setInspectedWidgetId) setInspectedWidgetId(null);
                    }
                }}
            >
                {validItems.length === 0 && !isEditMode && (
                    <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        height: '35vh', border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 'var(--rad-lg, 24px)',
                        marginTop: '20px', animation: 'tabEnter 0.4s ease-out'
                    }}>
                        <p style={{ opacity: 0.6, marginBottom: '20px' }}>Your workspace is empty.</p>
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={onEnterEditMode}
                            sx={{ borderRadius: 4, fontWeight: 'bold', color: '#000', px: 3, py: 1.5 }}
                        >
                            Edit Widgets
                        </Button>
                    </div>
                )}

                {validItems.length > 0 && gridWidth > 0 && (
                    <GridLayout
                        className={`layout ${transitionsOn ? 'animations-on' : 'animations-off'} ${isResizingGlobal ? 'is-resizing' : ''} ${isEditMode ? 'edit-mode-on' : ''}`}
                        layout={generateRGLLayout()}
                        width={gridWidth}
                        cols={12} rowHeight={120} margin={[16, 16]} compactType="vertical"
                        useCSSTransforms={true} 
                        onLayoutChange={handleRglLayoutChange}
                        onResizeStart={() => setIsResizingGlobal(true)}
                        onResizeStop={() => setIsResizingGlobal(false)}
                    >
                        {validItems.map((item) => {
                            const WidgetComponent = WIDGET_DICTIONARY[item.type].component;
                            const isSelected = isEditMode && activeWidgetId === item.id;

                            return (
                                <div 
                                    key={String(item.id)} 
                                    data-widget-id={String(item.id)} 
                                    onPointerDown={() => isEditMode && setActiveWidgetId(item.id)} 
                                    style={{ outline: 'none' }}
                                >
                                    <div className={`widget-glass-wrapper ${isRevealed ? 'revealed' : ''}`}>
                                        <div style={{ width: '100%', height: '100%', pointerEvents: isEditMode ? 'none' : 'auto' }}>
                                            <WidgetComponent />
                                        </div>
                                        {isSelected && <SmartFocusRing />}
                                    </div>
                                </div>
                            );
                        })}
                    </GridLayout>
                )}
            </div>

            <EditGridModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                layout={liveLayout}
                onToggle={handleToggleWidget}
            />
        </div>
    );
}