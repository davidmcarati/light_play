import {
    assert,
    assertEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import {
    createPanelLayout,
    activateTab,
    getPanelRegistry,
    registerTabType,
    loadSavedLayout,
    clearSavedLayout,
    saveLayout
} from "../ui/panel_system.js";

function cleanup() {
    document.querySelectorAll(".panel-layout").forEach(el => el.remove());
}

function makeContainer() {
    const div = document.createElement("div");
    div.style.width = "800px";
    div.style.height = "600px";
    document.body.appendChild(div);
    return div;
}

async function runPanelSystemTests() {
    console.log("\n\u25B6 Panel System Tests\n");

    await runTest("createPanelLayout creates a panel-layout element", () => {
        const container = makeContainer();
        createPanelLayout(container, { type: "panel", id: "test", tabs: [] });
        assert(container.querySelector(".panel-layout"), "should have panel-layout");
        cleanup();
        container.remove();
    });

    await runTest("single panel renders with tab bar and content", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [{ label: "Scene", render: (c) => { c.textContent = "scene-content"; } }]
        });
        const tabBar = container.querySelector(".panel-tab-bar");
        const content = container.querySelector(".panel-content");
        assert(tabBar, "should have tab bar");
        assert(content, "should have content area");
        cleanup();
        container.remove();
    });

    await runTest("panel tab shows the correct label", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [{ label: "My Tab", render: () => {} }]
        });
        const tab = container.querySelector(".panel-tab");
        assertEqual(tab.textContent, "My Tab");
        cleanup();
        container.remove();
    });

    await runTest("first tab is active by default", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [
                { label: "First", render: () => {} },
                { label: "Second", render: () => {} }
            ]
        });
        const tabs = container.querySelectorAll(".panel-tab");
        assert(tabs[0].classList.contains("active"), "first tab should be active");
        assert(!tabs[1].classList.contains("active"), "second tab should not be active");
        cleanup();
        container.remove();
    });

    await runTest("tab render function is called for active tab", () => {
        const container = makeContainer();
        let rendered = false;
        createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [{ label: "Test", render: () => { rendered = true; } }]
        });
        assert(rendered, "render should have been called");
        cleanup();
        container.remove();
    });

    await runTest("clicking a tab activates it", () => {
        const container = makeContainer();
        let activeContent = "";
        createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [
                { label: "A", render: (c) => { activeContent = "A"; c.textContent = "A"; } },
                { label: "B", render: (c) => { activeContent = "B"; c.textContent = "B"; } }
            ]
        });
        const tabs = container.querySelectorAll(".panel-tab");
        tabs[1].click();
        assertEqual(activeContent, "B");
        assert(tabs[1].classList.contains("active"), "second tab should be active");
        cleanup();
        container.remove();
    });

    await runTest("split layout creates two panes and a divider", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "split",
            direction: "horizontal",
            ratio: 0.5,
            children: [
                { type: "panel", id: "left", tabs: [] },
                { type: "panel", id: "right", tabs: [] }
            ]
        });
        const panes = container.querySelectorAll(".split-pane");
        const divider = container.querySelector(".split-divider");
        assertEqual(panes.length, 2);
        assert(divider, "should have a divider");
        cleanup();
        container.remove();
    });

    await runTest("horizontal split has correct class", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "split",
            direction: "horizontal",
            children: [
                { type: "panel", id: "a", tabs: [] },
                { type: "panel", id: "b", tabs: [] }
            ]
        });
        const split = container.querySelector(".split-container");
        assert(split.classList.contains("split-horizontal"), "should have horizontal class");
        cleanup();
        container.remove();
    });

    await runTest("vertical split has correct class", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "split",
            direction: "vertical",
            children: [
                { type: "panel", id: "a", tabs: [] },
                { type: "panel", id: "b", tabs: [] }
            ]
        });
        const split = container.querySelector(".split-container");
        assert(split.classList.contains("split-vertical"), "should have vertical class");
        cleanup();
        container.remove();
    });

    await runTest("nested split creates proper hierarchy", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "split",
            direction: "horizontal",
            children: [
                { type: "panel", id: "left", tabs: [] },
                {
                    type: "split",
                    direction: "vertical",
                    children: [
                        { type: "panel", id: "top-right", tabs: [] },
                        { type: "panel", id: "bottom-right", tabs: [] }
                    ]
                }
            ]
        });
        const panels = container.querySelectorAll(".panel");
        assertEqual(panels.length, 3);
        cleanup();
        container.remove();
    });

    await runTest("panels are registered in the panel registry", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "split",
            direction: "horizontal",
            children: [
                { type: "panel", id: "a", tabs: [{ label: "Tab A", render: () => {} }] },
                { type: "panel", id: "b", tabs: [{ label: "Tab B", render: () => {} }] }
            ]
        });
        const registry = getPanelRegistry();
        assertEqual(registry.size, 2);
        cleanup();
        container.remove();
    });

    await runTest("tabs are marked as draggable", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [{ label: "Draggable", render: () => {} }]
        });
        const tab = container.querySelector(".panel-tab");
        assertEqual(tab.draggable, true);
        cleanup();
        container.remove();
    });

    await runTest("panels have drop overlay elements", () => {
        const container = makeContainer();
        createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [{ label: "Test", render: () => {} }]
        });
        const overlay = container.querySelector(".panel-drop-overlay");
        assert(overlay, "should have drop overlay");
        const zones = overlay.querySelectorAll(".drop-zone");
        assertEqual(zones.length, 5);
        cleanup();
        container.remove();
    });

    await runTest("cleanup function is called when switching tabs", () => {
        const container = makeContainer();
        let cleanedUp = false;
        const panelState = createPanelLayout(container, {
            type: "panel",
            id: "main",
            tabs: [
                { label: "A", render: () => {}, cleanup: () => { cleanedUp = true; } },
                { label: "B", render: () => {} }
            ]
        });
        activateTab(panelState, 1);
        assert(cleanedUp, "cleanup should have been called for tab A");
        cleanup();
        container.remove();
    });

    await runTest("saveLayout stores layout to localStorage", () => {
        clearSavedLayout();
        const container = makeContainer();
        registerTabType("TestTab", () => {}, null);
        createPanelLayout(container, {
            type: "panel",
            tabs: [{ label: "TestTab", render: () => {} }]
        });
        saveLayout();
        const stored = localStorage.getItem("lightplay_editor_layout");
        assert(stored, "should have saved layout to localStorage");
        const parsed = JSON.parse(stored);
        assertEqual(parsed.type, "panel");
        assert(parsed.tabs.includes("TestTab"), "should include TestTab label");
        cleanup();
        container.remove();
        clearSavedLayout();
    });

    await runTest("loadSavedLayout returns null when nothing saved", () => {
        clearSavedLayout();
        const result = loadSavedLayout();
        assertEqual(result, null);
    });

    await runTest("loadSavedLayout resolves saved config with registered tabs", () => {
        clearSavedLayout();
        let renderCalled = false;
        registerTabType("LoadTest", () => { renderCalled = true; }, null);

        localStorage.setItem("lightplay_editor_layout", JSON.stringify({
            type: "panel",
            tabs: ["LoadTest"],
            activeTabIndex: 0
        }));

        const loaded = loadSavedLayout();
        assert(loaded, "should return a config");
        assertEqual(loaded.type, "panel");
        assertEqual(loaded.tabs.length, 1);
        assertEqual(loaded.tabs[0].label, "LoadTest");
        assert(typeof loaded.tabs[0].render === "function", "should resolve render function");
        clearSavedLayout();
    });

    await runTest("clearSavedLayout removes layout from localStorage", () => {
        localStorage.setItem("lightplay_editor_layout", "test");
        clearSavedLayout();
        assertEqual(localStorage.getItem("lightplay_editor_layout"), null);
    });

    await runTest("activeTabIndex is restored from config", () => {
        const container = makeContainer();
        let activatedTab = "";
        createPanelLayout(container, {
            type: "panel",
            tabs: [
                { label: "X", render: () => { activatedTab = "X"; } },
                { label: "Y", render: () => { activatedTab = "Y"; } }
            ],
            activeTabIndex: 1
        });
        assertEqual(activatedTab, "Y");
        const tabs = container.querySelectorAll(".panel-tab");
        assert(tabs[1].classList.contains("active"), "second tab should be active");
        cleanup();
        container.remove();
    });

    return printSummary();
}

export { runPanelSystemTests };
