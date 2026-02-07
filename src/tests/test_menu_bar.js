import {
    assert,
    assertEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import { createMenuBar, closeAllMenus } from "../ui/menu_bar.js";
import { initEditorState } from "../core/editor_state.js";
import { createSceneData } from "../core/project.js";

function setup() {
    const sceneData = createSceneData("Test");
    initEditorState({
        projectData: { name: "Test", scenes: ["scene.lscene"] },
        sceneData: sceneData,
        directoryHandle: null
    });
}

function cleanup() {
    document.querySelectorAll(".menu-bar").forEach(el => el.remove());
    closeAllMenus();
}

async function runMenuBarTests() {
    console.log("\n▶ Menu Bar Tests\n");

    await runTest("createMenuBar creates a menu-bar element", () => {
        setup();
        const container = document.createElement("div");
        document.body.appendChild(container);
        createMenuBar(container);
        assert(container.querySelector(".menu-bar"), "should create .menu-bar");
        container.remove();
        cleanup();
    });

    await runTest("menu bar has File, Edit, View menus", () => {
        setup();
        const container = document.createElement("div");
        document.body.appendChild(container);
        createMenuBar(container);
        const triggers = container.querySelectorAll(".menu-trigger");
        assertEqual(triggers.length, 3);
        assertEqual(triggers[0].textContent, "File");
        assertEqual(triggers[1].textContent, "Edit");
        assertEqual(triggers[2].textContent, "View");
        container.remove();
        cleanup();
    });

    await runTest("clicking a menu trigger opens the dropdown", () => {
        setup();
        const container = document.createElement("div");
        document.body.appendChild(container);
        createMenuBar(container);
        const trigger = container.querySelector(".menu-trigger");
        trigger.click();
        const menuItem = trigger.closest(".menu-item");
        assert(menuItem.classList.contains("open"), "menu should be open");
        container.remove();
        cleanup();
    });

    await runTest("clicking the same trigger again closes the dropdown", () => {
        setup();
        const container = document.createElement("div");
        document.body.appendChild(container);
        createMenuBar(container);
        const trigger = container.querySelector(".menu-trigger");
        trigger.click();
        trigger.click();
        const menuItem = trigger.closest(".menu-item");
        assert(!menuItem.classList.contains("open"), "menu should be closed");
        container.remove();
        cleanup();
    });

    await runTest("Edit menu contains Create Empty L-Object", () => {
        setup();
        const container = document.createElement("div");
        document.body.appendChild(container);
        createMenuBar(container);
        const triggers = container.querySelectorAll(".menu-trigger");
        triggers[1].click();
        const entries = container.querySelectorAll(".menu-item.open .menu-entry");
        let found = false;
        entries.forEach(e => {
            if (e.textContent.includes("Create Empty L-Object")) found = true;
        });
        assert(found, "should have 'Create Empty L-Object' entry");
        container.remove();
        cleanup();
    });

    await runTest("File menu contains Save Project and Close Project", () => {
        setup();
        const container = document.createElement("div");
        document.body.appendChild(container);
        createMenuBar(container);
        const triggers = container.querySelectorAll(".menu-trigger");
        triggers[0].click();
        const entries = container.querySelectorAll(".menu-item.open .menu-entry");
        const labels = Array.from(entries).map(e => e.textContent);
        assert(labels.some(l => l.includes("Save Project")), "should have Save Project");
        assert(labels.some(l => l.includes("Close Project")), "should have Close Project");
        container.remove();
        cleanup();
    });

    await runTest("closeAllMenus closes all open menus", () => {
        setup();
        const container = document.createElement("div");
        document.body.appendChild(container);
        createMenuBar(container);
        const trigger = container.querySelector(".menu-trigger");
        trigger.click();
        assert(document.querySelector(".menu-item.open"), "menu should be open");
        closeAllMenus();
        assert(!document.querySelector(".menu-item.open"), "all menus should be closed");
        container.remove();
        cleanup();
    });

    return printSummary();
}

export { runMenuBarTests };
