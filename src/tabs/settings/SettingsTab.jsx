import React, { useState, useEffect } from 'react';

const SettingsTab = () => {
  const [userName, setUserName] = useState('');
  const [isOLEDTheme, setIsOLEDTheme] = useState(false);
  const [accentColor, setAccentColor] = useState('#ff3b3b');
  const [textColor, setTextColor] = useState('#ffffff');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedName = localStorage.getItem('userDisplayName') || '';
    const savedOLED = localStorage.getItem('themeOLED') === 'true';
    const savedAccent = localStorage.getItem('appAccentColor') || '#ff3b3b';
    const savedText = localStorage.getItem('appTextColor') || '#ffffff';

    setUserName(savedName);
    setIsOLEDTheme(savedOLED);
    setAccentColor(savedAccent);
    setTextColor(savedText);

    // Apply theme
    applyTheme(savedOLED, savedAccent, savedText);
  }, []);

  const applyTheme = (oled, accent, text) => {
    document.documentElement.style.setProperty('--color-bg', oled ? '#000000' : '#0a0a0a');
    document.documentElement.style.setProperty('--color-surface', oled ? '#0a0a0a' : '#1a1a1a');
    document.documentElement.style.setProperty('--color-primary', accent);
    document.documentElement.style.setProperty('--color-text', text);
  };

  const saveUserName = () => {
    if (userName.trim()) {
      localStorage.setItem('userDisplayName', userName.trim());
    } else {
      localStorage.removeItem('userDisplayName');
    }
    alert('Name saved!');
  };

  const toggleOLEDTheme = () => {
    const newOLED = !isOLEDTheme;
    setIsOLEDTheme(newOLED);
    localStorage.setItem('themeOLED', newOLED);
    applyTheme(newOLED, accentColor, textColor);
  };

  const updateAccentColor = (color) => {
    setAccentColor(color);
    localStorage.setItem('appAccentColor', color);
    applyTheme(isOLEDTheme, color, textColor);
  };

  const updateTextColor = (color) => {
    setTextColor(color);
    localStorage.setItem('appTextColor', color);
    applyTheme(isOLEDTheme, accentColor, color);
  };

  const exportDataToFile = () => {
    const data = {
      userDisplayName: localStorage.getItem('userDisplayName'),
      themeOLED: localStorage.getItem('themeOLED'),
      appAccentColor: localStorage.getItem('appAccentColor'),
      appTextColor: localStorage.getItem('appTextColor'),
      appCustomBg: localStorage.getItem('appCustomBg'),
      plannerTargets: localStorage.getItem('plannerTargets'),
      plannerCompleted: localStorage.getItem('plannerCompleted'),
      momentumHabits: localStorage.getItem('momentumHabits'),
      appSubjects: localStorage.getItem('appSubjects'),
      todoData: {}
    };

    // Get all todo data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('todo_')) {
        data.todoData[key] = localStorage.getItem(key);
      }
    }

    const dataStr = JSON.stringify(data, null, 2);
    setExportData(dataStr);
    setShowExportModal(true);
  };

  const importData = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        // Import settings
        if (data.userDisplayName) localStorage.setItem('userDisplayName', data.userDisplayName);
        if (data.themeOLED !== undefined) localStorage.setItem('themeOLED', data.themeOLED);
        if (data.appAccentColor) localStorage.setItem('appAccentColor', data.appAccentColor);
        if (data.appTextColor) localStorage.setItem('appTextColor', data.appTextColor);
        if (data.appCustomBg) localStorage.setItem('appCustomBg', data.appCustomBg);
        if (data.plannerTargets) localStorage.setItem('plannerTargets', data.plannerTargets);
        if (data.plannerCompleted) localStorage.setItem('plannerCompleted', data.plannerCompleted);
        if (data.momentumHabits) localStorage.setItem('momentumHabits', data.momentumHabits);
        if (data.appSubjects) localStorage.setItem('appSubjects', data.appSubjects);

        // Import todo data
        if (data.todoData) {
          Object.entries(data.todoData).forEach(([key, value]) => {
            localStorage.setItem(key, value);
          });
        }

        alert('Data imported successfully! Please refresh the page.');
        window.location.reload();
      } catch (error) {
        alert('Error importing data. Please check the file format.');
      }
    };
    reader.readAsText(file);
  };

  const factoryReset = () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone!')) {
      localStorage.clear();
      alert('All data has been reset. The page will reload.');
      window.location.reload();
    }
  };

  const downloadExportData = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billu-diary-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className="tab-content active" id="tab-settings">
      <h1>Settings</h1>

      <div className="settings-section">
        <h3>User Profile</h3>
        <div className="setting-item">
          <label>Display Name:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="Enter your name"
          />
          <button onClick={saveUserName}>Save</button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Appearance</h3>

        <div className="setting-item">
          <label>OLED Theme:</label>
          <label className="toggle">
            <input
              type="checkbox"
              checked={isOLEDTheme}
              onChange={toggleOLEDTheme}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>

        <div className="setting-item">
          <label>Accent Color:</label>
          <input
            type="color"
            value={accentColor}
            onChange={(e) => updateAccentColor(e.target.value)}
          />
        </div>

        <div className="setting-item">
          <label>Text Color:</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => updateTextColor(e.target.value)}
          />
        </div>
      </div>

      <div className="settings-section">
        <h3>Data Management</h3>

        <div className="setting-item">
          <button onClick={exportDataToFile} className="export-btn">Export Data</button>
        </div>

        <div className="setting-item">
          <label>Import Data:</label>
          <input
            type="file"
            accept=".json"
            onChange={importData}
          />
        </div>

        <div className="setting-item">
          <button onClick={factoryReset} className="reset-btn">Factory Reset</button>
        </div>
      </div>

      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Export Data</h3>
            <p>Your data has been prepared for export. Click the button below to download.</p>
            <div className="modal-buttons">
              <button onClick={downloadExportData}>Download Backup</button>
              <button onClick={() => setShowExportModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;