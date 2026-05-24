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

    const [livePixels, setLivePixels] = useState({ widgetW: 0, widgetH: 0, contentW: 0, contentH: 0 });
    const [telemetry, setTelemetry] = useState({ renders: 0, mountTime: 0, view: 'unknown', syncScope: 'unknown' });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [copyText, setCopyText] = useState('COPY');
    
    // NEW: Dev Notes State
    const [devNote, setDevNote] = useState('');

    useEffect(() => {
        if (!selectedWidget) return;
        const handleTelemetry = (e) => {
            if (e.detail.type === selectedWidget.type) setTelemetry(e.detail.data);
        };
        window.addEventListener('widget_telemetry_uplink', handleTelemetry);
        return () => window.removeEventListener('widget_telemetry_uplink', handleTelemetry);
    }, [selectedWidget]);

    useEffect(() => {
        if (!selectedWidget) return;
        
        // 1. Load existing note for this specific widget (The missing lines!)
        const savedNote = localStorage.getItem(`dev_note_${selectedWidget.type}`);
        setDevNote(savedNote || '');

        const gridItems = document.querySelectorAll('.react-grid-item');
        let targetNode = null;
        
        gridItems.forEach(item => {
            if (item.innerText.toLowerCase().includes(selectedWidget.type.replace('-', ' '))) {
                targetNode = item;
            }
        });

        if (!targetNode) return;

        // 2. Grab the exact nodes
        const outerNode = targetNode.querySelector('.widget-outer-area') || targetNode;
        const contentNode = targetNode.querySelector('.widget-content-area') || targetNode;

        const observer = new ResizeObserver(() => {
            // Measure the exact sub-pixel rects whenever EITHER node shifts
            const outerRect = outerNode.getBoundingClientRect();
            const contentRect = contentNode.getBoundingClientRect();

            setLivePixels({
                widgetW: outerRect.width.toFixed(2),
                widgetH: outerRect.height.toFixed(2),
                contentW: contentRect.width.toFixed(2),
                contentH: contentRect.height.toFixed(2)
            });
        });

        // 3. Explicitly observe the inner content node, not just the outer grid shell
        observer.observe(outerNode);
        observer.observe(contentNode); 

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

    const handleCopyDimensions = () => {
        const textToCopy = `Widget: ${widgetName}\nGrid Span: [ ${selectedWidget?.w} × ${selectedWidget?.h} ]\nWidget Area: ${livePixels.widgetW}w × ${livePixels.widgetH}h\nContent Area: ${livePixels.contentW}w × ${livePixels.contentH}h`;
        navigator.clipboard.writeText(textToCopy);
        setCopyText('COPIED!');
        setTimeout(() => setCopyText('COPY'), 2000);
    };

    // NEW: Handle Note Auto-Save
    const handleNoteChange = (e) => {
        const val = e.target.value;
        setDevNote(val);
        if (selectedWidget) {
            localStorage.setItem(`dev_note_${selectedWidget.type}`, val);
        }
    };

    const widgetName = WIDGET_DICTIONARY[selectedWidget?.type]?.name || selectedWidget?.type;

    const TelemetryRow = ({ label, value, valueColor = '#60A5FA' }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: valueColor, textAlign: 'right' }}>{value}</span>
        </Box>
    );

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
            {/* HEADER */}
            <Box 
                onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
                sx={{ 
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                    mb: isCollapsed ? 0 : 1, pb: isCollapsed ? 0 : 1, 
                    cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none', 
                    borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.05)',
                }}
            >
                <Typography variant="caption" sx={{ fontWeight: 900, letterSpacing: '1px', color: '#60A5FA', textTransform: 'uppercase' }}>
                    DEV PANEL ⠿
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button 
                        size="small" onClick={() => setIsCollapsed(!isCollapsed)}
                        sx={{ 
                            minWidth: '28px', width: '28px', height: '28px', p: 0, fontSize: '1.2rem', fontWeight: 'bold', 
                            lineHeight: 1, borderRadius: '8px', color: 'white', background: 'rgba(255,255,255,0.1)'
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

            {/* BODY */}
            {!isCollapsed && (
                <Box sx={{ animation: 'fadeIn 0.2s ease-in-out', mt: 1 }}>
                    {selectedWidget ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, letterSpacing: '2px', color: '#10B981', textTransform: 'uppercase' }}>
                                    {widgetName}
                                </Typography>
                            </Box>

                            {/* DIMENSIONS BLOCK */}
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)', position: 'relative' }}>
                                <Button 
                                    onClick={handleCopyDimensions}
                                    sx={{ position: 'absolute', top: 8, right: 8, fontSize: '0.6rem', fontWeight: 'bold', color: 'white', background: 'rgba(255,255,255,0.1)', minWidth: 0, p: '2px 6px', borderRadius: '4px' }}
                                >
                                    {copyText}
                                </Button>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', mb: 1, display: 'block' }}>DIMENSIONS</Typography>
                                <TelemetryRow label="Grid Span" value={`[ ${selectedWidget.w} × ${selectedWidget.h} ]`} />
                                <TelemetryRow label="Widget Area (px)" value={`${livePixels.widgetW} × ${livePixels.widgetH}`} valueColor="#E5E7EB" />
                                <TelemetryRow label="Content Area (px)" value={`${livePixels.contentW} × ${livePixels.contentH}`} valueColor="#10B981" />
                            </Box>

                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <TelemetryRow label="Render Count" value={telemetry.renders || 1} valueColor="#F59E0B" />
                                <TelemetryRow label="Mount Latency" value={`${telemetry.mountTime || 0}ms`} valueColor="#F59E0B" />
                                <Box sx={{ height: '1px', background: 'rgba(255,255,255,0.1)', my: 1 }} />
                                <TelemetryRow label="Active State" value={`'${telemetry.view || 'unknown'}'`} valueColor="#A78BFA" />
                            </Box>

                            {/* DEV NOTES BLOCK */}
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', mb: 1, display: 'block' }}>DEV NOTES</Typography>
                                <textarea 
                                    value={devNote}
                                    onChange={handleNoteChange}
                                    placeholder={`Notes for ${widgetName}...`}
                                    style={{
                                        width: '100%',
                                        minHeight: '60px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        color: '#A78BFA',
                                        fontFamily: 'monospace',
                                        fontSize: '0.75rem',
                                        padding: '8px',
                                        resize: 'vertical',
                                        outline: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                />
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
        </Box>
    );
}