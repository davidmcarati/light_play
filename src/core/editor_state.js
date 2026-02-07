import { createLObject } from "./project.js";

let _state = null;
let _listeners = [];
let _undoStack = [];
let _redoStack = [];
let _dirty = false;
const MAX_UNDO_STEPS = 100;

function _deepCloneObjects(objects) {
    return JSON.parse(JSON.stringify(objects));
}

function _saveSnapshot() {
    return {
        objects: _deepCloneObjects(_state.sceneData.objects),
        selectedObjectId: _state.selectedObjectId,
        nextObjectId: _state.nextObjectId
    };
}

function _restoreSnapshot(snapshot) {
    _state.sceneData.objects = _deepCloneObjects(snapshot.objects);
    _state.selectedObjectId = snapshot.selectedObjectId;
    _state.nextObjectId = snapshot.nextObjectId;
}

function pushUndoState() {
    if (!_state) return;
    _undoStack.push(_saveSnapshot());
    if (_undoStack.length > MAX_UNDO_STEPS) {
        _undoStack.shift();
    }
    _redoStack.length = 0;
}

function undo() {
    if (!_state || _undoStack.length === 0) return false;
    _redoStack.push(_saveSnapshot());
    const snapshot = _undoStack.pop();
    _restoreSnapshot(snapshot);
    _dirty = true;
    _notify();
    return true;
}

function redo() {
    if (!_state || _redoStack.length === 0) return false;
    _undoStack.push(_saveSnapshot());
    const snapshot = _redoStack.pop();
    _restoreSnapshot(snapshot);
    _dirty = true;
    _notify();
    return true;
}

function canUndo() {
    return _undoStack.length > 0;
}

function canRedo() {
    return _redoStack.length > 0;
}

function isDirty() {
    return _dirty;
}

function clearDirty() {
    _dirty = false;
}

function initEditorState(project) {
    _state = {
        project: project,
        sceneData: project.sceneData,
        selectedObjectId: null,
        activeTool: "position",
        nextObjectId: 1
    };

    _undoStack.length = 0;
    _redoStack.length = 0;
    _dirty = false;

    if (_state.sceneData && _state.sceneData.objects) {
        _state.sceneData.objects.forEach(obj => {
            const numPart = parseInt(obj.id.replace("obj_", ""), 10);
            if (!isNaN(numPart) && numPart >= _state.nextObjectId) {
                _state.nextObjectId = numPart + 1;
            }
        });
    }

    _notify();
    return _state;
}

function getEditorState() {
    return _state;
}

function subscribe(listener) {
    _listeners.push(listener);
    return function unsubscribe() {
        _listeners = _listeners.filter(l => l !== listener);
    };
}

function _notify() {
    _listeners.forEach(fn => fn(_state));
}

function selectObject(id) {
    _state.selectedObjectId = id;
    _notify();
}

function deselectObject() {
    _state.selectedObjectId = null;
    _notify();
}

function getSelectedObject() {
    if (!_state || !_state.selectedObjectId) return null;
    return _state.sceneData.objects.find(o => o.id === _state.selectedObjectId) || null;
}

function setActiveTool(tool) {
    if (tool !== "position" && tool !== "rotation") return;
    _state.activeTool = tool;
    _notify();
}

function addNewLObject() {
    pushUndoState();
    const id = "obj_" + _state.nextObjectId++;
    const obj = createLObject(id, 0, 0, 0, 0);
    _state.sceneData.objects.push(obj);
    _state.selectedObjectId = id;
    _dirty = true;
    _notify();
    return obj;
}

function removeObject(id) {
    const idx = _state.sceneData.objects.findIndex(o => o.id === id);
    if (idx === -1) return;
    pushUndoState();
    _state.sceneData.objects.splice(idx, 1);
    if (_state.selectedObjectId === id) {
        _state.selectedObjectId = null;
    }
    _dirty = true;
    _notify();
}

function updateObjectPosition(id, x, y) {
    const obj = _state.sceneData.objects.find(o => o.id === id);
    if (!obj) return;
    obj.position.x = x;
    obj.position.y = y;
    _dirty = true;
    _notify();
}

function updateObjectRotation(id, rotation) {
    const obj = _state.sceneData.objects.find(o => o.id === id);
    if (!obj) return;
    obj.rotation = rotation;
    _dirty = true;
    _notify();
}

function updateObjectZIndex(id, zIndex) {
    const obj = _state.sceneData.objects.find(o => o.id === id);
    if (!obj) return;
    pushUndoState();
    obj.zIndex = zIndex;
    _dirty = true;
    _notify();
}

function renameObject(id, newId) {
    const obj = _state.sceneData.objects.find(o => o.id === id);
    if (!obj) return false;
    const duplicate = _state.sceneData.objects.find(o => o.id === newId);
    if (duplicate) return false;
    pushUndoState();
    obj.id = newId;
    if (_state.selectedObjectId === id) {
        _state.selectedObjectId = newId;
    }
    _dirty = true;
    _notify();
    return true;
}

export {
    initEditorState,
    getEditorState,
    subscribe,
    selectObject,
    deselectObject,
    getSelectedObject,
    setActiveTool,
    addNewLObject,
    removeObject,
    updateObjectPosition,
    updateObjectRotation,
    updateObjectZIndex,
    renameObject,
    pushUndoState,
    undo,
    redo,
    canUndo,
    canRedo,
    isDirty,
    clearDirty
};
