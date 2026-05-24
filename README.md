# Architecture Specification: Billu's Diary

## 1. System Overview
Billu's Diary is a Single Page Application (SPA) built on React and Vite. It utilizes a mobile-first, **Modular Dashboard Operating System** paradigm mimicking a native application. Instead of standard URL-based routing, it employs a persistent DOM Tab Engine combined with a highly encapsulated, state-driven Widget Engine to maintain maximum performance and layout stability.

---

## 2. Directory Structure & Path Resolution
The project utilizes Vite's `resolve.alias` configuration to enforce a strict import hierarchy, preventing relative path hell and enforcing domain boundaries.

```text
src/
├── components/      # Reusable, domain-agnostic UI elements
│   ├── layout/      # Global layout wrappers (BottomNav)
│   ├── modals/      # System-wide modal overlays and dialogs
│   └── ui/          # Atomic components (Buttons, GlassPanels, DevPanel)
├── services/        # External integrations (Firebase, IndexedDB)
├── tabs/            # Top-level route modules
│   ├── home/        # The Bento Grid dashboard (entry point)
│   ├── momentum/    # Habit/streak tracking logic
│   ├── planner/     # Scheduling and calendar logic
│   └── todo/        # Task management system
├── utils/           # Pure functional utilities (date parsing, sanitization)
└── widgets/         # Pluggable micro-apps for the Home grid (WidgetBase, OverlayBase)

```

---

## 3. Core Subsystems

### 3.1. Routing & Tab Engine (`App.jsx`)

The application bypasses traditional routing in favor of a **Persistent DOM Strategy**.

* **DOM Retention:** All tabs are rendered simultaneously within the DOM, but non-active tabs are hidden using `display: 'none'`. This prevents the unmounting/remounting of complex component trees (like the grid layout), ensuring instantaneous tab switching.
* **Scroll Memory Engine:** A `useRef` hook (`scrollPositions`) tracks the exact `window.scrollY` coordinate before a tab unmounts. Upon navigation return, a `useEffect` synchronously restores the scroll position (`window.scrollTo({ top, behavior: 'instant' })`).
* **Home Overrides:** The Home tab is explicitly forced to `[0, 0]` coordinates upon mounting to ensure animation cleanliness and predictable user experience.

### 3.2. Theming & Styling Strategy

The visual architecture is a hybrid system marrying Material-UI (MUI) structural components with a highly customized, **zero-neon** glassmorphism design system (`designsys.css`).

* **Single Source of Truth:** `designsys.css` acts as the master token registry. It defines spatial hardware awareness (e.g., `env(safe-area-inset-bottom)`), glassmorphism alpha channels, and shadows.
* **MUI Integration:** `main.jsx` utilizes MUI's `ThemeProvider` to overwrite internal logic. By injecting exact hex values directly into the MUI palette, standard MUI components inherit the custom design system perfectly, allowing native ripple effects, focus states, and contrast calculations to function inside the glass UI.
* **The "Lumber" Rule:** * Use `<GlassPanel>` (Custom Component) when you need a distinct visual container, card, or popup.
* Use `<Box>` (MUI) when you just need invisible "lumber" to push, pull, flex, or center items without adding visual weight. Avoid "Glassception" (nesting GlassPanels unnecessarily).



### 3.3. Bento Layout Engine (`HomeTab.jsx` & `Grid.jsx`)

The core dashboard is built upon `react-grid-layout`, heavily modified for responsive resizing and dynamic component injection.

* **Widget Registry:** Widgets are decoupled from the grid. `HomeTab.jsx` reads a layout configuration array from `localStorage`. It cross-references this with `WIDGET_DICTIONARY` to dynamically instantiate components based on type, `minW`, and optimal dimensions.
* **Responsive Width Synchronization:** `Grid.jsx` uses a `ResizeObserver` to monitor the container. To prevent infinite loops caused by scrollbar toggling, it utilizes a debouncing-style check (`currentWidthRef`) that ignores sub-pixel or minor (`<10px`) width shifts.

### 3.4. The Smart Focus Ring (`Grid.jsx`)

Standard CSS borders cannot accommodate complex custom resizing handles cleanly. The `SmartFocusRing` is a dedicated sub-component that calculates exact SVG paths dynamically.

