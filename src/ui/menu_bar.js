import { addNewLObject, getEditorState, undo, redo } from "../core/editor_state.js";
import { saveProject } from "../core/project.js";
import { showNotification } from "./notification.js";
import { clearSavedLayout } from "./panel_system.js";

function createMenuBar(container) {
    const bar = document.createElement("div");
    bar.className = "menu-bar";

    const menus = [
        {
            label: "File",
            items: [
                { label: "Save Project", shortcut: "Ctrl+S", action: handleSave },
                { type: "separator" },
                { label: "Close Project", action: handleClose }
            ]
        },
        {
            label: "Edit",
            items: [
                { label: "Undo", shortcut: "Ctrl+Z", action: () => undo() },
                { label: "Redo", shortcut: "Ctrl+Y", action: () => redo() },
                { type: "separator" },
                { label: "Create Empty L-Object", action: handleCreateObject },
            ]
        },
        {
            label: "View",
            items: [
                { label: "Reset Layout", action: handleResetLayout }
            ]
        }
    ];

    menus.forEach(menu => {
        const menuEl = buildMenu(menu);
        bar.appendChild(menuEl);
    });

    container.appendChild(bar);
    setupGlobalClose(bar);
    return bar;
}

function buildMenu(menu) {
    const wrapper = document.createElement("div");
    wrapper.className = "menu-item";

    const trigger = document.createElement("div");
    trigger.className = "menu-trigger";
    trigger.textContent = menu.label;
    wrapper.appendChild(trigger);

    const dropdown = document.createElement("div");
    dropdown.className = "menu-dropdown";

    menu.items.forEach(item => {
        if (item.type === "separator") {
            const sep = document.createElement("div");
            sep.className = "menu-separator";
            dropdown.appendChild(sep);
            return;
        }

        const entry = document.createElement("div");
        entry.className = "menu-entry";

        const labelSpan = document.createElement("span");
        labelSpan.textContent = item.label;
        entry.appendChild(labelSpan);

        if (item.shortcut) {
            const shortcutSpan = document.createElement("span");
            shortcutSpan.className = "menu-shortcut";
            shortcutSpan.textContent = item.shortcut;
            entry.appendChild(shortcutSpan);
        }

        entry.addEventListener("click", (e) => {
            e.stopPropagation();
            closeAllMenus();
            item.action();
        });
        dropdown.appendChild(entry);
    });

    wrapper.appendChild(dropdown);

    trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const isOpen = wrapper.classList.contains("open");
        closeAllMenus();
        if (!isOpen) {
            wrapper.classList.add("open");
        }
    });

    trigger.addEventListener("mouseenter", () => {
        const anyOpen = document.querySelector(".menu-item.open");
        if (anyOpen && anyOpen !== wrapper) {
            closeAllMenus();
            wrapper.classList.add("open");
        }
    });

    return wrapper;
}

function closeAllMenus() {
    document.querySelectorAll(".menu-item.open").forEach(el => el.classList.remove("open"));
}

function setupGlobalClose(bar) {
    document.addEventListener("click", (e) => {
        if (!bar.contains(e.target)) {
            closeAllMenus();
        }
    });
}

async function handleSave() {
    const state = getEditorState();
    if (!state) return;
    try {
        await saveProject(state.project.directoryHandle, state.project.projectData, state.sceneData);
        showNotification("Project saved.", "success");
    } catch (err) {
        showNotification("Failed to save: " + err.message, "error");
    }
}

function handleClose() {
    window.location.reload();
}

function handleCreateObject() {
    addNewLObject();
}

function handleResetLayout() {
    clearSavedLayout();
    showNotification("Layout reset. Reloading...", "success");
    setTimeout(() => window.location.reload(), 500);
}

export { createMenuBar, closeAllMenus };
