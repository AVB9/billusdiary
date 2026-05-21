// src/components/ui/DevPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { WIDGET_DICTIONARY } from '@widgets/WidgetRegistry';

export default function DevPanel({ selectedWidget, isEditMode, toggleEditMode }) {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    const [livePixels, setLivePixels] = useState({ width: 0, height: 0 });
    const [telemetry, setTelemetry] = useState({ renders: 0, mountTime: 0, view: 'unknown', syncScope: 'unknown' });
    
    // NEW: State to track if the panel is minimized
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (!selectedWidget) return;

        const handleTelemetry = (e) => {
            const { type, data } = e.detail;
            if (type === selectedWidget.type) {
                setTelemetry(data);
            }
        };

        window.addEventListener('widget_telemetry_uplink', handleTelemetry);
        return () => window.removeEventListener('widget_telemetry_uplink', handleTelemetry);
    }, [selectedWidget]);

    useEffect(() => {
        if (!selectedWidget) return;
        const gridItems = document.querySelectorAll('.react-grid-item');
        let targetNode = null;
        
        gridItems.forEach(item => {
            if (item.innerText.toLowerCase().includes(selectedWidget.type.replace('-', ' '))) {
                targetNode = item;
            }
        });

        if (!targetNode) return;

        const observer = new ResizeObserver(([entry]) => {
            setLivePixels({
                width: Math.round(entry.contentRect.width),
                height: Math.round(entry.contentRect.height)
            });
        });

        observer.observe(targetNode);
        return () => observer.disconnect();
    }, [selectedWidget]);

    const handlePointerDown = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDragging) return;
        setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    };

    const handlePointerUp = (e) => {
        setIsDragging(false);
        e.target.releasePointerCapture(e.pointerId);
    };

    const minW_px = (WIDGET_DICTIONARY[selectedWidget?.type]?.minW || 2) * 50; 
    const isSquished = livePixels.width > 0 && livePixels.width < minW_px;

    const TelemetryRow = ({ label, value, valueColor = '#60A5FA' }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.75rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: valueColor }}>{value}</span>
        </Box>
    );

    const widgetName = WIDGET_DICTIONARY[selectedWidget?.type]?.name || selectedWidget?.type;

    return (
        <Box sx={{
            position: 'fixed', top: `${position.y}px`, left: `${position.x}px`, zIndex: 9999,
            width: '320px', background: 'rgba(15, 15, 15, 0.7)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
            boxShadow: isDragging ? '0 16px 48px rgba(0, 0, 0, 0.7)' : '0 8px 32px rgba(0, 0, 0, 0.5)',
            p: 2, color: 'white', touchAction: 'none',
            transition: isDragging ? 'none' : 'box-shadow 0.2s ease, transform 0.1s ease',
            transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        }}>
            {/* HEADER / DRAG HANDLE */}
            <Box 
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
                sx={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    mb: isCollapsed ? 0 : 1, // Remove margin when minimized
                    pb: isCollapsed ? 0 : 1, // Remove padding when minimized
                    cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', 
                    borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.05)', // Hide line when minimized
                    transition: 'all 0.2s ease'
                }}
            >
                <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '1px', color: '#60A5FA', textTransform: 'uppercase' }}>
                    DEV PANEL ⠿
                </Typography>
                
                {/* ACTIONS CONTAINER */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {/* COLLAPSE BUTTON */}
                    <Button 
                        size="small" 
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        sx={{ 
                            minWidth: '28px', width: '28px', height: '28px', p: 0,
                            fontSize: '1.2rem', fontWeight: 'bold', lineHeight: 1,
                            borderRadius: '8px', color: 'white', 
                            background: 'rgba(255,255,255,0.1)', 
                            '&:hover': { background: 'rgba(255,255,255,0.2)' }
                        }}
                    >
                        {isCollapsed ? '+' : '−'}
                    </Button>

                    <Button 
                        size="small" variant={isEditMode ? "contained" : "outlined"} onClick={toggleEditMode}
                        sx={{ fontSize: '0.65rem', fontWeight: 'bold', py: 0.5, px: 1, borderRadius: '8px', color: isEditMode ? '#000' : 'white', background: isEditMode ? '#60A5FA' : 'transparent' }}
                    >
                        {isEditMode ? 'Exit Edit' : 'Enter Edit'}
                    </Button>
                </Box>
            </Box>

            {/* CONDITIONAL BODY RENDER */}
            {!isCollapsed && (
                <Box sx={{ animation: 'fadeIn 0.2s ease-in-out', mt: 1 }}>
                    {selectedWidget ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, letterSpacing: '2px', color: '#10B981', textTransform: 'uppercase' }}>
                                    {widgetName}
                                </Typography>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.4)' }}>
                                    ID: {selectedWidget.id}
                                </Typography>
                            </Box>

                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <TelemetryRow label="Grid Spans [W × H]" value={`[ ${selectedWidget.w} × ${selectedWidget.h} ]`} />
                            </Box>

                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <TelemetryRow label="Rendered Size (px)" value={`${livePixels.width}w × ${livePixels.height}h`} />
                                <TelemetryRow 
                                    label="Safety Status" 
                                    value={isSquished ? '[ SQUISHED ]' : '[ SAFE ]'} 
                                    valueColor={isSquished ? '#EF4444' : '#10B981'} 
                                />
                            </Box>

                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <TelemetryRow label="Render Count" value={telemetry.renders || 1} valueColor="#F59E0B" />
                                <TelemetryRow label="Mount Latency (ms)" value={`${telemetry.mountTime || 0}ms`} valueColor="#F59E0B" />
                                <Box sx={{ height: '1px', background: 'rgba(255,255,255,0.1)', my: 1 }} />
                                <TelemetryRow label="Active State View" value={`'${telemetry.view || 'unknown'}'`} valueColor="#A78BFA" />
                                <TelemetryRow label="Sync Scope" value={telemetry.syncScope || 'ISOLATED_SOLO'} valueColor="#A78BFA" />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 3, textAlign: 'center', border: '1px inset rgba(255,255,255,0.05)' }}>
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                                Click a widget to intercept telemetry...
                            </Typography>
                        </Box>
                    )}
                </Box>
            )}
            
            {/* INLINE ANIMATION KEYFRAMES */}
            <style>
                {`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                `}
            </style>
        </Box>
    );
}