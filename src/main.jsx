// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css'; 
import './components/components.css';
import './designsys.css'; 
// 1. Import MUI Theme Engine
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 2. Create the "Billu's Diary" Master Theme
// We use the exact hex codes from your designsys.css so MUI's internal math 
// (for ripples, hovers, and contrast) works perfectly.
const billuTheme = createTheme({
    palette: {
        mode: 'dark', 
        primary: {
            main: '#ff3b3b', // Matches --color-primary
        },
        background: {
            default: '#0a0a0a', // Matches --color-bg
            paper: '#1a1a1a',   // Matches --color-surface
        },
        text: {
            primary: '#ffffff',   // Matches --color-text
            secondary: '#888888', // Matches --color-text-muted
        }
    },
    shape: {
        borderRadius: 20, // Matches --rad-lg
    },
    typography: {
        fontFamily: "'Nova Flat', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 3. Wrap the app! CssBaseline applies the background colors to the <body> */}
    <ThemeProvider theme={billuTheme}>
        <CssBaseline />
        <App />
    </ThemeProvider>
  </React.StrictMode>
);