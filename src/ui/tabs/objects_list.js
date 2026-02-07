import {
    subscribe,
    getEditorState,
    selectObject,
    addNewLObject,
    removeObject
} from "../../core/editor_state.js";

let _container = null;
let _unsubscribe = null;

function renderObjectsList(container) {
    _container = container;
    _container.innerHTML = "";

    if (_unsubscribe) _unsubscribe();
    _unsubscribe = subscribe(() => updateList());

    updateList();
}

function updateList() {
    if (!_container) return;
    _container.innerHTML = "";

    const state = getEditorState();
    if (!state || !state.sceneData) return;

    const wrapper = document.createElement("div");
    wrapper.className = "objects-list-content";

    const header = document.createElement("div");
    header.className = "objects-list-header";

    const title = document.createElement("span");
    title.textContent = "Scene Objects";
    header.appendChild(title);

    const addBtn = document.createElement("button");
    addBtn.className = "btn btn-small btn-primary";
    addBtn.textContent = "+ Add";
    addBtn.addEventListener("click", () => addNewLObject());
    header.appendChild(addBtn);

    wrapper.appendChild(header);

    const list = document.createElement("div");
    list.className = "objects-list-items";

    if (state.sceneData.objects.length === 0) {
        const empty = document.createElement("div");
        empty.className = "objects-list-empty";
        empty.textContent = "No objects in scene";
        list.appendChild(empty);
    } else {
        state.sceneData.objects.forEach(obj => {
            const item = document.createElement("div");
            item.className = "objects-list-item" + (obj.id === state.selectedObjectId ? " selected" : "");

            const nameSpan = document.createElement("span");
            nameSpan.className = "objects-list-item-name";
            nameSpan.textContent = obj.id;

            const infoSpan = document.createElement("span");
            infoSpan.className = "objects-list-item-info";
            infoSpan.textContent = `(${Math.round(obj.position.x)}, ${Math.round(obj.position.y)})`;

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "objects-list-item-delete";
            deleteBtn.textContent = "×";
            deleteBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                removeObject(obj.id);
            });

            item.appendChild(nameSpan);
            item.appendChild(infoSpan);
            item.appendChild(deleteBtn);

            item.addEventListener("click", () => selectObject(obj.id));

            list.appendChild(item);
        });
    }

    wrapper.appendChild(list);
    _container.appendChild(wrapper);
}

export { renderObjectsList };
