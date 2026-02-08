# Sprite Editor

## Overview

The Sprite Editor is a built-in pixel-art drawing tool in Light Play. It lives as a **tab** — just like Scene, Inspector, Objects, or Assets — and can be positioned anywhere in the editor layout using the drag-and-drop panel system.

It is **not open by default**. Users open it from the **View** menu in the top bar. Once opened, it behaves like any other tab: it can be placed next to the Scene view, stacked in its own panel, or docked to any side of the screen.

---

## Opening & Asset Integration

- **View → Sprite Editor** adds the Sprite Editor tab to the layout.
- **Creating new sprites**: The Sprite Editor allows creating a new blank image by specifying width and height in pixels. The new image is saved as a `.png` file in the project's `Assets/` folder.
- **Editing existing sprites**: When an image file (`.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.webp`) is clicked in the Assets panel, it opens automatically in the Sprite Editor for editing.
- **Auto-save to Assets**: Edits are saved back to the original file in the `Assets/` folder. The user can also "Save As" to create a new file.

---

## Canvas

- The drawing canvas displays the image at a zoomable pixel grid.
- **Grid overlay** shows individual pixel boundaries when zoomed in (toggleable).
- **Checkerboard background** behind transparent pixels, so users can clearly see alpha transparency.
- **Zoom**: Mouse wheel to zoom in/out. Zoom level displayed in the toolbar.
- **Pan**: Right-click drag or middle-click drag to pan the canvas.
- The user defines the **texture size** (width × height in pixels) when creating a new image. The canvas can also be resized later.

---

## Color Picker

- **32-bit RGBA color picker** with full control over Red, Green, Blue, and Alpha channels.
- **Hue/Saturation/Lightness** wheel or strip for intuitive color selection.
- **Alpha slider** (0–255 or 0%–100%) for setting transparency per-stroke.
- **Hex input** for typing exact color values (e.g. `#FF5733FF`).
- **Foreground / Background colors** — left-click draws with the foreground color, right-click draws with the background color. Click to swap.
- **Color palette** — a row of saved swatches the user can add to, remove from, and click to quickly select.
- **Recent colors** — automatically tracks the last several colors used.

---

## Drawing Tools

All standard pixel-art tools, accessible via toolbar buttons and keyboard shortcuts:

| Tool | Shortcut | Description |
|---|---|---|
| **Pencil** | `B` | Draw individual pixels. Size: 1px or configurable brush size. |
| **Eraser** | `E` | Set pixels to fully transparent. Configurable size. |
| **Bucket Fill** | `G` | Flood-fill a contiguous area of the same color with the current color. Configurable tolerance. |
| **Color Picker / Eyedropper** | `I` | Click a pixel to sample its color as the active foreground color. |
| **Line** | `L` | Click and drag to draw a straight line between two points. |
| **Rectangle** | `U` | Click and drag to draw a rectangle outline or filled rectangle. |
| **Ellipse** | `O` | Click and drag to draw an ellipse outline or filled ellipse. |
| **Selection (Rectangle)** | `M` | Select a rectangular area for copy, cut, move, or delete. |
| **Move** | `V` | Move the current selection or the entire canvas content. |

### Tool Options

- **Brush size** — adjustable for Pencil, Eraser, and Line tools (1px, 2px, 3px, etc.).
- **Shape mode** — Rectangle and Ellipse tools can draw **outline only** or **filled**.
- **Fill tolerance** — Bucket Fill can be set to exact match or a configurable color distance threshold.

---

## Selection & Clipboard

- **Select** a rectangular region with the Selection tool.
- **Copy** (`Ctrl+C`) — copies the selected pixels.
- **Cut** (`Ctrl+X`) — copies and clears the selected pixels.
- **Paste** (`Ctrl+V`) — pastes as a floating selection that can be positioned before committing.
- **Delete** (`Delete`) — clears the selected area to transparent.
- **Select All** (`Ctrl+A`) — selects the entire canvas.
- **Deselect** (`Ctrl+D` or `Escape`) — clears the selection.
- Selection is shown with a **marching ants** (animated dashed border) indicator.

---

## Undo / Redo

- Full **Ctrl+Z / Ctrl+Y** undo/redo support within the Sprite Editor.
- Each drawing stroke, fill, paste, or resize counts as one undo step.
- Separate undo history from the scene editor — the Sprite Editor maintains its own stack.

---

## Canvas Resize

- **Resize Canvas** option in the Sprite Editor toolbar or right-click context menu.
- Set new width and height in pixels.
- Choose anchor point (top-left, center, etc.) to control where the existing content sits in the resized canvas.
- New pixels are transparent by default.

---

## Toolbar Layout

The Sprite Editor toolbar sits at the top or side of the tab and contains:

1. **File actions** — New Sprite, Save, Save As
2. **Canvas info** — Current size (W×H), zoom level
3. **Tool buttons** — All drawing tools with icons and active highlight
4. **Tool options** — Brush size, shape fill mode, tolerance (context-sensitive to active tool)
5. **Color section** — Foreground/background swatches, color picker button, palette strip

---

## Keyboard Shortcuts (Sprite Editor)

| Shortcut | Action |
|---|---|
| `B` | Pencil tool |
| `E` | Eraser tool |
| `G` | Bucket Fill |
| `I` | Eyedropper / Color Picker |
| `L` | Line tool |
| `U` | Rectangle tool |
| `O` | Ellipse tool |
| `M` | Selection tool |
| `V` | Move tool |
| `Ctrl+C` | Copy selection |
| `Ctrl+X` | Cut selection |
| `Ctrl+V` | Paste |
| `Ctrl+A` | Select all |
| `Ctrl+D` | Deselect |
| `Delete` | Clear selection |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `X` | Swap foreground/background colors |
| `[` / `]` | Decrease / increase brush size |
