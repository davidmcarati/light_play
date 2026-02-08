import { initEditorState, setActiveTool, undo, redo } from "../core/editor_state.js";
import { initAutoSave } from "../core/auto_save.js";
import { createMenuBar } from "./menu_bar.js";
import { createPanelLayout, registerTabType, loadSavedLayout } from "./panel_system.js";
import { renderSceneView } from "./tabs/scene_view.js";
import { renderInspector } from "./tabs/inspector.js";
import { renderObjectsList } from "./tabs/objects_list.js";
import { renderAssetsBrowser, cleanupAssetsBrowser } from "./tabs/assets_browser.js";

const DEFAULT_LAYOUT = {
    type: "split",
    direction: "horizontal",
    ratio: 0.7,
    children: [
        {
            type: "panel",
            id: "main",
            tabs: [
                { label: "Scene", render: renderSceneView }
            ]
        },
        {
            type: "split",
            direction: "vertical",
            ratio: 0.4,
            children: [
                {
                    type: "panel",
                    id: "inspector",
                    tabs: [
                        { label: "Inspector", render: renderInspector }
                    ]
                },
                {
                    type: "split",
                    direction: "vertical",
                    ratio: 0.5,
                    children: [
                        {
                            type: "panel",
                            id: "objects",
                            tabs: [
                                { label: "Objects", render: renderObjectsList }
                            ]
                        },
                        {
                            type: "panel",
                            id: "assets",
                            tabs: [
                                { label: "Assets", render: renderAssetsBrowser, cleanup: cleanupAssetsBrowser }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
};

function renderEditorScreen(app, project) {
    app.innerHTML = "";

    initEditorState(project);

    registerTabType("Scene", renderSceneView, null);
    registerTabType("Inspector", renderInspector, null);
    registerTabType("Objects", renderObjectsList, null);
    registerTabType("Assets", renderAssetsBrowser, cleanupAssetsBrowser);

    const container = document.createElement("div");
    container.className = "editor-container";

    createMenuBar(container);

    const body = document.createElement("div");
    body.className = "editor-body";
    container.appendChild(body);

    const savedLayout = loadSavedLayout();
    createPanelLayout(body, savedLayout || DEFAULT_LAYOUT);

    app.appendChild(container);

    setupKeyboardShortcuts();
    initAutoSave();
}

function setupKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
        const isInput = e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA";

        if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
            e.preventDefault();
            undo();
            return;
        }

        if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.shiftKey && e.key === "Z"))) {
            e.preventDefault();
            redo();
            return;
        }

        if (isInput) return;

        if (e.key === "w" || e.key === "W") {
            setActiveTool("position");
        } else if (e.key === "e" || e.key === "E") {
            setActiveTool("rotation");
        }
    });
}

export { renderEditorScreen };
