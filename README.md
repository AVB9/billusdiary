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


ok now that is in place lets see hint overlay and answer overlay 

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


so you knwo how we have this couston date picker pill for our billus diary app we even use that in our wordle lobby but for stats tab i want a coustom date picker see how we inject today tomorrow or yesterday in MUI date picker i want to inject the words of the day instead and below those worlds we will have the date written in small accent color and use that as date selector for stats tab we will call this the worddatepicker also as i suggested above if the user has not solved current days wordle and isrevealed negative then we will just make it say TODAY instead of injecting todays word 

fix that bug and just give a review on this new component and then we will get on the task of coding up the stats state


ok now i will tell you the physical design of the states and overlays related to the multiplayer architecture 


1. Global Architecture & Database Constraints

To maintain a fast, cost-effective database and a clean UI, the multiplayer ecosystem operates under strict physical limits:

    Room Capacity: Max 20 players per room.

    User Capacity: A single user can join a max of 5 rooms.

    Room ID Format: A-XXXX (1 Alpha, 4 Numeric). This creates a visually distinct, easy-to-type invite code (e.g., W-4928) that differs completely from Wordle text inputs.

    Role-Based Access Control (RBAC): Three tiers of permissions: Owner, Mod, and Member.

2. Core States (The Views)
2.1 The Lobby State

The entry point. It focuses on getting the user into a game, while cleanly providing paths to the multiplayer ecosystem.

    TRS (Top Right Section): * [Room Icon] ➔ Routes to Room Stats State (Data Consumption).

    Content Area (Main):

        [Join Room] Button ➔ Pops Join Room Overlay.

        [My Rooms] Button ➔ Routes to Manage Room State (Administration). (UI Polish: Displays a red notification dot if there are pending inbox requests).

2.2 Room Stats State (roomstats)

