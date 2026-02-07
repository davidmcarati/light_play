import {
    assert,
    assertEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import { createPanelLayout, activateTab } from "../ui/panel_system.js";

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
    console.log("\n▶ Panel System Tests\n");

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

    return printSummary();
}

export { runPanelSystemTests };
