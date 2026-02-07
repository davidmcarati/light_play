import {
    subscribe,
    getSelectedObject,
    getEditorState,
    updateObjectPosition,
    updateObjectRotation,
    updateObjectZIndex,
    renameObject,
    setActiveTool,
    removeObject,
    pushUndoState
} from "../../core/editor_state.js";

let _container = null;
let _unsubscribe = null;

function renderInspector(container) {
    _container = container;
    _container.innerHTML = "";

    if (_unsubscribe) _unsubscribe();
    _unsubscribe = subscribe(() => updateInspector());

    updateInspector();
}

function updateInspector() {
    if (!_container) return;
    _container.innerHTML = "";

    const selected = getSelectedObject();
    const state = getEditorState();

    if (!selected) {
        const empty = document.createElement("div");
        empty.className = "inspector-empty";
        empty.textContent = "No object selected";
        _container.appendChild(empty);
        return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "inspector-content";

    wrapper.appendChild(createField("ID", "text", selected.id, (val) => {
        renameObject(selected.id, val);
    }));

    wrapper.appendChild(createNumberField("Position X", selected.position.x, (val) => {
        pushUndoState();
        updateObjectPosition(selected.id, val, selected.position.y);
    }));

    wrapper.appendChild(createNumberField("Position Y", selected.position.y, (val) => {
        pushUndoState();
        updateObjectPosition(selected.id, selected.position.x, val);
    }));

    wrapper.appendChild(createNumberField("Z-Index", selected.zIndex, (val) => {
        updateObjectZIndex(selected.id, val);
    }));

    wrapper.appendChild(createNumberField("Rotation", selected.rotation, (val) => {
        pushUndoState();
        updateObjectRotation(selected.id, val);
    }));

    const toolSection = document.createElement("div");
    toolSection.className = "inspector-section";

    const toolLabel = document.createElement("div");
    toolLabel.className = "inspector-section-title";
    toolLabel.textContent = "Active Tool";
    toolSection.appendChild(toolLabel);

    const toolBtns = document.createElement("div");
    toolBtns.className = "inspector-tool-buttons";

    const posBtn = document.createElement("button");
    posBtn.className = "btn btn-tool" + (state.activeTool === "position" ? " active" : "");
    posBtn.textContent = "Position (W)";
    posBtn.addEventListener("click", () => setActiveTool("position"));

    const rotBtn = document.createElement("button");
    rotBtn.className = "btn btn-tool" + (state.activeTool === "rotation" ? " active" : "");
    rotBtn.textContent = "Rotation (E)";
    rotBtn.addEventListener("click", () => setActiveTool("rotation"));

    toolBtns.appendChild(posBtn);
    toolBtns.appendChild(rotBtn);
    toolSection.appendChild(toolBtns);
    wrapper.appendChild(toolSection);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-danger";
    deleteBtn.textContent = "Delete Object";
    deleteBtn.style.marginTop = "16px";
    deleteBtn.addEventListener("click", () => {
        removeObject(selected.id);
    });
    wrapper.appendChild(deleteBtn);

    _container.appendChild(wrapper);
}

function createField(label, type, value, onChange) {
    const group = document.createElement("div");
    group.className = "inspector-field";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    group.appendChild(lbl);

    const input = document.createElement("input");
    input.type = type;
    input.value = value;
    input.addEventListener("change", () => onChange(input.value));
    group.appendChild(input);

    return group;
}

function createNumberField(label, value, onChange) {
    const group = document.createElement("div");
    group.className = "inspector-field";

    const lbl = document.createElement("label");
    lbl.textContent = label;
    group.appendChild(lbl);

    const input = document.createElement("input");
    input.type = "number";
    input.value = value;
    input.step = "1";
    input.addEventListener("change", () => {
        const num = parseFloat(input.value);
        if (!isNaN(num)) onChange(num);
    });
    group.appendChild(input);

    return group;
}

export { renderInspector };
