# Light Play — Basic Concepts

Light Play is **open source** (MIT License). You're free to use, modify, fork, and contribute to it however you like — no restrictions.

This document explains the fundamental building blocks of Light Play and how they fit together.

---

## Projects

A **project** is a folder on your local file system that contains all the data for your game. Light Play uses the browser's File System Access API to read and write files directly to your machine — nothing is stored on a server.

Each project folder contains:

| File | Purpose |
|---|---|
| `project.lplay` | Project metadata (name, version, scene list). JSON format. |
| `scene.lscene` | Scene data (all L-Objects and their properties). JSON format. |
| `Assets/` | Folder for images, audio, and other game resources. |

When you create a new project, Light Play generates the `.lplay` and `.lscene` files automatically. The `Assets` folder can be created from the Assets panel in the editor.

### Recent Projects

Light Play remembers every project you open in the browser using IndexedDB. When you click **Open Project**, you'll see a list of recent projects you can quickly reopen without browsing for the folder again. The last project also auto-opens on page refresh.

---

## Scenes

A **scene** represents one screen or level of your game. Currently, each project has one scene (`scene.lscene`), stored as a JSON file.

A scene contains:
- **Name** — A human-readable label for the scene.
- **Objects** — An array of L-Objects that make up the scene content.
- **Metadata** — Version, creation date, last modified timestamp.

---

## L-Objects

An **L-Object** (Light Object) is the fundamental entity in a scene. Every item in your game — a character, a platform, a background element — is an L-Object.

Every L-Object has these core properties:

| Property | Type | Description |
|---|---|---|
| `id` | String | Unique identifier (e.g. `obj_1`, `player`, `enemy_3`) |
| `position` | `{x, y}` | World-space coordinates |
| `zIndex` | Number | Drawing order (higher = drawn on top) |
| `rotation` | Number | Rotation in degrees |
| `components` | Array | Extensible list of behaviors (future feature) |

### Creating L-Objects

You can create new L-Objects in several ways:
- **Edit menu** → Create Empty L-Object
- **Objects panel** → Click the "+ Add" button
- Objects are created at position (0, 0) and automatically selected.

### Manipulating L-Objects

Select an L-Object by clicking it in the scene view or the Objects list. Once selected:

- **Position tool (W)** — Drag the red (X) or green (Y) arrows to move along one axis, or the yellow square for free movement.
- **Rotation tool (E)** — Drag the orange ring to rotate the object.
- **Inspector panel** — Type exact values for position, rotation, z-index, or rename the object.

### Snapping

Hold **Ctrl** while dragging to snap:
- Position snaps to **integer grid units** (1, 2, 3...)
- Rotation snaps to **15-degree increments** (0°, 15°, 30°, 45°...)

---

## Components

L-Objects have a `components` array that will be used to attach behaviors and data in future versions. Examples might include:
- Sprite renderer (display an image from Assets)
- Collider (define a physics shape)
- Script (attach custom game logic)

Components are the primary extension mechanism — they turn a simple positioned object into a functional game entity.

---

## Editor Layout

The editor uses a **panel system** with resizable, rearrangeable sections:

### Default Layout

| Area | Panel | Purpose |
|---|---|---|
| Left (large) | **Scene** | 2D canvas view of your scene |
| Top-right | **Inspector** | Properties of the selected L-Object |
| Middle-right | **Objects** | List of all L-Objects in the scene |
| Bottom-right | **Assets** | File browser for the project's Assets folder |

### Customizing the Layout

- **Resize** panels by dragging the dividers between them.
- **Move tabs** by dragging a tab and dropping it:
  - On another panel's **center** — adds the tab to that panel.
  - On a panel's **edge** (left, right, top, bottom) — creates a new split.
- **Switch tabs** by clicking them when multiple tabs share a panel.

### Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `W` | Switch to Position tool |
| `E` | Switch to Rotation tool |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |

---

## Camera Controls

Navigate the scene view with these controls:

| Input | Action |
|---|---|
| Right-click drag | Pan the camera |
| Middle-click drag | Pan the camera |
| Alt + left-click drag | Pan the camera |
| Mouse wheel | Zoom in/out |

The grid displays world-space units. The origin (0, 0) is marked by colored axis lines: **red** for the vertical X-axis, **green** for the horizontal Y-axis.

---

## Undo / Redo

Light Play maintains a history of up to 100 operations. Every significant change — adding, removing, moving, rotating, renaming, or re-ordering objects — can be undone with **Ctrl+Z** and redone with **Ctrl+Y**.

The undo system also works from the **Edit** menu.

---

## Auto-Save

The scene is automatically saved to disk 2 seconds after any change. There's no need to manually save unless you want to force an immediate save via **File → Save Project**.

---

## Assets

The **Assets panel** shows the contents of the `Assets/` folder inside your project directory. This is where you place images, audio files, and other resources your game will use.

- Supported file types are shown with category labels (Image, Audio, Video, Data).
- The panel **auto-refreshes** every 3 seconds to detect new files.
- Click **Refresh** to manually reload the file list.

If the `Assets` folder doesn't exist yet, the panel offers a button to create it.

---

## File Formats

### project.lplay

```json
{
  "name": "My Game",
  "version": "1.0.0",
  "createdAt": "2026-02-08T12:00:00.000Z",
  "lastModified": "2026-02-08T12:30:00.000Z",
  "scenes": ["scene.lscene"]
}
```

### scene.lscene

```json
{
  "name": "Main Scene",
  "version": "1.0.0",
  "createdAt": "2026-02-08T12:00:00.000Z",
  "lastModified": "2026-02-08T12:30:00.000Z",
  "objects": [
    {
      "id": "player",
      "position": { "x": 0, "y": 0 },
      "zIndex": 1,
      "rotation": 0,
      "components": []
    }
  ]
}
```
