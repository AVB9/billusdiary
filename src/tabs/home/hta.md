# Billu's Diary: Home Tab Architecture Documentation

## Overview
The Home Tab is a highly interactive, customizable "Bento Box" dashboard built on top of `react-grid-layout` (RGL). It features persistent local storage, a time-aware dynamic greeting, and a robust edit mode. 

The architecture is explicitly designed to work around RGL's DOM cloning quirks, utilizing custom CSS, dynamic SVG focus rings, and strict `ResizeObserver` lifecycle management to achieve a native, fluid UI.

---

## Component Breakdown

### 1. `HomeTab.jsx` (The Orchestrator)
This is the parent container that manages the global layout state and Edit Mode logic.

* **State Management (`userLayout`)**: Layout state is initialized from and synced to `localStorage` under the key `bento_layout_v4`. 
* **Edit Mode Lifecycle**: 
  * `backupLayout` takes a snapshot of the current state when entering Edit Mode.
  * If the user clicks "Cancel", the layout reverts to `backupLayout`.
  * If the user clicks "Done", changes are finalized and synced to local storage via a `useEffect`.
* **Optimum Size Engine**: The `getOptimumSize` function checks `WIDGET_DICTIONARY` for device-specific optimum widths and heights (`oDW`/`oMW`) when spawning new widgets or resetting the layout.
* **Reset Layout**: The `handleResetLayout` function resets all widgets to their optimum sizes and forces `x: 0, y: 0`. RGL's gravity engine then naturally "Tetris-packs" them downwards.

### 2. `grid.jsx` (The Physics & Visual Engine)
This component wraps the RGL engine. It is highly optimized to prevent RGL from losing refs or causing layout flickers.

* **Flicker-Free Sizing**: Uses a `ResizeObserver` to monitor container width. When the tab mounts or the window resizes, it instantly sets `transitionsOn = false`, snaps the grid to the new width, and uses nested `requestAnimationFrame` and `setTimeout` calls to turn gliding animations back on only *after* the browser has painted the frame.
* **The "Ghost Handle" & `SmartFocusRing`**: 
  * We **do not** use RGL's `resizeHandle` prop with custom React components, as RGL's cloning engine will drop the ref and cause bugs.
  * Instead, we let RGL render its native, invisible hit-box. 
  * We use a custom SVG component (`SmartFocusRing`) with `pointer-events: none` that sits perfectly over the hit-box.
* **Dynamic SVG Math**: `SmartFocusRing` uses its own `ResizeObserver` to constantly redraw its `path`. This allows us to use `strokeLinecap="round"` to create perfect pill-shaped gaps and dual-theme colors (`--color-main` and `--color-accent`) that scale flawlessly no matter how wide the widget gets.
* **Instant Focus (`onPointerDown`)**: We use `onPointerDown` instead of `onClick` to instantly snap the focus ring to a widget the millisecond it is touched, preventing visual delay before a drag starts.
* **Global Resizing State (`isResizingGlobal`)**: Hooked into RGL's `onResizeStart` and `onResizeStop`. This dynamically applies an `.is-resizing` class to the grid layout, allowing our CSS to hide the RGL placeholder (the dashed blue box) while actively resizing.

### 3. `Greetings.jsx` (The Personalization Layer)
A lightweight header component that greets the user.

* **Time-Aware**: Checks `new Date().getHours()` to determine the time block (e.g., morning, afternoon, night).
* **Dynamic Assets**: Updates the icon (Sun/Moon) and the sub-greeting text (e.g., "gumiimornin", "sleepii time") based on the current hour.
* **CSS Fade Sequence**: Uses a combination of `setTimeout` and local state (`isFading`) to smoothly fade the sub-greeting text out and swap it with a message after 3.5 seconds.

---

## Critical CSS Integrations (`hometab.css`)

The CSS file contains surgical overrides required to make RGL behave smoothly. **Do not alter these without testing.**

1. **Red Ring Override**: 
   * Browsers aggressively apply `:focus` and `box-shadow` during drag-and-drop operations.
   * `outline: none !important` and `box-shadow: none !important` are applied to `.react-grid-item` and `.react-draggable-dragging` to strip these browser defaults.
   * `-webkit-tap-highlight-color: transparent` prevents mobile blue-tap boxes.
2. **Synchronized Slide-Up Animation**:
   * Instead of staggering `nth-child`, all widgets use a synchronized `.revealed` class triggered by JS.
   * This prevents visual chaos if the user reorders the DOM elements (e.g., moving widget #8 to spot #1).
   * **Important Override**: `.react-draggable-dragging` and `.react-resizable-resizing` are forced to `opacity: 1 !important; animation: none !important;` to ensure widgets do not turn invisible if RGL strips the revealed class during active physics interactions.