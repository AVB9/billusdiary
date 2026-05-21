// src/components/ui/DatePicker.jsx
import React, { useState, useRef } from 'react';
import Typography from '@mui/material/Typography';

// Import your custom UI components
import GlassPanel from '@components/ui/GlassPanel';

// MUI Imports
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';

export default function DatePicker({ value, onChange, disableFuture }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    const currentValue = dayjs(value);
    
    const today = dayjs().startOf('day');
    const targetDay = currentValue.startOf('day');
    const isToday = targetDay.isSame(today);

    const getDisplayText = () => {
        if (targetDay.isSame(today)) return "Today";
        if (targetDay.isSame(today.subtract(1, 'day'))) return "Yesterday";
        if (targetDay.isSame(today.add(1, 'day'))) return "Tomorrow";
        return currentValue.format('MMM D');
    };

    const handlePrevDay = (e) => {
        e.stopPropagation();
        onChange(currentValue.subtract(1, 'day').toDate());
    };

    const handleNextDay = (e) => {
        e.stopPropagation();
        if (disableFuture && isToday) return;
        onChange(currentValue.add(1, 'day').toDate());
    };

    return (
        // 1. OUTER WRAPPER: fit-content forces it to ignore parent stretching
        <div ref={containerRef} style={{ 
            position: 'relative', 
            width: 'fit-content', 
        }}>
            
            <style>
                {`
                .glass-date-arrow {
                    background: transparent;
                    border: none;
                    color: var(--color-text-main, #FFFFFF);
                    font-size: 1.6rem;
                    padding: 0 4px; 
                    margin: 0;
                    cursor: pointer;
                    transition: color 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    transform: translateY(-2px); 
                }
                .glass-date-arrow:hover:not(:disabled) {
                    color: var(--color-primary, #EF4444);
                }
                .glass-date-arrow:disabled {
                    color: var(--color-text-muted, rgba(255,255,255,0.4));
                    cursor: default;
                }
                `}
            </style>

            {/* 2. CUSTOM GLASS PANEL WRAPPER */}
            <GlassPanel style={{ 
                display: 'flex', 
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: 'center', 
                justifyContent: 'space-between', 
                borderRadius: '50px',
                padding: '2px 10px',
                boxSizing: 'border-box',
                minWidth: '150px' 
            }}>
                <button type="button" onClick={handlePrevDay} className="glass-date-arrow">‹</button>
                
                <Typography 
                    onClick={() => setOpen(true)} 
                    sx={{ 
                        fontWeight: 900, 
                        letterSpacing: '1px', 
                        color: 'var(--color-text-main, #FFFFFF)', 
                        fontSize: '0.9rem',
                        textTransform: 'uppercase', 
                        cursor: 'pointer', 
                        textAlign: 'center',
                        whiteSpace: 'nowrap', 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexGrow: 1, 
                        margin: '0 8px',
                        transition: 'color 0.15s ease',
                        '&:hover': { color: 'var(--color-primary, #EF4444)' }
                    }}
                >
                    {getDisplayText()}
                </Typography>
                
                <button 
                    type="button" 
                    onClick={handleNextDay} 
                    disabled={disableFuture && isToday}
                    className="glass-date-arrow"
                >›</button>
            </GlassPanel>

            {/* HIDDEN MUI ENGINE */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MuiDatePicker
                    open={open}
                    onClose={() => setOpen(false)}
                    value={currentValue}
                    onChange={(newValue) => {
                        if (newValue) onChange(newValue.toDate());
                        setOpen(false); 
                    }}
                    disableFuture={disableFuture}
                    slotProps={{
                        textField: { sx: { position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' } },
                        popper: {
                            anchorEl: containerRef.current,
                            sx: { zIndex: 10000 }
                        },
                        desktopPaper: {
                            className: 'glass-panel', 
                            sx: {
                                mt: 1, 
                                backgroundImage: 'none', 
                                borderRadius: '16px',
                                padding: '8px',
                                '& .MuiPickersCalendarHeader-root': { color: 'var(--color-text-main, #FFFFFF)', mt: 1 },
                                '& .MuiIconButton-root': { color: 'var(--color-primary, #EF4444)' },
                                '& .MuiDayCalendar-weekDayLabel': { color: 'var(--color-text-muted)', fontWeight: 'bold' },
                                '& .MuiPickersDay-root': { 
                                    color: 'var(--color-text-main, #FFFFFF)', fontWeight: 'bold',
                                    '&:hover': { backgroundColor: 'var(--color-glass-white, rgba(255,255,255,0.1))' }
                                },
                                '& .Mui-selected': { 
                                    backgroundColor: 'var(--color-primary, #EF4444) !important', 
                                    color: 'var(--color-text-on-primary, #000000)', fontWeight: 900
                                },
                                '& .MuiPickersDay-today': { border: '1px solid var(--color-primary, #EF4444)' },
                                '& .Mui-disabled': { color: 'var(--color-text-muted, rgba(255,255,255,0.2))' },
                                '& .MuiPickersYear-yearButton': { color: 'var(--color-text-main, #FFFFFF)', '&:hover': { background: 'var(--color-glass-white, rgba(255,255,255,0.1))' } },
                                '& .MuiPickersYear-yearButton.Mui-selected': { background: 'var(--color-primary, #EF4444) !important', color: 'black' },
                                '& .MuiPickersMonth-monthButton': { color: 'var(--color-text-main, #FFFFFF)', '&:hover': { background: 'var(--color-glass-white, rgba(255,255,255,0.1))' } },
                                '& .MuiPickersMonth-monthButton.Mui-selected': { background: 'var(--color-primary, #EF4444) !important', color: 'black' }
                            }
                        }
                    }}
                />
            </LocalizationProvider>
        </div>
    );
}