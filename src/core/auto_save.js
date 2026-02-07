import { subscribe, getEditorState, isDirty, clearDirty } from "./editor_state.js";
import { saveProject } from "./project.js";

let _debounceTimer = null;
let _unsubscribe = null;
const AUTO_SAVE_DELAY = 2000;

function initAutoSave() {
    if (_unsubscribe) _unsubscribe();

    _unsubscribe = subscribe(() => {
        if (isDirty()) {
            scheduleAutoSave();
        }
    });
}

function scheduleAutoSave() {
    if (_debounceTimer) {
        clearTimeout(_debounceTimer);
    }

    _debounceTimer = setTimeout(async () => {
        _debounceTimer = null;
        const state = getEditorState();
        if (!state || !state.project || !state.project.directoryHandle) return;

        try {
            await saveProject(state.project.directoryHandle, state.project.projectData, state.sceneData);
            clearDirty();
        } catch (err) {
            console.warn("Auto-save failed:", err.message);
        }
    }, AUTO_SAVE_DELAY);
}

function stopAutoSave() {
    if (_debounceTimer) {
        clearTimeout(_debounceTimer);
        _debounceTimer = null;
    }
    if (_unsubscribe) {
        _unsubscribe();
        _unsubscribe = null;
    }
}

export { initAutoSave, stopAutoSave };
