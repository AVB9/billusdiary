// src/tabs/TabRegistry.jsx
import React from 'react';
import * as Icons from '@components/ui/Icons';

// Tabs
import HomeTab from '@tabs/home/HomeTab';
import SettingsTab from '@tabs/settings/SettingsTab';


export const TAB_REGISTRY = {
    journal: { 
        id: 'journal', 
        title: 'Journal', 
        icon: <Icons.Journal />, 
        component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Journal Placeholder</div> 
    },
    timer: { 
        id: 'timer', 
        title: 'Timer', 
        icon: <Icons.Timer />, 
        component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Timer Placeholder</div> 
    },
    momentum: { 
        id: 'momentum', 
        title: 'Momentum', 
        icon: <Icons.Momentum />, 
        component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Momentum Placeholder</div> 
    },
    planner: { 
        id: 'planner', 
        title: 'Planner', 
        icon: <Icons.Planner />, 
        component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Planner Placeholder</div> 
    },
    home: { 
        id: 'home', 
        title: 'Home', 
        icon: <Icons.Home />, 
        component: <HomeTab /> 
    },
    todo: { 
        id: 'todo', 
        title: 'Todo', 
        icon: <Icons.Todo />, 
        component: <div className="app-tab" style={{ padding: '20px', color: 'white' }}>Todo Placeholder</div> 
    },
    settings: { 
        id: 'settings', 
        title: 'Settings', 
        icon: <Icons.Settings />, 
        component: <SettingsTab /> 
    }
};