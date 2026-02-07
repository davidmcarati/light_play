import { resetCounters } from "./test_runner.js";
import { runProjectTests } from "./test_project.js";
import { runModalTests } from "./test_modal.js";
import { runNotificationTests } from "./test_notification.js";
import { runEditorStateTests } from "./test_editor_state.js";
import { runPanelSystemTests } from "./test_panel_system.js";
import { runMenuBarTests } from "./test_menu_bar.js";
import { runUndoRedoTests } from "./test_undo_redo.js";
import { runAutoSaveTests } from "./test_auto_save.js";

async function runAllTests() {
    console.log("═══════════════════════════════");
    console.log("  Light Play — Test Suite");
    console.log("═══════════════════════════════");

    const suites = [
        runProjectTests,
        runModalTests,
        runNotificationTests,
        runEditorStateTests,
        runPanelSystemTests,
        runMenuBarTests,
        runUndoRedoTests,
        runAutoSaveTests
    ];

    const results = [];

    for (const suite of suites) {
        resetCounters();
        results.push(await suite());
    }

    console.log("\n═══════════════════════════════");
    if (results.every(r => r === true)) {
        console.log("  ALL TEST SUITES PASSED");
    } else {
        console.log("  SOME TEST SUITES FAILED");
    }
    console.log("═══════════════════════════════\n");
}

runAllTests();
