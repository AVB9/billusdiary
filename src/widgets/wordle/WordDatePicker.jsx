// src/widgets/wordle/WordDatePicker.jsx
import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import GlassPanel from '@components/ui/GlassPanel';
import dayjs from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';

export default function WordDatePicker({ value, onChange, disableFuture, getWordForDate }) {
    const [open, setOpen] = useState(false);
    const containerRef = useRef(null);

    // Timezone-proof parsing
    const parseLocal = (val) => {
        if (typeof val === 'string' && val.includes('-')) {
            const [y, m, d] = val.split('-').map(Number);
            return dayjs(new Date(y, m - 1, d));
        }
        return dayjs(val).startOf('day');
    };

    const currentValue = parseLocal(value);
    const today = dayjs().startOf('day');
    const targetDay = currentValue;
    const isToday = targetDay.isSame(today, 'day');

    const dateStr = targetDay.format('YYYY-MM-DD');
    const { status, word } = getWordForDate(dateStr);

    // THE FIX: Gracefully handle the word whether it's a legacy primitive string 
    // or the new {word, definition} dictionary object!
    const displayWord = typeof word === 'object' && word !== null ? word.word : word;

    let topText = displayWord;
    let textDecoration = 'none';
    let textOpacity = 1;

    if (status === 'unplayed' && isToday) {
        topText = 'TODAY';
    } else if (status === 'unplayed' && !isToday) {
        topText = '????';
    } else if (status === 'revealed') {
        textDecoration = 'line-through';
        textOpacity = 0.6;
    }

    const bottomText = currentValue.format('MMM D').toUpperCase();

    const handlePrevDay = (e) => { 
        e.stopPropagation(); 
        onChange(currentValue.subtract(1, 'day').format('YYYY-MM-DD')); 
    };
    
    const handleNextDay = (e) => {
        e.stopPropagation();
        if (disableFuture && isToday) return;
        onChange(currentValue.add(1, 'day').format('YYYY-MM-DD'));
    };

    return (
        <div ref={containerRef} style={{ position: 'relative', width: 'fit-content' }}>
            <style>
                {`.glass-date-arrow { background: transparent; border: none; padding: 0 4px; margin: 0; color: var(--color-text-main, #FFFFFF); font-size: 1.6rem; cursor: pointer; transition: color 0.15s ease; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transform: translateY(-2px); } .glass-date-arrow:hover:not(:disabled) { color: var(--color-primary, #EF4444); } .glass-date-arrow:disabled { color: var(--color-text-muted, rgba(255,255,255,0.4)); cursor: default; }`}
            </style>
            <GlassPanel style={{ display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'space-between', borderRadius: '50px', padding: '2px 6px', boxSizing: 'border-box', minWidth: '110px' }}>
                <button type="button" onClick={handlePrevDay} className="glass-date-arrow">‹</button>
                <Box onClick={() => setOpen(true)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexGrow: 1, margin: '0 4px', transition: 'opacity 0.15s ease', '&:hover': { opacity: 0.8 } }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '0.85rem', color: 'var(--color-text)', textDecoration, opacity: textOpacity, lineHeight: 1.1 }}>{topText}</Typography>
                    <Typography sx={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--color-primary)', mt: 0.25, lineHeight: 1 }}>{bottomText}</Typography>
                </Box>
                <button type="button" onClick={handleNextDay} disabled={disableFuture && isToday} className="glass-date-arrow">›</button>
            </GlassPanel>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <MuiDatePicker
                    open={open} onClose={() => setOpen(false)} value={currentValue}
                    onChange={(newValue) => { 
                        if (newValue) onChange(newValue.format('YYYY-MM-DD')); 
                        setOpen(false); 
                    }}
                    disableFuture={disableFuture}
                    slotProps={{
                        textField: { sx: { position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' } },
                        popper: { anchorEl: containerRef.current, sx: { zIndex: 10000 } },
                        desktopPaper: {
                            className: 'glass-panel', 
                            sx: {
                                mt: 1, backgroundImage: 'none', borderRadius: '16px', padding: '8px',
                                '& .MuiPickersCalendarHeader-root': { color: 'var(--color-text-main, #FFFFFF)', mt: 1 },
                                '& .MuiIconButton-root': { color: 'var(--color-primary, #EF4444)' },
                                '& .MuiDayCalendar-weekDayLabel': { color: 'var(--color-text-muted)', fontWeight: 'bold' },
                                '& .MuiPickersDay-root': { color: 'var(--color-text-main, #FFFFFF)', fontWeight: 'bold', '&:hover': { backgroundColor: 'var(--color-glass-white, rgba(255,255,255,0.1))' } },
                                '& .Mui-selected': { backgroundColor: 'var(--color-primary, #EF4444) !important', color: 'var(--color-text-on-primary, #000000)', fontWeight: 900 },
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