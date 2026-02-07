import {
    getEditorState,
    subscribe,
    selectObject,
    deselectObject,
    getSelectedObject,
    updateObjectPosition,
    updateObjectRotation,
    pushUndoState
} from "../../core/editor_state.js";

const OBJECT_SIZE = 1;
const HANDLE_RADIUS = 6;
const ROTATION_RING_RADIUS = 1.2;
const GRID_UNIT = 1;

let _canvas = null;
let _ctx = null;
let _unsubscribe = null;
let _dragState = null;
let _camera = { x: 0, y: 0, zoom: 40 };
let _resizeObserver = null;
let _boundOnMouseMove = null;
let _boundOnMouseUp = null;

function renderSceneView(container) {
    cleanup();
    container.innerHTML = "";

    _canvas = document.createElement("canvas");
    _canvas.className = "scene-canvas";
    container.appendChild(_canvas);

    _ctx = _canvas.getContext("2d");

    _resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
    });
    _resizeObserver.observe(container);

    _canvas.addEventListener("mousedown", onMouseDown);
    _canvas.addEventListener("wheel", onWheel, { passive: false });
    _canvas.addEventListener("contextmenu", (e) => e.preventDefault());

    _boundOnMouseMove = onMouseMove.bind(null);
    _boundOnMouseUp = onMouseUp.bind(null);
    window.addEventListener("mousemove", _boundOnMouseMove);
    window.addEventListener("mouseup", _boundOnMouseUp);

    _unsubscribe = subscribe(() => draw());

    requestAnimationFrame(() => {
        resizeCanvas();
    });
}

function cleanup() {
    if (_unsubscribe) {
        _unsubscribe();
        _unsubscribe = null;
    }
    if (_resizeObserver) {
        _resizeObserver.disconnect();
        _resizeObserver = null;
    }
    if (_boundOnMouseMove) {
        window.removeEventListener("mousemove", _boundOnMouseMove);
        _boundOnMouseMove = null;
    }
    if (_boundOnMouseUp) {
        window.removeEventListener("mouseup", _boundOnMouseUp);
        _boundOnMouseUp = null;
    }
}

function resizeCanvas() {
    if (!_canvas || !_canvas.parentElement) return;
    const w = _canvas.parentElement.clientWidth;
    const h = _canvas.parentElement.clientHeight;
    if (w === 0 || h === 0) return;
    _canvas.width = w;
    _canvas.height = h;
    draw();
}

function worldToScreen(wx, wy) {
    const sx = (wx - _camera.x) * _camera.zoom + _canvas.width / 2;
    const sy = (wy - _camera.y) * _camera.zoom + _canvas.height / 2;
    return { x: sx, y: sy };
}

function screenToWorld(sx, sy) {
    const wx = (sx - _canvas.width / 2) / _camera.zoom + _camera.x;
    const wy = (sy - _canvas.height / 2) / _camera.zoom + _camera.y;
    return { x: wx, y: wy };
}

function draw() {
    if (!_ctx || !_canvas) return;
    if (_canvas.width === 0 || _canvas.height === 0) return;
    const state = getEditorState();
    if (!state) return;

    const w = _canvas.width;
    const h = _canvas.height;

    _ctx.clearRect(0, 0, w, h);

    _ctx.fillStyle = "#151515";
    _ctx.fillRect(0, 0, w, h);

    drawGrid();

    const objects = state.sceneData ? state.sceneData.objects : [];
    const sorted = [...objects].sort((a, b) => a.zIndex - b.zIndex);

    sorted.forEach(obj => {
        drawObject(obj, obj.id === state.selectedObjectId);
    });

    const selected = getSelectedObject();
    if (selected) {
        if (state.activeTool === "position") {
            drawPositionGizmo(selected);
        } else if (state.activeTool === "rotation") {
            drawRotationGizmo(selected);
        }
    }
}

