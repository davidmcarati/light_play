import {
    assert,
    assertEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import {
    initEditorState,
    getEditorState,
    addNewLObject,
    updateObjectPosition,
    isDirty,
    clearDirty,
    pushUndoState,
    undo,
    redo
} from "../core/editor_state.js";

import { createSceneData } from "../core/project.js";

function makeProject(objects = []) {
    const sceneData = createSceneData("Test Scene");
    sceneData.objects = objects;
    return {
        projectData: { name: "Test Project", scenes: ["scene.lscene"] },
        sceneData: sceneData,
        directoryHandle: null
    };
}

async function runAutoSaveTests() {
    console.log("\n\u25B6 Auto-Save / Dirty Flag Tests\n");

    await runTest("isDirty returns false after init", () => {
        initEditorState(makeProject());
        assertEqual(isDirty(), false);
    });

    await runTest("addNewLObject sets dirty flag", () => {
        initEditorState(makeProject());
        addNewLObject();
        assertEqual(isDirty(), true);
    });

    await runTest("clearDirty resets the dirty flag", () => {
        initEditorState(makeProject());
        addNewLObject();
        assertEqual(isDirty(), true);
        clearDirty();
        assertEqual(isDirty(), false);
    });

    await runTest("updateObjectPosition sets dirty flag", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        clearDirty();
        updateObjectPosition(obj.id, 10, 20);
        assertEqual(isDirty(), true);
    });

    await runTest("undo sets dirty flag", () => {
        initEditorState(makeProject());
        addNewLObject();
        clearDirty();
        undo();
        assertEqual(isDirty(), true);
    });

    await runTest("redo sets dirty flag", () => {
        initEditorState(makeProject());
        addNewLObject();
        undo();
        clearDirty();
        redo();
        assertEqual(isDirty(), true);
    });

    await runTest("initEditorState clears dirty flag", () => {
        initEditorState(makeProject());
        addNewLObject();
        assertEqual(isDirty(), true);
        initEditorState(makeProject());
        assertEqual(isDirty(), false);
    });

    return printSummary();
}

export { runAutoSaveTests };
