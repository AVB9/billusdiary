// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // 1. Import Router
import App from './App.jsx';
import './index.css'; 
import './components/components.css';
import './designsys.css'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const billuTheme = createTheme({
    palette: { mode: 'dark', primary: { main: '#ff3b3b' }, background: { default: '#0a0a0a', paper: '#1a1a1a' }, text: { primary: '#ffffff', secondary: '#888888' } },
    shape: { borderRadius: 20 },
    typography: { fontFamily: "'Nova Flat', sans-serif" },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={billuTheme}>
        <CssBaseline />
        {/* 2. Wrap App with BrowserRouter */}
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);