marcosavb@PEGASUS:~/Billu's Diary /src$ tree

.

├── App.css

├── App.jsx

├── assets

│   ├── favicon.svg

│   ├── hero.png

│   ├── react.svg

│   └── vite.svg

├── components

│   ├── components.css

│   ├── layout

│   │   └── BottomNav.jsx

│   ├── modals

│   │   ├── AlertModal.jsx

│   │   ├── ModalOverlay.jsx

│   │   └── SystemModal.jsx

│   └── ui

│       ├── ActionPair.jsx

│       ├── BentoCard.jsx

│       ├── GlassPanel.jsx

│       ├── Icons.jsx

│       └── Toggle.jsx

├── designsys.css

├── index.css

├── main.jsx

├── services

│   ├── auth.js

│   ├── db.js

│   └── firebase.js

├── tabs

│   ├── home

│   │   ├── grid

│   │   │   ├── EditBar.jsx

│   │   │   ├── EditWidgetsModal.jsx

│   │   │   └── Grid.jsx

│   │   ├── header

│   │   │   └── Greetings.jsx

│   │   ├── hometab.css

│   │   ├── HomeTab.jsx

│   │   └── hta.md

│   ├── momentum

│   │   ├── MomentumDesktop.jsx

│   │   ├── MomentumMobile.jsx

│   │   └── MomentumTab.jsx

│   ├── planner

│   │   ├── PlannerDesktop.jsx

│   │   ├── PlannerMobile.jsx

│   │   └── PlannerTab.jsx

│   ├── settings

│   │   └── SettingsTab.jsx

│   └── todo

│       ├── TodoDesktop.jsx

│       ├── TodoMobile.jsx

│       └── TodoTab.jsx

├── utils

│   ├── dates.js

│   └── sanitize.js

└── widgets

    ├── TestWidgets.jsx

    └── WidgetRegistry.jsx


alias: {

      // master root alias

      '@': path.resolve(__dirname, './src'),

      

      // folder-specific aliases

      '@components': path.resolve(__dirname, './src/components'),

      '@ui': path.resolve(__dirname, './src/components/ui'),

      '@modals': path.resolve(__dirname, './src/components/modals'),

      '@layout': path.resolve(__dirname, './src/components/layout'),

      '@widgets': path.resolve(__dirname, './src/widgets'),

      '@tabs': path.resolve(__dirname, './src/tabs'),  

      '@home': path.resolve(__dirname, './src/tabs/home'),    

    },