* **Dynamic Geometry:** It utilizes a `ResizeObserver` to track the exact boundaries of the selected widget.
* **Path Calculation:** Using raw geometry, it plots an SVG path mapping the perimeter (`mainRingPath`) and mathematically subtracts the exact dimensions required for the bottom-right grab handle (`resizeHandlePath`), rendering a seamless focus state.

---

## 4. The Widget Architecture (The Sandbox)

Micro-apps (Widgets) run inside strict, mathematically locked constraints. Widgets have a `[3x2]` base span, yielding highly compressed physical content areas (e.g., `231x225px`).

### 4.1. `WidgetBase.jsx` (The Stage)

The universal wrapper for every micro-app.

* **The Frozen Header:** Implements a mathematically locked `28px` header to prevent layout bouncing when inner content changes.
* **TRS (Top Right Stuff):** A dedicated, flex-protected zone in the header for contextual actions, stats, or close buttons.
* **The Content Area:** A strictly defined `.widget-content-area` node where the micro-app renders.
* **The Overlay Layer:** Exposes an `overlays` prop to render modals at the root widget level (covering the header), rather than trapping them inside the content area.

### 4.2. `OverlayBase.jsx` (The Blueprint)

The standard for widget-level interruptions (settings, hints, inputs).

* Renders a `rgba(0,0,0,0.7)` backdrop confined strictly to the widget's outer borders.
* Uses a flex-protected (`flexShrink: 0`), scrollable internal `GlassPanel` (`overflowY: 'auto'`) so content never breaks if the widget is physically squished.

### 4.3. Micro-App Implementation (State & Overlays)

Widgets must **not** rely on standard routing. They use a strict **State Machine** and **Overlay Engine**.

* **Example (Wordle):** The orchestrator (`WordleWidget.jsx`) manages 5 standard views (`lobby`, `board`, `stats`, `admire`, `room`) and routes localized overlays (`RoomOverlay`). The TRS dynamically swaps UI (Date vs. Icons) based on the active state.

---

## 5. Developer & Debugging Tools

* **The Telemetry Uplink:** Micro-apps emit custom DOM events (`widget_telemetry_uplink`).
* **`DevPanel.jsx`:** A floating, draggable diagnostic tool that intercepts telemetry.
* **Precision Targeting:** Bypasses padding by pointing a `ResizeObserver` directly at the `.widget-content-area` and `.widget-outer-area` class tags, providing exact, sub-pixel accurate layout dimensions for developers.
* **Dev Notes:** Integrated `localStorage` text area tied dynamically to the `selectedWidget.type` for persistent alignment/todo notes.

---

## 6. State Persistence Hierarchy

Data is tiered based on volatility and access speed requirements:

1. **Component State (`useState`):** Highly volatile runtime data (e.g., `isEditMode`, `isFading`, `activeOverlay`).
2. **DOM/Memory State (`useRef`):** Persistent runtime data that does not trigger re-renders (e.g., Scroll coordinates, width tracking debouncers).
3. **Local Storage:** Fast, synchronous persistence for client-side configurations (e.g., `bento_layout_v4`, widget save states, user names).
4. **Database/Backend (Pending):** Asynchronous, authoritative persistence for core application data.

---

## 7. Strict Directives for AI Agents

1. **Never use inline styles for colors or radii.** Always use CSS variables (`var(--color-...)` or `var(--rad-...)`).
2. **Never hardcode layout heights if flexbox can solve it.** Content area is heavily restricted; build for responsiveness using `flexGrow: 1` and `flexShrink: 0`.
3. **Respect the aliases.** Use `@ui/`, `@widgets/`, and `@tabs/` for clean imports. Do not use relative pathing.
4. **No UI Libraries inside Widgets.** Do not introduce heavy external routing or animation libraries inside the micro-apps. Use State Machines and native CSS keyframes.

```

***

Now that the master architecture is permanently codified in a way that blends the high-level React mechanics with our strict widget rules, I am ready. 

Just say the word, and I will generate the **Technical Spec Sheet** for building the Wordle grid logic inside `WordleBoard.jsx`.

```


ok now that is in place lets make hint overlay and answer overlay so i want you to make a prompt for the agent to make these 

Overlay: hint

Triggers: from the hint icon in the wordle board view

