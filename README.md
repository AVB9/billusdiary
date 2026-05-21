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


Use <GlassPanel> when you need a distinct visual container, card, popup, or background layer.

Use <Box> when you just need invisible "lumber" to push, pull, flex, or center items without adding any visual weight. 

there is a alias for ui and widgets so it can be 

import WidgetBase from '@widgets/WidgetBase';

import GlassPanel from '@ui/GlassPanel'; 


also i have restructed the wordle widget states states will have the "widget title" in the top left and it will always help the user to go to the lobby, top right will show dfferent stuff based on the state (we need a name for this "top right stuff" wont it be funny if we just call it TRS lol)

i have now introduced the concept of overlays overlay is a glasspanel on top of the state the size and shape of the overlay completely depends on the size and shape of the widget, it should be the shrunk down version of the widget glasspanel every overlay should have a header and content similar to the main widgets the header of all the overlays should have overlay title in thw top left and a small close svg (solid circle but masked X inside it) as the TRS lol and when the overlay pops the widget should become dark (a dark overlay on the widget on which over overlay wouuld sit if that makes sense) and if the user clicks anywhere outseide the overlay and inside the widget when overlay is actiive it should close the overlay 

we now have 5 states and 4 overlays 

States 

State 1: Lobby
State 2: Board
State 3: Stats 
State 4: Admire wordle
State 5: Room

Overlays 

Overlay 1: roomoverlay
Overlay 2: hintoverlay
Overlay 3: answeroverlay
Overlay 4: guessdistrooverlay


below is what the top right stuff (TRS) of all the different states will show

Lobby :- a stats svg (a podium svg basically) [takes user to stats state]
Board :- hint icon [triggers hintoverlay] and Date of the wordle
Stats :- Admire wordle [takes user to Admire wordle state ]
Admire wordle :- Date of the wordle
Room :- A edit icon [triggers roomoverlay] and Room name with a Drop down [enabes user to select which room is ckecking] 

1. State Lobby 

Headder at top 
below it W O R D L E (E with accent color)
below it datepicker pill
below it single player and multiplayer pills
below it a button which says START GAME if singleplayer is selected (which is selected by default) and  JOIN ROOM if multiplayer is selected when user selects multiplayer and then clicks join room roomoverlay should pop up

    A. Overlay roomoverlay 
    
    Header  
        - Title: Rooms 
        - TRS: close svg 

    Content
        - subtitle text "Just enter the room code if you wish to join existing room"
        - below it text area "enter room name" [max 6 letters should be allowed]
        - below it text area "enter room code"
            ~ this should be like those google code text are where the code is G-XXXX will we will let the user change the alphabet too so for example "S-2435" is a valid room code
            ~ this text are should be the wordle box the alphabet and then a "-" then a text area which should allow 4 numbers  
        - below it button which should say CREATE ROOM if unused room name and room code is   entered and JOIN ROOM if existing room name and room code is used  


2. State Board

header at top 
wordle board content 


it has come to my realization that playing multiplayer or single player dosent make a difference at all there is a daily wordle user solves it before if it was a single player the stats were not public and if it was multiplayer the stats were public thats it 

so we should remove the single player and multi player pills completely and replace it with a ROOMS buto and the start game button now should just say PLAY WORDLE also the text wordle and all the content is not at all optimised for 231.933×225.883 which is the actual content area inside the widget of grid span of [ 3 × 2 ] also one thing i noticed is the size of grid span in [ 3 × 2 ] shown by dev panel is 288w × 310h but if i check using the browsers inspect tool its 281.267×303.8 why is discriprency? 

we need to correct that error in the data of dev pannel 

and we should make a new seperate section for sizes and will have a small copy button 

grid span 
widget area (px)
content area (px)
[ name of the clicke component] area (px)