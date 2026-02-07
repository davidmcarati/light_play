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
    removeObject,
    updateObjectPosition,
    updateObjectRotation,
    updateObjectZIndex,
    renameObject,
    pushUndoState,
    undo,
    redo,
    canUndo,
    canRedo,
    getSelectedObject,
    selectObject
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

async function runUndoRedoTests() {
    console.log("\n\u25B6 Undo/Redo Tests\n");

    await runTest("canUndo returns false initially", () => {
        initEditorState(makeProject());
        assertEqual(canUndo(), false);
    });

    await runTest("canRedo returns false initially", () => {
        initEditorState(makeProject());
        assertEqual(canRedo(), false);
    });

    await runTest("undo returns false when nothing to undo", () => {
        initEditorState(makeProject());
        assertEqual(undo(), false);
    });

    await runTest("redo returns false when nothing to redo", () => {
        initEditorState(makeProject());
        assertEqual(redo(), false);
    });

    await runTest("addNewLObject pushes undo state", () => {
        initEditorState(makeProject());
        addNewLObject();
        assertEqual(canUndo(), true);
    });

    await runTest("undo reverses addNewLObject", () => {
        initEditorState(makeProject());
        addNewLObject();
        assertEqual(getEditorState().sceneData.objects.length, 1);
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 0);
    });

    await runTest("redo restores undone addNewLObject", () => {
        initEditorState(makeProject());
        addNewLObject();
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 0);
        redo();
        assertEqual(getEditorState().sceneData.objects.length, 1);
    });

    await runTest("undo reverses removeObject", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        removeObject(obj.id);
        assertEqual(getEditorState().sceneData.objects.length, 0);
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 1);
    });

    await runTest("undo reverses renameObject", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        const oldId = obj.id;
        renameObject(oldId, "player");
        assertEqual(getEditorState().sceneData.objects[0].id, "player");
        undo();
        assertEqual(getEditorState().sceneData.objects[0].id, oldId);
    });

    await runTest("undo reverses updateObjectZIndex", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        updateObjectZIndex(obj.id, 10);
        assertEqual(getEditorState().sceneData.objects[0].zIndex, 10);
        undo();
        assertEqual(getEditorState().sceneData.objects[0].zIndex, 0);
    });

    await runTest("undo reverses position change after pushUndoState", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        pushUndoState();
        updateObjectPosition(obj.id, 5, 10);
        undo();
        const restored = getEditorState().sceneData.objects[0];
        assertEqual(restored.position.x, 0);
        assertEqual(restored.position.y, 0);
    });

    await runTest("undo reverses rotation change after pushUndoState", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        pushUndoState();
        updateObjectRotation(obj.id, 90);
        undo();
        assertEqual(getEditorState().sceneData.objects[0].rotation, 0);
    });

    await runTest("multiple undo steps work correctly", () => {
        initEditorState(makeProject());
        const a = addNewLObject();
        const b = addNewLObject();
        const c = addNewLObject();
        assertEqual(getEditorState().sceneData.objects.length, 3);
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 2);
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 1);
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 0);
    });

    await runTest("multiple redo steps work correctly", () => {
        initEditorState(makeProject());
        addNewLObject();
        addNewLObject();
        addNewLObject();
        undo();
        undo();
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 0);
        redo();
        assertEqual(getEditorState().sceneData.objects.length, 1);
        redo();
        assertEqual(getEditorState().sceneData.objects.length, 2);
        redo();
        assertEqual(getEditorState().sceneData.objects.length, 3);
    });

    await runTest("new action clears redo stack", () => {
        initEditorState(makeProject());
        addNewLObject();
        addNewLObject();
        undo();
        assertEqual(canRedo(), true);
        addNewLObject();
        assertEqual(canRedo(), false);
    });

    await runTest("undo restores selectedObjectId", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        assertEqual(getEditorState().selectedObjectId, obj.id);
        undo();
        assertEqual(getEditorState().selectedObjectId, null);
    });

    await runTest("undo restores nextObjectId for consistent IDs", () => {
        initEditorState(makeProject());
        const a = addNewLObject();
        undo();
        const b = addNewLObject();
        assertEqual(a.id, b.id);
    });

    await runTest("undo after remove restores the exact object", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        updateObjectZIndex(obj.id, 5);
        pushUndoState();
        updateObjectPosition(obj.id, 3, 7);
        removeObject(obj.id);
        undo();
        assertEqual(getEditorState().sceneData.objects.length, 1);
        const restored = getEditorState().sceneData.objects[0];
        assertEqual(restored.position.x, 3);
        assertEqual(restored.position.y, 7);
    });

    await runTest("initEditorState clears undo and redo stacks", () => {
        initEditorState(makeProject());
        addNewLObject();
        addNewLObject();
        assertEqual(canUndo(), true);
        initEditorState(makeProject());
        assertEqual(canUndo(), false);
        assertEqual(canRedo(), false);
    });

    return printSummary();
}

export { runUndoRedoTests };