structure

    - header 
        title: Hint 
        TRS: close overlay icon

    - content 
        ~ hint view: 2 column inside both column there is a "wordle board like cell which will be clickable below the reight cell consonant will be written and below the left cell vovel wil be written in small font and in a away that fits just below and exactly of the width of the respective cell when the cell is clicked it reveals the letter  

        ~ button: "Reveal Answer" takes user to answer overlay 

overlay: answer

Triggers: 
            1. from the "Reveal Answer" button in int overlay (it should be made sure the hint overlay closes before the answer overlay is shown)
            2. when user guesses the correct word
            3. when user runs out of guesses  


structure

    - header 
        title: Answer 
        TRS: close overlay icon

    - content 
        ~ message view: user should be conditionally shown different messages 
            condition: user guesses the word in min guess  message: Genius!!
            condition: user guesses the word in max guess  message: Pheww!!
            condition: user guesses the word in any nth guess which isnt the max or min guess message: Well Done!!
            condition: user comes from "Reveal Answer" button  message: Meow whyy🐾 
        note: these message should decrease or increse there size tin order to sit in the message view 

        ~ answer view: the word which is the answer 

        ~ defination view: 2 line defination of the word (very small font can be scrollabe if the defination exceeds 2 lines) 
        
        ~ button: there should be a action bar of 2 button 
                    button 1:- Home [takes user to the lobby] (occupies 80% space)    
                    button 2:- Stats [takes user to stats view] (this is a icon button should be like a square occuping 20% of the total width)


bug :- user can frst reveal the answer even before the try to guess even a single word and then they can just enter the revealed answer and they will get the message genius insteaf we will have a check that isrevealed if positive the message will be "Hmmmm Smartie" and isrevealed if negative then we will run our current messaging system 

ok we will now make stats but befor we make stats i want to  make a coustom ui component for the wordie widget 


so you knwo hw we have this couston date picker pill for our billus diary app we even use that in our wordle lobby but for stats tab i want a coustom date picker see how we inject today tomorrow or yesterday in MUI date picker i want to inject the words of the day instead and below those worlds we will have the date written in small accent color and use that as date selector for stats tab we will call this the worddatepicker also as i suggested above if the user has not solved current days wordle and isrevealed negative then we will just make it say TODAY instead of inject todays word 

fix that bug and just give a review on this new component and then we will get on the task of coding up the stats state


ok now i will tell you the physical design of the states and overlays 


in lobby state 3 buttons which connect to rooms

    1. join room :- opens join room overlay
    2. my rooms :- opens manage room state 
    3. room icon in TRS :- opens room state 

states :- room, manage room 

state :- room


TRS :-  1. "stats icon" takes user to stats state 

        2. "admire text" takes user to admire state


content :-

rectangular room picker dropdown on left and word date picker on the right (both take 50% space)

then a table with 2 column with title players and score 
below will be list of players and their score 

then a manage room button which takes user to manage room state

state :- manage room


TRS :- "request" text takes user to managerequestoverlay

content :-

rectangular room picker dropdown on left (80% space) and edit room icon button on the right (20% space) the edit room icon button will only be active if the user is the room owner 

then a table with 2 column with title players and actions 
below will be the list of all the player with action options depending upon if the user is the room owner or memeber 

if room owner :- for themselves they will have leave option and make mod and remove option for others 
if mod :- for themselves they will have leave option and remove option for others except owner
if member :- for themselves they will have leave option thats it 


overlays:- joinroom, editroom, roomrequest

Overlay: joinroom

Triggers: "JOIN ROOM" button in the wordle lobby

structure

    - header 
        title: JOIN ROOM 
        TRS: close overlay icon

    - content 
        ~ room code textarea: alpha numerical one letter 4 numbers A-XXXX there should be 2 input feild seperated by "-" 

    - footer
        ~ button: "JOIN ROOM" only becomes active or clickable when all charachters are entered  
        if the user enters correct existing room code they get a toast saying "request sent"
        if invalid room code  is entered then they get a toast sayng "invalid room code"

Overlay: editroom

Triggers: "edit room icon button" in the manage room state

structure

    - header 
        title: EDIT ROOM 
        TRS: close overlay icon

    - content 
        ~ room name textarea: existing room name will be shown which the user can change only 8 character allowed 

    - footer
        ~ button: "DONE" only becomes active or clickable when all charachters are entered  