function drawGrid() {
    const pixelsPerUnit = GRID_UNIT * _camera.zoom;

    let step = GRID_UNIT;
    if (pixelsPerUnit < 8) {
        step = GRID_UNIT * Math.ceil(8 / pixelsPerUnit);
    }

    const gridPx = step * _camera.zoom;

    const offsetX = ((-_camera.x * _camera.zoom + _canvas.width / 2) % gridPx + gridPx) % gridPx;
    const offsetY = ((-_camera.y * _camera.zoom + _canvas.height / 2) % gridPx + gridPx) % gridPx;

    _ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    _ctx.lineWidth = 1;
    _ctx.beginPath();

    for (let x = offsetX; x < _canvas.width; x += gridPx) {
        _ctx.moveTo(Math.round(x) + 0.5, 0);
        _ctx.lineTo(Math.round(x) + 0.5, _canvas.height);
    }
    for (let y = offsetY; y < _canvas.height; y += gridPx) {
        _ctx.moveTo(0, Math.round(y) + 0.5);
        _ctx.lineTo(_canvas.width, Math.round(y) + 0.5);
    }
    _ctx.stroke();

    const origin = worldToScreen(0, 0);

    _ctx.strokeStyle = "rgba(233, 69, 96, 0.4)";
    _ctx.lineWidth = 1.5;
    _ctx.beginPath();
    _ctx.moveTo(Math.round(origin.x) + 0.5, 0);
    _ctx.lineTo(Math.round(origin.x) + 0.5, _canvas.height);
    _ctx.stroke();

    _ctx.strokeStyle = "rgba(46, 204, 113, 0.4)";
    _ctx.beginPath();
    _ctx.moveTo(0, Math.round(origin.y) + 0.5);
    _ctx.lineTo(_canvas.width, Math.round(origin.y) + 0.5);
    _ctx.stroke();
    _ctx.lineWidth = 1;
}

function drawObject(obj, isSelected) {
    const screen = worldToScreen(obj.position.x, obj.position.y);
    const size = OBJECT_SIZE * _camera.zoom;
    const half = size / 2;

    _ctx.save();
    _ctx.translate(screen.x, screen.y);
    _ctx.rotate((obj.rotation * Math.PI) / 180);

    _ctx.fillStyle = isSelected ? "rgba(233, 69, 96, 0.35)" : "rgba(160, 160, 180, 0.25)";
    _ctx.strokeStyle = isSelected ? "#e94560" : "#8888aa";
    _ctx.lineWidth = isSelected ? 2 : 1;
    _ctx.fillRect(-half, -half, size, size);
    _ctx.strokeRect(-half, -half, size, size);

    _ctx.restore();

    _ctx.fillStyle = "#bbb";
    _ctx.font = "11px 'Segoe UI', sans-serif";
    _ctx.textAlign = "center";
    _ctx.fillText(obj.id, screen.x, screen.y + half + 14);
}

function drawPositionGizmo(obj) {
    const screen = worldToScreen(obj.position.x, obj.position.y);
    const arrowLen = 60;
    const headSize = 10;

    _ctx.lineWidth = 3;

    _ctx.strokeStyle = "#e94560";
    _ctx.beginPath();
    _ctx.moveTo(screen.x, screen.y);
    _ctx.lineTo(screen.x + arrowLen, screen.y);
    _ctx.stroke();

    _ctx.fillStyle = "#e94560";
    _ctx.beginPath();
    _ctx.moveTo(screen.x + arrowLen + headSize, screen.y);
    _ctx.lineTo(screen.x + arrowLen - headSize * 0.5, screen.y - headSize * 0.6);
    _ctx.lineTo(screen.x + arrowLen - headSize * 0.5, screen.y + headSize * 0.6);
    _ctx.closePath();
    _ctx.fill();

    _ctx.strokeStyle = "#2ecc71";
    _ctx.beginPath();
    _ctx.moveTo(screen.x, screen.y);
    _ctx.lineTo(screen.x, screen.y - arrowLen);
    _ctx.stroke();

    _ctx.fillStyle = "#2ecc71";
    _ctx.beginPath();
    _ctx.moveTo(screen.x, screen.y - arrowLen - headSize);
    _ctx.lineTo(screen.x - headSize * 0.6, screen.y - arrowLen + headSize * 0.5);
    _ctx.lineTo(screen.x + headSize * 0.6, screen.y - arrowLen + headSize * 0.5);
    _ctx.closePath();
    _ctx.fill();

    _ctx.fillStyle = "rgba(255, 200, 50, 0.5)";
    _ctx.strokeStyle = "rgba(255, 200, 50, 0.8)";
    _ctx.lineWidth = 1;
    const sqSize = 14;
    _ctx.fillRect(screen.x, screen.y - sqSize, sqSize, sqSize);
    _ctx.strokeRect(screen.x, screen.y - sqSize, sqSize, sqSize);
}

