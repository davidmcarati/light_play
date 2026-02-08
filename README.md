# Light Play

A lightweight, browser-based 2D game engine and creative suite. Build, edit, and play 2D games entirely in your browser — no installs, no accounts, no cloud required.

## What is Light Play?

Light Play is a local-first 2D game engine that runs entirely in the browser. Create projects stored on your own machine, design scenes with L-Objects, manage assets, and build 2D games without ever leaving your browser tab.

Everything runs locally. Your projects, assets, and settings stay on your machine.

## Current Features

- **Project Management** — Create, open, save, and auto-save local projects (`.lplay` / `.lscene` JSON files)
- **Recent Projects** — Browser remembers previously opened projects for quick re-opening
- **Auto-Reopen** — Last project auto-opens on page refresh (no re-picking folders)
- **Scene Editor** — 2D canvas with grid, camera pan/zoom, and L-Object placement
- **L-Objects** — Game objects with position, rotation, z-index, and extensible components
- **Gizmos** — Visual controls for position (X/Y arrows, free-move) and rotation (ring handle)
- **Inspector** — Edit selected L-Object properties (position, rotation, z-index, ID)
- **Objects List** — View, select, add, and delete all scene objects
- **Assets Browser** — Browse the project's Assets folder; auto-refreshes when files change
- **Undo/Redo** — Full Ctrl+Z / Ctrl+Y support across all editor operations
- **Snap to Grid** — Hold Ctrl while dragging for discrete position (1-unit) and rotation (15°) snapping
- **Customizable Layout** — Drag tabs between panels, drop on edges to create new splits, resize with dividers
- **Menu Bar** — File (Save, Close), Edit (Undo, Redo, Create L-Object), View menus with keyboard shortcuts
- **Auto-Save** — Scene auto-saves 2 seconds after any change

## Tech Stack

| Layer | Technology |
|---|---|
| Language | Vanilla JavaScript (ES Modules) |
| Rendering | HTML5 Canvas |
| Storage | IndexedDB, localStorage, File System Access API |
| Server | Any static file server (e.g. `npx serve`) |
| Testing | Custom browser test runner + Puppeteer for headless |

## Getting Started

1. Clone the repository
2. Run the development server:
   ```
   start_server.bat
   ```
   Or manually: `npx serve . -p 5500`
3. Open `http://localhost:5500` in a Chromium-based browser (Chrome, Edge, Brave)
4. Click **New Project** to create a project, or **Open Project** to load an existing one

## Running Tests

```
node run_tests.js 5500
```

Make sure the dev server is running on port 5500 first.

## Project Structure

```
light_play/
├── index.html              — App entry point
├── tests.html              — Test suite entry point
├── run_tests.js            — Puppeteer headless test runner
├── start_server.bat        — Start dev server
├── stop_server.bat         — Stop dev server
├── src/
│   ├── main.js             — App bootstrap & auto-reopen
│   ├── core/
│   │   ├── project.js      — Project/scene file I/O
│   │   ├── editor_state.js — Centralized state + undo/redo
│   │   ├── auto_save.js    — Debounced auto-save
│   │   └── recent_projects.js — IndexedDB recent projects
│   ├── ui/
│   │   ├── welcome_screen.js — Welcome screen + recent projects
│   │   ├── editor_screen.js  — Main editor layout
│   │   ├── menu_bar.js       — Top menu bar
│   │   ├── panel_system.js   — Resizable, draggable panel/tab system
│   │   ├── modal.js          — Reusable modal dialogs
│   │   ├── notification.js   — Toast notifications
│   │   └── tabs/
│   │       ├── scene_view.js    — 2D canvas scene renderer
│   │       ├── inspector.js     — Selected object property editor
│   │       ├── objects_list.js  — Scene objects list
│   │       └── assets_browser.js — Project assets file browser
│   ├── styles/
│   │   └── main.css         — All application styles
│   └── tests/               — Browser-based test suites
└── Documentation/
    ├── 0_InitialIdea.md     — Project vision
    └── 1_BasicConcepts.md   — Core concepts guide
```

## Browser Requirements

Requires a **Chromium-based browser** (Chrome, Edge, Opera, Brave) for the File System Access API. Must be accessed via `localhost` or `HTTPS`.

## Contributing

Light Play is fully **open source**. Feel free to use it, fork it, modify it, learn from it, build on top of it — whatever you like, however you like. Contributions of any kind are welcome: bug fixes, new features, documentation, ideas, or just sharing the project.

1. Fork the repo
2. Create a branch for your change
3. Submit a pull request

No contributor agreement, no hoops to jump through. Just code.

## License

This project is released under the [MIT License](LICENSE). Use it for anything — personal, commercial, educational — no restrictions.
