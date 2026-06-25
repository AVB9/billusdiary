// src/components/dev/DevPanel.jsx
import React, { useState, useRef, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// FIREBASE
import { auth, db } from '../../services/firebase';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { loginWithGoogle, loginAsGuest, logoutUser } from '../../services/auth';

export default function DevPanel({ user }) {
    // UI State
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isFocused, setIsFocused] = useState(false); 

    // Auth State
    const [newName, setNewName] = useState('');
    const [isAuthLoading, setIsAuthLoading] = useState(false);

    // Global Widget State
    const [selectedWidget, setSelectedWidget] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);

    // Telemetry State
    const [livePixels, setLivePixels] = useState({ widgetW: 0, widgetH: 0, contentW: 0, contentH: 0 });
    const [telemetry, setTelemetry] = useState({ renders: 0, mountTime: 0, view: 'unknown', syncScope: 'unknown' });
    const [devNote, setDevNote] = useState('');

    // ==========================================
    // INVISIBLE EVENT LISTENERS
    // ==========================================
    useEffect(() => {
        const handleSync = (e) => {
            if (e.detail.selectedWidget !== undefined) setSelectedWidget(e.detail.selectedWidget);
            if (e.detail.isEditMode !== undefined) setIsEditMode(e.detail.isEditMode);
        };
        window.addEventListener('DEV_PANEL_SYNC', handleSync);
        return () => window.removeEventListener('DEV_PANEL_SYNC', handleSync);
    }, []);

    const triggerEditModeToggle = () => {
        window.dispatchEvent(new CustomEvent('DEV_PANEL_TOGGLE_EDIT'));
    };

    // ==========================================
    // AUTH CONTROLS
    // ==========================================
    const handleSpawnTestUser = async () => {
        setIsAuthLoading(true);
        try {
            await logoutUser(); 
            const newUser = await loginAsGuest();
            const randomName = `TestUser_${Math.floor(Math.random() * 1000)}`;
            await updateProfile(newUser, { displayName: randomName });
            await setDoc(doc(db, "users", newUser.uid), { profile: { displayName: randomName } }, { merge: true });
        } catch (error) { console.error(error); } 
        finally { setIsAuthLoading(false); }
    };

    const handleUpdateName = async () => {
        if (!newName.trim() || !user) return;
        setIsAuthLoading(true);
        try {
            await updateProfile(auth.currentUser, { displayName: newName });
            await setDoc(doc(db, "users", user.uid), { profile: { displayName: newName } }, { merge: true });
            setNewName("");
            alert(`Name updated to: ${newName}`);
        } catch (error) { console.error(error); } 
        finally { setIsAuthLoading(false); }
    };

    // ==========================================
    // TELEMETRY & DOM MEASUREMENT
    // ==========================================
    useEffect(() => {
        const handleTelemetry = (e) => {
            if (selectedWidget && e.detail.type !== selectedWidget.type) return;
            setTelemetry(e.detail.data);
        };
        window.addEventListener('widget_telemetry_uplink', handleTelemetry);
        return () => window.removeEventListener('widget_telemetry_uplink', handleTelemetry);
    }, [selectedWidget]);

    useEffect(() => {
        if (!selectedWidget) return;
        setDevNote(localStorage.getItem(`dev_note_${selectedWidget.type}`) || '');

        // THE FIX: Directly select the exact node using the ID passed from HomeTab!
        const targetNode = document.querySelector(`[data-widget-id="${selectedWidget.id}"]`);

        if (!targetNode) return;
        
        const outerNode = targetNode.querySelector('.widget-outer-area') || targetNode;
        const contentNode = targetNode.querySelector('.widget-content-area') || targetNode;

        const observer = new ResizeObserver(() => {
            setLivePixels({
                widgetW: outerNode.getBoundingClientRect().width.toFixed(2), 
                widgetH: outerNode.getBoundingClientRect().height.toFixed(2),
                contentW: contentNode.getBoundingClientRect().width.toFixed(2), 
                contentH: contentNode.getBoundingClientRect().height.toFixed(2)
            });
        });

        observer.observe(outerNode); 
        observer.observe(contentNode); 
        
        return () => observer.disconnect();
    }, [selectedWidget]);

    const handleNoteChange = (e) => {
        setDevNote(e.target.value);
        if (selectedWidget) localStorage.setItem(`dev_note_${selectedWidget.type}`, e.target.value);
    };

    // ==========================================
    // DRAG LOGIC
    // ==========================================
    const handlePointerDown = (e) => {
        if (['BUTTON', 'INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
        e.target.setPointerCapture(e.pointerId);
    };
    const handlePointerMove = (e) => isDragging && setPosition({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
    const handlePointerUp = (e) => { setIsDragging(false); e.target.releasePointerCapture(e.pointerId); };

    const TelemetryRow = ({ label, value, color = '#60A5FA' }) => (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, fontSize: '0.75rem', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color, textAlign: 'right' }}>{value}</span>
        </Box>
    );

    return (
        <Box sx={{
            position: 'fixed', top: position.y, left: position.x, zIndex: 99999,
            width: '320px', background: 'rgba(15, 15, 15, 0.85)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
            boxShadow: isDragging ? '0 16px 48px rgba(0,0,0,0.7)' : '0 8px 32px rgba(0,0,0,0.5)',
            p: 2, color: 'white', touchAction: 'none'
        }}>
            {/* HEADER */}
            <Box onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: isCollapsed ? 0 : 1, cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}>
                <Typography variant="caption" sx={{ fontWeight: 900, color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '1px' }}>DEV PANEL ⠿</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button size="small" onClick={() => setIsCollapsed(!isCollapsed)} sx={{ minWidth: '28px', p: 0, color: 'white', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}>{isCollapsed ? '+' : '−'}</Button>
                    <Button size="small" onClick={triggerEditModeToggle} sx={{ fontSize: '0.65rem', fontWeight: 'bold', textTransform: 'none', color: isEditMode ? '#000' : 'white', background: isEditMode ? '#60A5FA' : 'transparent', border: isEditMode ? 'none' : '1px solid rgba(255,255,255,0.2)', borderRadius: '6px' }}>
                        {isEditMode ? 'Exit Edit' : 'Enter Edit'}
                    </Button>
                </Box>
            </Box>

            {!isCollapsed && (
                <Box sx={{ 
                    mt: 1, maxHeight: '80vh', overflowY: 'auto', pr: 0.5,
                    '&::-webkit-scrollbar': { width: '4px' },
                    '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }
                }}>
                    
                    {/* SECTION 1: AUTHENTICATION */}
                    <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)', mb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', mb: 1, display: 'block', opacity: 0.7 }}>USER & AUTH</Typography>
                        <TelemetryRow label="Status" value={user ? 'Logged In' : 'Logged Out'} color={user ? "#10B981" : "#EF4444"} />
                        <TelemetryRow label="Name" value={user?.displayName || 'Anonymous'} color="#E5E7EB" />
                        <TelemetryRow label="UID" value={user?.uid ? `${user.uid.substring(0,6)}...` : 'N/A'} color="#A78BFA" />

                        {user && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1.5, mb: 2 }}>
                                <input 
                                    type="text" 
                                    placeholder="Update name..." 
                                    value={newName} 
                                    onChange={e => setNewName(e.target.value)}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    style={{ 
                                        flex: 1, padding: '6px 10px', background: 'rgba(0,0,0,0.5)', 
                                        color: 'white', fontSize: '0.75rem', outline: 'none',
                                        border: `1px solid ${isFocused ? '#10B981' : 'rgba(255,255,255,0.1)'}`, 
                                        borderRadius: '6px', transition: 'border 0.2s ease'
                                    }} 
                                />
                                <Button 
                                    onClick={handleUpdateName} 
                                    disabled={isAuthLoading || !newName.trim()} 
                                    sx={{ 
                                        background: newName.trim() ? '#10B981' : 'rgba(255,255,255,0.1)', 
                                        color: newName.trim() ? '#000' : 'rgba(255,255,255,0.3)', 
                                        p: '4px 12px', minWidth: 0, borderRadius: '6px',
                                        fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'none',
                                        transition: 'all 0.2s', '&:hover': { background: newName.trim() ? '#059669' : 'rgba(255,255,255,0.2)' }
                                    }}
                                >
                                    {isAuthLoading ? '...' : 'Save'}
                                </Button>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button 
                                onClick={handleSpawnTestUser} 
                                disabled={isAuthLoading} 
                                sx={{ fontSize: '0.7rem', textTransform: 'none', color: 'white', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', py: 0.5, borderRadius: '6px', '&:hover': { background: 'rgba(255,255,255,0.1)' } }}
                            >
                                + Spawn Test User
                            </Button>
                            {user ? (
                                <Button 
                                    onClick={logoutUser} 
                                    sx={{ fontSize: '0.7rem', textTransform: 'none', color: '#EF4444', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', py: 0.5, borderRadius: '6px', '&:hover': { background: 'rgba(239, 68, 68, 0.2)' } }}
                                >
                                    Logout
                                </Button>
                            ) : (
                                <Button onClick={loginWithGoogle} sx={{ fontSize: '0.7rem', color: 'black', background: '#60A5FA', py: 0.5, borderRadius: '6px' }}>Login with Google</Button>
                            )}
                        </Box>
                    </Box>

                    {/* SECTION 2: TELEMETRY */}
                    {selectedWidget ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1, border: '1px inset rgba(255,255,255,0.05)', textAlign: 'center' }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#10B981', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '1px' }}>{selectedWidget.type}</Typography>
                            </Box>
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <TelemetryRow label="Grid Span" value={`[ ${selectedWidget.w} × ${selectedWidget.h} ]`} />
                                <TelemetryRow label="Widget Area" value={`${livePixels.widgetW} × ${livePixels.widgetH}`} color="#E5E7EB" />
                                <TelemetryRow label="Content Area" value={`${livePixels.contentW} × ${livePixels.contentH}`} color="#10B981" />
                            </Box>
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <TelemetryRow label="Render Count" value={telemetry.renders || 1} color="#F59E0B" />
                                <TelemetryRow label="Active State" value={`'${telemetry.view || 'unknown'}'`} color="#A78BFA" />
                            </Box>
                            <Box sx={{ background: 'rgba(0,0,0,0.4)', borderRadius: '8px', p: 1.5, border: '1px inset rgba(255,255,255,0.05)' }}>
                                <textarea value={devNote} onChange={handleNoteChange} placeholder="Developer notes..." style={{ width: '100%', minHeight: '60px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', color: '#A78BFA', padding: '8px', outline: 'none', resize: 'vertical', fontSize: '0.75rem' }} />
                            </Box>
                        </Box>
                    ) : (
                        <Box sx={{ p: 2, textAlign: 'center', opacity: 0.4 }}>
                            <Typography variant="caption" sx={{ fontStyle: 'italic' }}>Standalone Mode / No Grid Widget Selected</Typography>
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
}