function drawRotationGizmo(obj) {
    const screen = worldToScreen(obj.position.x, obj.position.y);
    const radius = 50;

    _ctx.strokeStyle = "#f39c12";
    _ctx.lineWidth = 3;
    _ctx.setLineDash([6, 4]);
    _ctx.beginPath();
    _ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    _ctx.stroke();
    _ctx.setLineDash([]);

    const angle = (obj.rotation * Math.PI) / 180;
    const hx = screen.x + Math.cos(angle) * radius;
    const hy = screen.y + Math.sin(angle) * radius;

    _ctx.fillStyle = "#f39c12";
    _ctx.strokeStyle = "#fff";
    _ctx.lineWidth = 2;
    _ctx.beginPath();
    _ctx.arc(hx, hy, HANDLE_RADIUS + 2, 0, Math.PI * 2);
    _ctx.fill();
    _ctx.stroke();

    _ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
    _ctx.lineWidth = 1;
    _ctx.beginPath();
    _ctx.moveTo(screen.x, screen.y);
    _ctx.lineTo(hx, hy);
    _ctx.stroke();
}

function onMouseDown(e) {
    const rect = _canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const state = getEditorState();
    if (!state || !state.sceneData) return;

    if (e.button === 2 || e.button === 1 || (e.button === 0 && e.altKey)) {
        _dragState = { type: "pan", startX: mx, startY: my, camStartX: _camera.x, camStartY: _camera.y };
        _canvas.style.cursor = "grabbing";
        return;
    }

    if (e.button !== 0) return;

    const selected = getSelectedObject();
    if (selected) {
        const screen = worldToScreen(selected.position.x, selected.position.y);

        if (state.activeTool === "position") {
            const arrowLen = 60;
            const headSize = 10;
            const hitRadius = HANDLE_RADIUS + 6;

            const xTipX = screen.x + arrowLen + headSize * 0.5;
            const xTipY = screen.y;
            if (dist(mx, my, xTipX, xTipY) < hitRadius) {
                pushUndoState();
                _dragState = { type: "move_x", objectId: selected.id, startMx: mx, startPos: { ...selected.position } };
                return;
            }

            const yTipX = screen.x;
            const yTipY = screen.y - arrowLen - headSize * 0.5;
            if (dist(mx, my, yTipX, yTipY) < hitRadius) {
                pushUndoState();
                _dragState = { type: "move_y", objectId: selected.id, startMy: my, startPos: { ...selected.position } };
                return;
            }

            const sqSize = 14;
            if (mx >= screen.x && mx <= screen.x + sqSize && my >= screen.y - sqSize && my <= screen.y) {
                pushUndoState();
                _dragState = { type: "move_free", objectId: selected.id, startMx: mx, startMy: my, startPos: { ...selected.position } };
                return;
            }

            const xLineDist = pointToSegmentDist(mx, my, screen.x, screen.y, screen.x + arrowLen, screen.y);
            if (xLineDist < 6) {
                pushUndoState();
                _dragState = { type: "move_x", objectId: selected.id, startMx: mx, startPos: { ...selected.position } };
                return;
            }

            const yLineDist = pointToSegmentDist(mx, my, screen.x, screen.y, screen.x, screen.y - arrowLen);
            if (yLineDist < 6) {
                pushUndoState();
                _dragState = { type: "move_y", objectId: selected.id, startMy: my, startPos: { ...selected.position } };
                return;
            }
        }

        if (state.activeTool === "rotation") {
            const radius = 50;
            const d = dist(mx, my, screen.x, screen.y);
            if (Math.abs(d - radius) < 12) {
                pushUndoState();
                _dragState = { type: "rotate", objectId: selected.id, cx: screen.x, cy: screen.y };
                return;
            }
        }
    }

    const world = screenToWorld(mx, my);
    let hitObject = null;
    const objects = [...state.sceneData.objects].reverse();
    for (const obj of objects) {
        const half = OBJECT_SIZE / 2;
        if (world.x >= obj.position.x - half && world.x <= obj.position.x + half &&
            world.y >= obj.position.y - half && world.y <= obj.position.y + half) {
            hitObject = obj;
            break;
        }
    }

    if (hitObject) {
        selectObject(hitObject.id);
        pushUndoState();
        _dragState = { type: "move_free", objectId: hitObject.id, startMx: mx, startMy: my, startPos: { ...hitObject.position } };
    } else {
        deselectObject();
    }
}