The competitive viewing hub. This is where users experience "FOMO" and track their friends.

    TRS:

        [Stats Icon] ➔ Routes to Solo Stats.

        [ADMIRE] Text ➔ Routes to Admire Board.

    Content Area:

        Header (50/50 Split): * Left: Rectangular Room Picker Dropdown.

            Right: Wordle DatePicker.

        Leaderboard Table:

            Columns: PLAYERS | SCORE

            Body: Scrollable list of players and their scores for the selected date. (Edge Case Fix: If a user hasn't played yet, their score shows as - / 4. This prevents spoilers while driving immense competitive curiosity).

        Footer:

            [Manage Room] Button ➔ Routes to Manage Room State.

2.3 Manage Room State (manageroom)

The administrative dashboard for handling settings, requests, and kicking inactive players.

    TRS:

        [+] New Room Icon ➔ Pops Create Room Overlay.

        [Inbox] Request Icon ➔ Pops Manage Request Overlay. (UI Polish: Displays a red dot if requests are pending).

    Content Area:

        Header (70/15/15 Split):

            Left (70%): Rectangular Room Picker Dropdown.

            Middle (15%): [Edit Icon] ➔ Pops Edit Room Overlay.

            Right (15%): [Invite Icon] ➔ Pops Invite Player Overlay.

            RBAC Security: The Edit and Invite icons are visually disabled/hidden unless the viewing user is the Owner.

        Permissions Table:

            Columns: PLAYERS | ACTIONS

            Body: Scrollable list of players. Action buttons change dynamically based on the viewer's role:

                If Owner: Can Leave (Self), Make Mod (Others), Remove (Others).

                If Mod: Can Leave (Self), Remove (Others, except Owner).

                If Member: Can Leave (Self). No other actions.

3. The Overlays (The Actions)
3.1 Join Room (joinroom)

Triggered from the Lobby.

    Header: JOIN ROOM | [X] Close

    Content: Two input fields separated by a hyphen [ _ ] - [ _ _ _ _ ]. Auto-advances focus.

    Footer: [JOIN ROOM] Button. Only active when exactly 5 valid alphanumeric characters are entered.

    System Toasts:

        Success: "Request Sent" (If code exists in DB).

        Error: "Invalid Room Code" (If code does not exist).

3.2 Create Room (createroom)

Triggered from manageroom TRS.

    Header: CREATE ROOM | [X] Close

    Content: Room Name input field. (UI Polish Note: Database uses A-XXXX as the primary key, so we can safely allow the display name to be up to 12-15 characters to give users more freedom, rather than a strict 8).

    Footer: [DONE] Button. Creates room, assigns the user as Owner, and generates the A-XXXX code.

3.3 Edit Room (editroom)

Triggered from manageroom Header.

    Header: EDIT ROOM | [X] Close

    Content: Room Name input field (pre-filled with current name).

    Footer: [DONE] Button. Updates the display name in the database.

3.4 Manage Requests (managerequest)

Triggered from manageroom TRS. Acts as a unified Inbox.

    Header: REQUESTS | [X] Close

    Content:

        Toggle Pill: [ Join Requests (2) | Invites (1) ]. Strictly separates users asking to enter your room from rooms asking you to enter.

        Scrollable List: Left side shows User/Room name. Right side shows a sleek checkbox. Clicking the row toggles the box.

        Empty State: Ghosted icon reading "You're all caught up!" if the selected tab has no requests.

    Footer (Batch Actions):

        Left (50%): [IGNORE] (Deletes request).

        Right (50%): [ACCEPT] (Approves request, updates DB).

        Safety Logic: Both buttons are locked/dimmed until at least 1 checkbox is selected. (UI Polish: Batch-accepting fires a single toast: "X Players Added", not multiple).

3.5 Invite Player (inviteplayer) Implicitly required by Invite Icon

Triggered from manageroom Header.

    Header: INVITE PLAYER | [X] Close

    Content: Search/Input field for a friend's Username or ID.

    Footer: [SEND INVITE] Button. Triggers an "Add Request" in the recipient's Inbox.

4. Edge Cases & Architectural Solutions (The Bulletproofing)
Edge Case 1: The Orphaned Room (Succession Logic)

    The Problem: The Room Owner clicks "Leave Room".

    The Fix: The database runs a sequence check. Ownership automatically transfers to the user who has been in the room the longest chronologically (Player #2). If the room hits 0 players, the DB deletes the room to save space.

Edge Case 2: The Synchronized State Paradigm

    The Problem: A user is in manageroom looking at "Room B", then clicks the TRS icon to go to roomstats and sees "Room A", causing severe data confusion.

    The Fix: The "Active Room ID" must be held in a Global React State Context (or Redux), not local component state. Changing the dropdown in either state universally updates the other.

Edge Case 3: The Ghost User / Kick Spam

    The Problem: Kicked toxic players spamming the Join code, or users losing their LocalStorage UUID and becoming un-kickable "ghosts."

    The Fix: 1. Kicking a user adds their UUID to an invisible bannedList array on the Room object, automatically rejecting future Join requests.
    2. Mod/Owner controls inherently solve the Ghost User issue—if a player stops playing for 3 weeks because they lost their device, the Owner simply kicks the dead profile to free up 1 of the 20 slots.

Edge Case 4: The Time Zone Paradox

    The Problem: An Indian user (IST) plays Tuesday's word while a New York user (EST) is still on Monday night.

    The Fix: We rely entirely on the absolute UI logic of the Date Picker. Scores are tied strictly to the YYYY-MM-DD string in the database, not relative "Today/Yesterday" timestamps. If the NYC user looks at Monday in the dropdown, they see Monday's scores. They won't see the IST user's Tuesday score until they manually change the date picker to Tuesday.




i just realized in order to have efficient and smooth development of this

 rooms feature we need a lot of Mock Data to test al the features  


weather we use a service which simulates backed or our offline json file or which even file is the industry standard to save data 


we will first need a structure to save the data in we want to save our data with as minimal variable as we can while keeping it simple right so whatever it is data structure is important and to discuss data structure we need to discuss user onboarding  cuz wordle is going to be one of the wdget in their account which will save its data right?


also i never played with such complex data the previous billus diary 


// =================================================================

// 5.0 [DATA MANAGEMENT & BACKUP V2]

// =================================================================

function setupDataManagement() {

    const exportBtn = document.getElementById('exportDataBtn');

    const importBtn = document.getElementById('importDataBtn');

    const resetBtn = document.getElementById('factoryResetBtn');


    // Backup V2 Modals

    const restoreModal = document.getElementById('restoreBackupModalOverlay');

    const restoreDropzone = document.getElementById('restoreFileDropzone');

    const dropzoneContent = document.getElementById('dropzoneContent');

    const v2ImportInput = document.getElementById('v2ImportInput');

    const modeMerge = document.getElementById('restoreModeMerge');

    const modeOverwrite = document.getElementById('restoreModeOverwrite');

    const scopePillsContainer = document.getElementById('restoreScopePills');

    const executeRestoreBtn = document.getElementById('executeRestoreBtn');

    const closeRestoreBtn = document.getElementById('closeRestoreModalBtn');

    const restoreDesc = document.getElementById('restoreModeDesc');


    let parsedBackupData = null;

    let selectedMode = 'merge'; 

    let selectedScopes = new Set(['all']); 


    if (!exportBtn || !importBtn || !resetBtn) return;


    // --- JSON EXPORTER V2 ---

    exportBtn.addEventListener('click', () => {

        try {

            const backup = {

                metadata: { app_id: "billus_diary", backup_date: new Date().toISOString(), version: "2.0" },

                settings: {},

                momentum: JSON.parse(localStorage.getItem('momentumHabits')) || [],

                planner: {

                    targets: JSON.parse(localStorage.getItem('plannerTargets')) || {},

                    completed: JSON.parse(localStorage.getItem('plannerCompleted')) || [],

                    subjects: JSON.parse(localStorage.getItem('appSubjects')) || []

                },

                todo: {}

            };


            ['userDisplayName', 'themeOLED', 'appCustomBg', 'appAccentColor', 'appTextColor', 'userUltimateGoalName', 'userUltimateGoalDate'].forEach(k => {

                const val = localStorage.getItem(k);

                if (val) backup.settings[k] = val;

            });


            for (let i = 0; i < localStorage.length; i++) {

                const key = localStorage.key(i);

                if (key.startsWith('todo_')) backup.todo[key] = JSON.parse(localStorage.getItem(key));

            }


            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));

            const downloadAnchorNode = document.createElement('a');

            downloadAnchorNode.setAttribute("href", dataStr);

            const dateStr = new Date().toISOString().split('T')[0];

            downloadAnchorNode.setAttribute("download", `billus_diary_backup_${dateStr}.json`);

            

            document.body.appendChild(downloadAnchorNode); 

            downloadAnchorNode.click();

            downloadAnchorNode.remove();

        } catch (err) {

            window.AppAlert.show({ title: "Backup Failed", message: "Failed to generate V2 backup.", buttons: [{ text: "OK", type: "primary" }] });

        }

    });


    // --- RESTORE TARGET PILLS RENDERER ---

    const renderScopePills = () => {

        if (!scopePillsContainer) return;

        scopePillsContainer.innerHTML = '';

        const scopes = [

            { id: 'all', label: 'Complete APP' },

            { id: 'momentum', label: 'Momentum' },

            { id: 'planner', label: 'Planner Targets' },

            { id: 'todo', label: 'TODO Tasks' },

            { id: 'subjects', label: 'Subjects' },

            { id: 'colors', label: 'Colors' }

        ];


        scopes.forEach(s => {

            const pill = document.createElement('div');

            const isActive = selectedScopes.has(s.id);

            

            pill.className = 'todo-tint-pill';

            pill.textContent = s.label;

            

            if (isActive) {

                pill.classList.add('selected');

                pill.style.backgroundColor = 'color-mix(in srgb, var(--color-primary) 20%, transparent)';

                pill.style.borderColor = 'var(--color-primary)';

                pill.style.color = 'var(--color-primary)';

            } else {

                pill.style.backgroundColor = 'rgba(255,255,255,0.05)';

                pill.style.borderColor = 'var(--color-glass-border)';

                pill.style.color = 'var(--color-text)';

            }


            pill.addEventListener('click', () => {

                if (s.id === 'all') {

                    selectedScopes.clear();

                    selectedScopes.add('all');

                } else {

                    selectedScopes.delete('all');

                    

                    if (selectedScopes.has(s.id)) {

                        if (s.id === 'subjects' && (selectedScopes.has('planner') || selectedScopes.has('todo'))) {

                            if (window.showAppToast) window.showAppToast("Subjects are required for Planner and TODO data.");

                            return; 

                        }

                        

                        selectedScopes.delete(s.id);

                        if (selectedScopes.size === 0) selectedScopes.add('all'); 

                    } else {

                        selectedScopes.add(s.id);

                        

                        if (s.id === 'planner' || s.id === 'todo') {

                            selectedScopes.add('subjects');

                        }


                        if (selectedScopes.has('momentum') && selectedScopes.has('planner') && selectedScopes.has('todo') && selectedScopes.has('subjects') && selectedScopes.has('colors')) {

                            selectedScopes.clear();

                            selectedScopes.add('all');

                        }

                    }

                }

                renderScopePills();

            });


            scopePillsContainer.appendChild(pill);

        });

    };


    // --- SMART RESTORE UI ---

    importBtn.addEventListener('click', () => {

        if (!restoreModal) return;

        parsedBackupData = null;

        const fn = document.getElementById('restoreFileName');

        if (fn) fn.textContent = "Select Backup File (.json)";

        if (executeRestoreBtn) {

            executeRestoreBtn.disabled = true;

            executeRestoreBtn.style.opacity = '0.4';

        }

        selectedScopes = new Set(['all']);

        renderScopePills();

        restoreModal.style.display = 'flex';

    });


    closeRestoreBtn?.addEventListener('click', () => restoreModal.style.display = 'none');

    restoreDropzone?.addEventListener('click', () => v2ImportInput?.click());


    // --- DRAG TO BLUR LOGIC ---

    if (restoreDropzone) {

        restoreDropzone.addEventListener('dragover', (e) => {

            e.preventDefault();

            restoreDropzone.style.background = 'rgba(255,255,255,0.05)';

            restoreDropzone.style.borderColor = 'var(--color-primary)';

            if (dropzoneContent) dropzoneContent.style.filter = 'blur(4px)';

        });

        const resetDropState = () => {

            restoreDropzone.style.background = 'rgba(0,0,0,0.2)';

            restoreDropzone.style.borderColor = 'var(--color-glass-border)';

            if (dropzoneContent) dropzoneContent.style.filter = 'none';

        };

        restoreDropzone.addEventListener('dragleave', resetDropState);

        restoreDropzone.addEventListener('drop', (e) => {

            e.preventDefault();

            resetDropState();

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && v2ImportInput) {

                v2ImportInput.files = e.dataTransfer.files;

                v2ImportInput.dispatchEvent(new Event('change'));

            }

        });

    }


    // --- WIRE UP CANCEL BUTTONS ---

    document.querySelectorAll('.restore-cancel-btn').forEach(btn => {

        btn.addEventListener('click', (e) => {

            e.preventDefault();

            if (restoreModal) restoreModal.style.display = 'none';

        });

    });


    // --- MERGE / OVERWRITE TOGGLES ---

    modeMerge?.addEventListener('click', () => {

        selectedMode = 'merge';

        

        modeMerge.classList.remove('btn-ghost', 'btn-danger');

        modeMerge.classList.add('btn-primary');

        modeMerge.style.borderColor = 'var(--color-primary)';

        

        if (modeOverwrite) { 

            modeOverwrite.classList.remove('btn-primary', 'btn-danger');

            modeOverwrite.classList.add('btn-ghost');

            modeOverwrite.style.borderColor = 'transparent'; 

        }

        if (restoreDesc) { 

            restoreDesc.textContent = "Combines backup with current data safely."; 

            restoreDesc.style.color = "#4ade80"; 

        }

    });


    modeOverwrite?.addEventListener('click', () => {

        selectedMode = 'overwrite';

        

        modeOverwrite.classList.remove('btn-ghost', 'btn-primary');

        modeOverwrite.classList.add('btn-danger');

        modeOverwrite.style.borderColor = 'var(--color-danger)';

        

        if (modeMerge) { 

            modeMerge.classList.remove('btn-primary', 'btn-danger');

            modeMerge.classList.add('btn-ghost');

            modeMerge.style.borderColor = 'transparent'; 

        }

        if (restoreDesc) { 

            restoreDesc.textContent = "Replaces current data. Missing data will be lost."; 

            restoreDesc.style.color = "var(--color-danger)"; 

        }

    });


    // --- BACKUP FILE VALIDATOR ---

    v2ImportInput?.addEventListener('change', (e) => {

        const file = e.target.files[0];

        if (!file) return;


        const reader = new FileReader();

        reader.onload = (event) => {

            try {

                const data = JSON.parse(event.target.result);

                if (typeof data !== 'object' || !data.metadata || data.metadata.app_id !== "billus_diary") {

                    throw new Error("Invalid app identifier");

                }

                

                parsedBackupData = data;

                const fn = document.getElementById('restoreFileName');

                if (fn) fn.textContent = file.name;

                if (executeRestoreBtn) {

                    executeRestoreBtn.disabled = false;

                    executeRestoreBtn.style.opacity = '1';

                }

            } catch (err) {

                window.AppAlert.show({ title: "Invalid File", message: "This file is not a valid Billu's Diary backup.", buttons: [{ text: "OK", type: "primary" }] });

            }

        };

        reader.readAsText(file);

    });


    // --- STRICT NON-DESTRUCTIVE MERGE ENGINE ---

    const hasScope = (target) => selectedScopes.has('all') || selectedScopes.has(target);


    executeRestoreBtn?.addEventListener('click', async () => {

        if (!parsedBackupData) return;


        const isV2 = parsedBackupData.metadata && parsedBackupData.metadata.version === "2.0";

        const execute = async () => {

            try {

                if (selectedMode === 'overwrite') {

                    if (hasScope('momentum')) localStorage.removeItem('momentumHabits');

                    if (hasScope('planner')) {

                        localStorage.removeItem('plannerTargets'); localStorage.removeItem('plannerCompleted'); 

                    }

                    if (hasScope('subjects')) {

                        localStorage.removeItem('appSubjects');

                        localStorage.removeItem('plannerSubjects');

                    }

                    if (hasScope('todo')) {

                        const keysToRemove = [];

                        for (let i = 0; i < localStorage.length; i++) {

                            if (localStorage.key(i).startsWith('todo_')) keysToRemove.push(localStorage.key(i));

                        }

                        keysToRemove.forEach(k => localStorage.removeItem(k));

                    }

                }


                if (isV2) {

                    if (hasScope('colors') || hasScope('all')) {

                        const colorKeys = ['themeOLED', 'appCustomBg', 'appAccentColor', 'appTextColor'];

                        colorKeys.forEach(k => {

                            if (parsedBackupData.settings && parsedBackupData.settings[k]) {

                                if (selectedMode === 'overwrite' || !localStorage.getItem(k)) localStorage.setItem(k, parsedBackupData.settings[k]);

                            }

                        });

                    }

                    if (hasScope('all')) {

                        const otherKeys = ['userDisplayName', 'userUltimateGoalName', 'userUltimateGoalDate'];

                        otherKeys.forEach(k => {

                            if (parsedBackupData.settings && parsedBackupData.settings[k]) {

                                if (selectedMode === 'overwrite' || !localStorage.getItem(k)) localStorage.setItem(k, parsedBackupData.settings[k]);

                            }

                        });

                    }

                    if (hasScope('momentum')) {

                        const currentHabits = JSON.parse(localStorage.getItem('momentumHabits')) || [];

                        const backupHabits = parsedBackupData.momentum || [];

                        backupHabits.forEach(bh => { if (!currentHabits.find(ch => ch.id === bh.id)) currentHabits.push(bh); });

                        localStorage.setItem('momentumHabits', JSON.stringify(currentHabits));

                    }

                    if (hasScope('planner')) {

                        const currentTargets = JSON.parse(localStorage.getItem('plannerTargets')) || {};

                        const backupTargets = parsedBackupData.planner.targets || {};

                        Object.keys(backupTargets).forEach(date => { if (!currentTargets[date]) currentTargets[date] = backupTargets[date]; });

                        localStorage.setItem('plannerTargets', JSON.stringify(currentTargets));


                        const currentComp = JSON.parse(localStorage.getItem('plannerCompleted')) || [];

                        const backupComp = parsedBackupData.planner.completed || [];

                        backupComp.forEach(date => { if (!currentComp.includes(date)) currentComp.push(date); });

                        localStorage.setItem('plannerCompleted', JSON.stringify(currentComp));

                    }

                    

                    if (hasScope('subjects')) {

                        let currentGroups = JSON.parse(localStorage.getItem('appSubjects'));

                        if (!currentGroups || !Array.isArray(currentGroups) || currentGroups.length === 0) {

                            currentGroups = [{ id: 'group_default', name: 'General', isDeletable: false, subjects: [] }];

                        }

                        

                        const backupSubs = parsedBackupData.planner.subjects || [];

                        

                        if (backupSubs.length > 0) {

                            if (backupSubs[0].subjects) {

                                backupSubs.forEach(bg => {

                                    const existingGroup = currentGroups.find(cg => cg.id === bg.id);

                                    if (existingGroup) {

                                        existingGroup.subjects = existingGroup.subjects || [];

                                        const incomingSubjects = bg.subjects || [];

                                        incomingSubjects.forEach(bs => {

                                            if (!existingGroup.subjects.find(cs => cs.id === bs.id)) existingGroup.subjects.push(bs);

                                        });

                                    } else {

                                        bg.subjects = bg.subjects || [];

                                        currentGroups.push(bg);

                                    }

                                });

                            } else {

                                const generalGroup = currentGroups.find(g => g.id === 'group_default') || currentGroups[0];

                                generalGroup.subjects = generalGroup.subjects || [];

                                backupSubs.forEach(bs => {

                                    if (bs.id !== 'off' && !generalGroup.subjects.find(cs => cs.id === bs.id)) {

                                        generalGroup.subjects.push(bs);

                                    }

                                });

                            }

                        }

                        localStorage.setItem('appSubjects', JSON.stringify(currentGroups));

                    }

                    

                    if (hasScope('todo')) {

                        Object.keys(parsedBackupData.todo || {}).forEach(dateKey => {

                            const currentTasks = JSON.parse(localStorage.getItem(dateKey)) || [];

                            const backupTasks = parsedBackupData.todo[dateKey] || [];

                            backupTasks.forEach(bt => { if (!currentTasks.find(ct => ct.id === bt.id)) currentTasks.push(bt); });

                            localStorage.setItem(dateKey, JSON.stringify(currentTasks));

                        });

                    }

                } else {

                    Object.keys(parsedBackupData).forEach(key => {

                        if (selectedMode === 'overwrite' || !localStorage.getItem(key)) {

                            localStorage.setItem(key, parsedBackupData[key]);

                        }

                    });

                }


                if (window.AppDB && AppDB.session) await AppDB.forcePushToCloud();

                

                setTimeout(() => {

                    window.AppAlert.show({

                        title: "Success", message: "Data restored successfully. The app will now reload.",

                        buttons: [{ text: "Reload", type: "primary", onClick: () => window.location.reload() }]

                    });

                }, 150);


            } catch (e) {

                setTimeout(() => {

                    window.AppAlert.show({ title: "Error", message: "Failed to merge backup.", buttons: [{ text: "OK", type: "primary" }] });

                }, 150);

            }

        };


        if (selectedMode === 'overwrite') {

            window.AppAlert.show({

                title: "Are you absolutely sure?",

                message: "This will completely erase your selected current data and replace it with the backup.",

                buttons: [

                    { text: "Cancel", type: "ghost" },

                    { text: "OVERWRITE", type: "danger", onClick: execute }

                ]

            });

        } else {

            execute();

        }

    });


    // --- ERASE ALL DATA FIX ---

    resetBtn.addEventListener('click', () => {

        window.AppAlert.show({

            title: "Factory Reset",

            message: "WARNING: This will permanently delete all tasks, habits, and settings across ALL devices. This cannot be undone.",

            buttons: [

                { text: "Cancel", type: "ghost" },

                { text: "Erase Everything", type: "danger", onClick: async () => {

                    try {

                        if (window.AppDB && AppDB.session) await AppDB.nukeCloudData();

                        AppDB.localWipeAndReload();

                    } catch(e) {

                        AppDB.localWipeAndReload();

                    }

                }}

            ]

        });

    });

}


