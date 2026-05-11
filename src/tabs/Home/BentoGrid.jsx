import React, { useState, useEffect } from 'react';
import GridLayout, { useContainerWidth } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { WIDGET_DICTIONARY } from '../../widgets/WidgetRegistry';

// 1. THE FLUID RESIZE HANDLE
const CustomResizeHandle = React.forwardRef((props, ref) => {
    const { handleAxis, ...restProps } = props;
    return (
        <div 
            ref={ref}
            className={`react-resizable-handle react-resizable-handle-${handleAxis}`}
            {...restProps}
            style={{
                position: 'absolute', right: '10px', bottom: '10px', zIndex: 50,
                width: '28px', height: '28px', 
                backgroundColor: 'var(--color-primary, #60A5FA)', 
                borderRadius: '50%', cursor: 'nwse-resize', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.5)', touchAction: 'none'
            }}
        >
            {/* Minimal SVG */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="21 15 21 21 15 21"></polyline>
                <line x1="21" y1="21" x2="13" y2="13"></line>
            </svg>
        </div>
    );
});

export default function BentoGrid({ layoutConfig, isEditMode, onLayoutChange }) {
    const [activeWidgetId, setActiveWidgetId] = useState(null);
    const { width, containerRef, mounted } = useContainerWidth();

    useEffect(() => {
        if (!isEditMode) setActiveWidgetId(null);
    }, [isEditMode]);

    // 2. RAW, UNRESTRICTED RGL LAYOUT
    const generateRGLLayout = () => {
        return layoutConfig.map((item) => ({
            i: item.id,
            x: item.x, 
            y: item.y, 
            w: item.w, 
            h: item.h,
            // Only rule: Don't let it disappear completely
            minW: 2, minH: 1,
            isDraggable: isEditMode,
            // Show handles ONLY on the widget the user tapped
            isResizable: isEditMode && activeWidgetId === item.id,
            resizeHandles: ['se']
        }));
    };

    return (
        <div style={{ padding: '0 0 40px 0' }} ref={containerRef}>
            {mounted && (
                <GridLayout
                    className="layout"
                    layout={generateRGLLayout()}
                    width={width} 
                    cols={4}
                    rowHeight={120}
                    margin={[16, 16]}
                    compactType="vertical" // Gravity
                    useCSSTransforms={true} // GPU Animation
                    resizeHandle={<CustomResizeHandle />}
                    
                    // NATIVE SAVING: No math required, just pass it up!
                    onLayoutChange={onLayoutChange}
                >
                    {layoutConfig.map((item) => {
                        const WidgetComponent = WIDGET_DICTIONARY[item.type]?.component;
                        if (!WidgetComponent) return null;

                        const isSelected = isEditMode && activeWidgetId === item.id;

                        return (
                            <div 
                                key={item.id} 
                                onClick={() => isEditMode && setActiveWidgetId(item.id)}
                            >
                                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                    
                                    {/* Widget Content Wrapper */}
                                    <div style={{ width: '100%', height: '100%', pointerEvents: isEditMode ? 'none' : 'auto' }}>
                                        <WidgetComponent />
                                    </div>

                                    {/* Selection Ring (Appears when you tap it in edit mode) */}
                                    {isSelected && (
                                        <div style={{
                                            position: 'absolute', inset: 0, zIndex: 4,
                                            border: '2px solid rgba(96, 165, 250, 0.6)', 
                                            borderRadius: 'var(--rad-lg, 24px)',
                                            pointerEvents: 'none'
                                        }} />
                                    )}

                                </div>
                            </div>
                        );
                    })}
                </GridLayout>
            )}
        </div>
    );
}