function onMouseMove(e) {
    if (!_dragState || !_canvas) return;
    const rect = _canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (_dragState.type === "pan") {
        const dx = (mx - _dragState.startX) / _camera.zoom;
        const dy = (my - _dragState.startY) / _camera.zoom;
        _camera.x = _dragState.camStartX - dx;
        _camera.y = _dragState.camStartY - dy;
        draw();
        return;
    }

    if (_dragState.type === "move_free") {
        const dx = (mx - _dragState.startMx) / _camera.zoom;
        const dy = (my - _dragState.startMy) / _camera.zoom;
        let newX = _dragState.startPos.x + dx;
        let newY = _dragState.startPos.y + dy;
        if (e.ctrlKey) {
            newX = Math.round(newX);
            newY = Math.round(newY);
        }
        updateObjectPosition(_dragState.objectId, newX, newY);
        return;
    }

    if (_dragState.type === "move_x") {
        const dx = (mx - _dragState.startMx) / _camera.zoom;
        let newX = _dragState.startPos.x + dx;
        if (e.ctrlKey) {
            newX = Math.round(newX);
        }
        updateObjectPosition(_dragState.objectId, newX, _dragState.startPos.y);
        return;
    }

    if (_dragState.type === "move_y") {
        const dy = (my - _dragState.startMy) / _camera.zoom;
        let newY = _dragState.startPos.y - dy;
        if (e.ctrlKey) {
            newY = Math.round(newY);
        }
        updateObjectPosition(_dragState.objectId, _dragState.startPos.x, newY);
        return;
    }

    if (_dragState.type === "rotate") {
        const angle = Math.atan2(my - _dragState.cy, mx - _dragState.cx);
        let degrees = (angle * 180) / Math.PI;
        if (e.ctrlKey) {
            degrees = Math.round(degrees / 15) * 15;
        } else {
            degrees = Math.round(degrees);
        }
        updateObjectRotation(_dragState.objectId, degrees);
        return;
    }
}

function onMouseUp() {
    if (_dragState && _dragState.type === "pan" && _canvas) {
        _canvas.style.cursor = "";
    }
    _dragState = null;
}

function onWheel(e) {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    _camera.zoom = Math.max(5, Math.min(200, _camera.zoom * zoomFactor));
    draw();
}

function dist(x1, y1, x2, y2) {
    return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function pointToSegmentDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return dist(px, py, ax, ay);
    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));
    return dist(px, py, ax + t * dx, ay + t * dy);
}

export { renderSceneView };