// =================================================================

// 1.0 [FIREBASE KERNEL & CONFIG]

// =================================================================

// SECURITY: Firebase config is loaded from JS/config.js

// API keys should be set via environment variables, not hardcoded here

// See JS/config.js for security setup instructions


// Dynamic config loading with fallback

const firebaseConfig = window.firebaseConfig || {

    apiKey: "",

    authDomain: "",

    projectId: "",

    storageBucket: "",

    messagingSenderId: "",

    appId: "",

    measurementId: ""

};


// Validate config before initializing

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {

    console.error(

        'Firebase configuration incomplete. Set environment variables: VITE_FIREBASE_* in .env file'

    );

}


if (!firebase.apps.length) {

    try {

        firebase.initializeApp(firebaseConfig);

    } catch (error) {

        console.error('Firebase initialization failed:', error);

    }

}

const auth = firebase.auth();

const db = firebase.firestore();


db.enablePersistence({ synchronizeTabs: true }).catch(err => console.warn("Offline Mode Error:", err.code));


window.isInjectingCloudData = false;

window.hasInitialSyncCompleted = false;

window.syncTimeout = null;


let realTimeListener = null;

let authPromise = null;


// ===== SYNC QUEUE MANAGEMENT (FIX: Race Condition) =====

const syncQueue = {

    isPending: false,

    queue: [],

    

    add(fn) {

        this.queue.push(fn);

        this.process();

    },

    

    async process() {

        if (this.isPending || this.queue.length === 0) return;

        this.isPending = true;

        

        while (this.queue.length > 0) {

            const fn = this.queue.shift();

            try {

                await fn();

            } catch (e) {

                console.error('[Sync Queue] Error:', e);

            }

        }

        this.isPending = false;

    },

    

    clear() {

        this.queue = [];

        this.isPending = false;

    }

}; 


