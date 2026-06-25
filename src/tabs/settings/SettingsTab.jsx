import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import GlassPanel from '@components/ui/GlassPanel';
import { PrimaryButton, SecondaryButton } from '@components/ui/Button';
import { useThemeManager } from '../../hooks/useThemeManager';

// Extracted styles for clean JSX
const styles = {
    container: {
        p: 3, display: 'flex', flexDirection: 'column', gap: 3, 
        maxWidth: '600px', margin: '0 auto', animation: 'fadeIn 0.3s ease'
    },
    colorRow: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        p: 2, borderRadius: 'var(--rad-md)', 
        background: 'rgba(255,255,255,0.03)'
    },
    colorInput: {
        width: '50px', height: '50px', border: 'none', 
        borderRadius: '50%', cursor: 'pointer', padding: 0,
        backgroundColor: 'transparent'
    }
};

export default function SettingsTab() {
    const { theme, previewColor, saveTheme, applyPreset } = useThemeManager();

    return (
        <Box sx={styles.container}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Appearance
            </Typography>

            <GlassPanel sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Custom Colors
                </Typography>

                <Stack spacing={2}>
                    {/* PRIMARY COLOR PICKER */}
                    <Box sx={styles.colorRow}>
                        <Typography sx={{ fontWeight: 700 }}>Accent Color</Typography>
                        <input 
                            type="color" 
                            value={theme.primary} 
                            onChange={(e) => previewColor('primary', e.target.value)}
                            style={styles.colorInput}
                        />
                    </Box>

                    {/* BACKGROUND COLOR PICKER */}
                    <Box sx={styles.colorRow}>
                        <Typography sx={{ fontWeight: 700 }}>Background</Typography>
                        <input 
                            type="color" 
                            value={theme.bg} 
                            onChange={(e) => previewColor('bg', e.target.value)}
                            style={styles.colorInput}
                        />
                    </Box>

                    {/* TEXT COLOR PICKER */}
                    <Box sx={styles.colorRow}>
                        <Typography sx={{ fontWeight: 700 }}>Text Color</Typography>
                        <input 
                            type="color" 
                            value={theme.text} 
                            onChange={(e) => previewColor('text', e.target.value)}
                            style={styles.colorInput}
                        />
                    </Box>
                </Stack>

                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <PrimaryButton onClick={saveTheme} sx={{ px: 4 }}>
                        Save Theme
                    </PrimaryButton>
                </Box>
            </GlassPanel>

            {/* PRESETS (Optional but great for UX) */}
            <GlassPanel sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 2, textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Quick Presets
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <SecondaryButton onClick={() => applyPreset('dark')}>Default Dark</SecondaryButton>
                    <SecondaryButton onClick={() => applyPreset('light')}>Clean Light</SecondaryButton>
                    <SecondaryButton onClick={() => applyPreset('hacker')}>Terminal</SecondaryButton>
                </Box>
            </GlassPanel>
        </Box>
    );
}