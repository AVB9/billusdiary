import React, { useEffect, useState } from 'react';
import { db } from './services/firebase';
import './App.css';

function App() {
  const [dbStatus, setDbStatus] = useState('Checking connection...');

  useEffect(() => {
    try {
      if (!db) {
        throw new Error("Firebase Service not initialized");
      }
      setDbStatus('Firebase Connected');
    } catch (error) {
      setDbStatus(`Error: ${error.message}`);
      console.error("Critical System Failure:", error);
    }
  }, []);

  return (
    <main className="app-container">
      <header className="dashboard-header">
        <h1>Billu's Diary</h1>
        <div className="status-badge">{dbStatus}</div>
      </header>

      <section className="main-content">
        {/*insert feature components here */}
        <p style={{ color: 'var(--text-muted)' }}>Work in Progress...</p>
      </section>
    </main>
  );
}

export default App;