const SYNC_CONFIG = {

    staticKeys: [

        'plannerTargets', 

        'plannerCompleted', 

        'plannerSubjects', 

        'userDisplayName', 

        'userUltimateGoalName', 

        'userUltimateGoalDate',

        'momentumHabits'

    ],

    dynamicPrefixes: ['todo_', 'journal_']

};


const getDeviceId = () => {

    let id = localStorage.getItem('appDeviceId');

    if (!id) {

        id = 'dev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        localStorage.setItem('appDeviceId', id);

    }

    return id;

};


// =================================================================

// 2.0 [AppDB CONTROLLER]

// =================================================================

const AppDB = {

    session: null,


    checkSession() {

        if (!authPromise) {

            authPromise = new Promise((resolve) => {

                auth.onAuthStateChanged((user) => {

                    this.session = user;

                    if (user) this.startRealTimeSync();

                    else if (realTimeListener) { realTimeListener(); realTimeListener = null; }

                    resolve(user);

                });

            });

        }

        return authPromise;

    },


    async register(email, password) {

        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        this.session = userCredential.user;

        this.pushToCloud(); 

        return { requiresVerification: false };

    },


    async login(email, password) {

        const userCredential = await auth.signInWithEmailAndPassword(email, password);

        this.session = userCredential.user;

        this.startRealTimeSync();

        return userCredential.user;

    },


    async loginWithGoogle() {

        const provider = new firebase.auth.GoogleAuthProvider();

        const result = await auth.signInWithPopup(provider);

        this.session = result.user;

        if (result.additionalUserInfo && result.additionalUserInfo.isNewUser) this.pushToCloud();

        this.startRealTimeSync();

        return result.user;

    },


    localWipeAndReload() {

        // FIX: Properly unsubscribe real-time listener to prevent memory leak

        if (realTimeListener) {

            try {

                realTimeListener(); // Call unsubscribe function

                realTimeListener = null;

            } catch (e) {

                console.warn('[DB] Listener cleanup error:', e);

                realTimeListener = null;

            }

        }

        

        // Clear sync queue to avoid pending operations

        syncQueue.clear();

        

        // Clear all local data

        SYNC_CONFIG.staticKeys.forEach(k => localStorage.removeItem(k));

        const keysToRemove = [];

        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (SYNC_CONFIG.dynamicPrefixes.some(prefix => key.startsWith(prefix))) keysToRemove.push(key);

        }

        keysToRemove.forEach(k => localStorage.removeItem(k));

        auth.signOut().then(() => window.location.reload());

    },


    async logout() {

        if (this.session) {

            try {

                // Remove this specific device from cloud sessions before logging out

                await db.collection('users').doc(this.session.uid).set({

                    sessions: { [getDeviceId()]: firebase.firestore.FieldValue.delete() }

                }, { merge: true });

            } catch (e) {}

        }

        this.localWipeAndReload();

    },


    async resetPassword(email) { await auth.sendPasswordResetEmail(email); },

    async updatePassword(newPassword) { if (this.session) await this.session.updatePassword(newPassword); },


    async pushToCloud() {

        // FIX: Queue sync operations to prevent race conditions

        if (!this.session) return;

        syncQueue.add(() => this.forcePushToCloud());

    },


    async forcePushToCloud() {

        if (!this.session) return;

        const payload = {};

        SYNC_CONFIG.staticKeys.forEach(key => {

            const val = localStorage.getItem(key);

            if (val !== null && val !== undefined) payload[key] = val;

        });


        for (let i = 0; i < localStorage.length; i++) {

            const key = localStorage.key(i);

            if (SYNC_CONFIG.dynamicPrefixes.some(prefix => key.startsWith(prefix))) {

                payload[key] = localStorage.getItem(key);

            }

        }

        payload.updated_at = firebase.firestore.FieldValue.serverTimestamp();


        try { await db.collection('users').doc(this.session.uid).set(payload, { merge: true }); } 

        catch (error) { console.error("Firebase Sync Failed:", error); }

    },


    async nukeCloudData() {

        if (!this.session) return;

        try {

            await db.collection('users').doc(this.session.uid).set({

                _FACTORY_RESET_TRIGGERED: true,

                updated_at: firebase.firestore.FieldValue.serverTimestamp()

            });

        } catch (error) { throw error; }

    },


    async registerDevice() {

        if (!this.session) return;

        const deviceName = /Mobi|Android/i.test(navigator.userAgent) ? 'Mobile Device' : 'Desktop Device';

        try {

            await db.collection('users').doc(this.session.uid).set({

                sessions: { [getDeviceId()]: { name: deviceName, lastActive: firebase.firestore.FieldValue.serverTimestamp() } }

            }, { merge: true });

        } catch (e) {}

    },


    startRealTimeSync() {

        // FIX: Prevent multiple listeners from accumulating

        if (!this.session) return;

        

        // Unsubscribe old listener if it exists

        if (realTimeListener) {

            try {

                realTimeListener();

            } catch (e) {}

        }

        

        realTimeListener = null; // Reset before creating new listener


        realTimeListener = db.collection('users').doc(this.session.uid)

            .onSnapshot((doc) => {

                if (!doc.exists) {

                    window.hasInitialSyncCompleted = true;

                    AppDB.pushToCloud();

                    AppDB.registerDevice();

                    return;

                }


                const state = doc.data();


                // 1. Cross-device Factory Reset Interceptor

                if (state._FACTORY_RESET_TRIGGERED === true) {

                    this.localWipeAndReload();

                    return;

                }


                // 2. Remote Logout Interceptor

                const myDeviceId = getDeviceId();

                if (state.sessions) {

                    if (!state.sessions[myDeviceId]) {

                        if (window.hasInitialSyncCompleted) { this.localWipeAndReload(); return; } 

                        else { this.registerDevice(); }

                    }

                } else {

                    this.registerDevice();

                }


                if (window.isLocalMutating) return; 


                let needsRefresh = false;

                window.isInjectingCloudData = true;


                try {

                    SYNC_CONFIG.staticKeys.forEach(key => {

                        const cloudVal = state[key];

                        const localVal = localStorage.getItem(key);

                        if (typeof cloudVal === 'string' && cloudVal !== localVal) {

                            originalSetItem.call(localStorage, key, cloudVal);

                            needsRefresh = true;

                        }

                    });


                    Object.keys(state).forEach(key => {

                        if (key.startsWith('todo_') || key.startsWith('journal_')) {

                            const cloudVal = state[key];

                            const localVal = localStorage.getItem(key);

                            if (typeof cloudVal === 'string' && cloudVal !== localVal) {

                                originalSetItem.call(localStorage, key, cloudVal);

                                needsRefresh = true;

                            }

                        }

                    });

                } finally {

                    window.isInjectingCloudData = false;

                    window.hasInitialSyncCompleted = true;

                }


                if (needsRefresh) {

                    if (window.AppEvents) {

                        window.AppEvents.emit('SUBJECTS_UPDATED');

                        window.AppEvents.emit('PLANNER_UPDATED');

                        window.AppEvents.emit('DATE_CHANGE', { tab: 'todo', direction: 0 });

                        // FIX: Removed non-existent 'journal' tab reference

                        window.AppEvents.emit('MOMENTUM_SYNCED'); 

                    }

                    if (typeof window.forcePlannerRefresh === 'function') window.forcePlannerRefresh();

                }

            });

    }

};


window.AppDB = AppDB;


// =================================================================

// 3.0 [OPTIMISTIC UI SHIELD & WIRETAP]

// =================================================================

const originalSetItem = Storage.prototype.setItem;


window.isLocalMutating = false;

window.mutationShieldTimer = null;


Storage.prototype.setItem = function(key, value) {

    try { originalSetItem.call(this, key, value); } 

    catch (e) { return; }


    if (window.isInjectingCloudData) return;


    const isTracked = SYNC_CONFIG.staticKeys.includes(key) || 

                      SYNC_CONFIG.dynamicPrefixes.some(prefix => key.startsWith(prefix));


    if (isTracked && AppDB.session && window.hasInitialSyncCompleted) {

        window.isLocalMutating = true;

        clearTimeout(window.mutationShieldTimer);


        window.mutationShieldTimer = setTimeout(() => { window.isLocalMutating = false; }, 2500);


        clearTimeout(window.syncTimeout);

        window.syncTimeout = setTimeout(() => { AppDB.pushToCloud(); }, 1000); 

    }

};