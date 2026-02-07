# Light Play — Initial Idea

## Overview

**Light Play** is an online 2D game engine and creative suite that runs entirely in the browser. It empowers users to design, build, and play 2D games without installing any software. The engine leverages **local storage** and **local project files** to keep everything on the user's machine — no mandatory cloud accounts, no server dependencies for core workflows.

## Core Vision

- **Zero-install, browser-first** — Open a URL and start building.
- **Offline-capable** — Once loaded, the engine works without an internet connection.
- **Local-first data** — Projects, assets, and settings are stored locally (IndexedDB / localStorage / File System Access API), giving users full ownership of their data.
- **All-in-one creative suite** — Built-in image/sprite editor, tilemap editor, animation timeline, and scene composer so users rarely need to leave the tool.

## Key Features (High Level)

### 1. Project Management
- Create, open, save, and export local projects.
- Project file format (e.g. `.lplay` or folder-based) that bundles all assets and scenes.
- Import/export for sharing projects with others.

### 2. Image & Sprite Editor
- Pixel-art and vector drawing tools.
- Layer support, color palettes, and onion-skinning.
- Sprite-sheet generation and slicing.

### 3. Tilemap Editor
- Paint tiles onto grid-based maps.
- Multiple tile layers with collision/metadata tagging.
- Auto-tiling rules.

### 4. Animation System
- Frame-by-frame and skeletal animation support.
- Animation timeline with keyframes and easing.
- Preview animations in real time.

### 5. Scene / Level Editor
- Drag-and-drop placement of sprites, tilemaps, and objects.
- Camera, lighting, and parallax configuration.
- Entity/component inspector for attaching behaviors.

### 6. Scripting & Logic
- Visual scripting (node-based) for beginners.
- Code scripting (JavaScript/TypeScript) for advanced users.
- Event system (input, collision, lifecycle hooks).

### 7. Game Runtime
- Built-in play/test mode with hot-reload.
- One-click export to a standalone HTML5 package.
- Responsive controls (keyboard, mouse, touch, gamepad).

### 8. Asset Library
- Bundled starter assets (sprites, tiles, sounds).
- Import custom images, audio, and fonts from local files.

## Tech Stack (Planned)

| Layer | Technology |
|---|---|
| UI Framework | React (or lightweight alternative) |
| Rendering | HTML5 Canvas / WebGL (PixiJS or custom) |
| Storage | IndexedDB, localStorage, File System Access API |
| Scripting | JavaScript / TypeScript (sandboxed) |
| Build / Tooling | Vite, TypeScript |
| Export | Static HTML5 bundle |

## Design Principles

1. **Simplicity first** — A beginner should be able to make a simple game in minutes.
2. **Progressive complexity** — Power features are available but never forced.
3. **Performance** — Smooth 60 fps editing and gameplay on mid-range hardware.
4. **Privacy** — No telemetry, no forced sign-up. The user's work stays on their machine.

## What This Is NOT

- Not a 3D engine.
- Not a cloud-hosted SaaS (though cloud sync may be an optional add-on later).
- Not trying to replace Unity/Godot — it targets quick prototyping, game jams, education, and small indie projects.

---

*This document captures the founding idea. Detailed specs, architecture, and roadmaps will follow in subsequent documents.*
