import {
    assert,
    assertEqual,
    assertDeepEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import {
    initEditorState,
    getEditorState,
    subscribe,
    selectObject,
    deselectObject,
    getSelectedObject,
    setActiveTool,
    addNewLObject,
    removeObject,
    updateObjectPosition,
    updateObjectRotation,
    updateObjectZIndex,
    renameObject
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

async function runEditorStateTests() {
    console.log("\n▶ Editor State Tests\n");

    await runTest("initEditorState creates state from project", () => {
        const project = makeProject();
        const state = initEditorState(project);
        assert(state, "state should be truthy");
        assertEqual(state.selectedObjectId, null);
        assertEqual(state.activeTool, "position");
    });

    await runTest("getEditorState returns the current state", () => {
        initEditorState(makeProject());
        const state = getEditorState();
        assert(state, "state should be accessible");
        assertEqual(state.activeTool, "position");
    });

    await runTest("subscribe notifies listeners on changes", () => {
        initEditorState(makeProject());
        let callCount = 0;
        const unsub = subscribe(() => callCount++);
        addNewLObject();
        assert(callCount > 0, "listener should have been called");
        unsub();
    });

    await runTest("unsubscribe stops notifications", () => {
        initEditorState(makeProject());
        let callCount = 0;
        const unsub = subscribe(() => callCount++);
        unsub();
        addNewLObject();
        assertEqual(callCount, 0);
    });

    await runTest("addNewLObject creates an object and selects it", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        assert(obj, "should return the new object");
        assert(obj.id, "should have an id");
        assertEqual(obj.position.x, 0);
        assertEqual(obj.position.y, 0);
        assertEqual(getEditorState().selectedObjectId, obj.id);
    });

    await runTest("addNewLObject increments IDs", () => {
        initEditorState(makeProject());
        const a = addNewLObject();
        const b = addNewLObject();
        assert(a.id !== b.id, "IDs should be unique");
    });

    await runTest("selectObject sets selectedObjectId", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        deselectObject();
        assertEqual(getEditorState().selectedObjectId, null);
        selectObject(obj.id);
        assertEqual(getEditorState().selectedObjectId, obj.id);
    });

    await runTest("deselectObject clears selection", () => {
        initEditorState(makeProject());
        addNewLObject();
        deselectObject();
        assertEqual(getEditorState().selectedObjectId, null);
    });

    await runTest("getSelectedObject returns the selected object", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        const selected = getSelectedObject();
        assertEqual(selected.id, obj.id);
    });

    await runTest("getSelectedObject returns null when nothing selected", () => {
        initEditorState(makeProject());
        deselectObject();
        assertEqual(getSelectedObject(), null);
    });

    await runTest("setActiveTool changes tool to position", () => {
        initEditorState(makeProject());
        setActiveTool("rotation");
        assertEqual(getEditorState().activeTool, "rotation");
        setActiveTool("position");
        assertEqual(getEditorState().activeTool, "position");
    });

    await runTest("setActiveTool rejects invalid tool names", () => {
        initEditorState(makeProject());
        setActiveTool("invalid_tool");
        assertEqual(getEditorState().activeTool, "position");
    });

    await runTest("updateObjectPosition changes position", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        updateObjectPosition(obj.id, 100, 200);
        const updated = getSelectedObject();
        assertEqual(updated.position.x, 100);
        assertEqual(updated.position.y, 200);
    });

    await runTest("updateObjectRotation changes rotation", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        updateObjectRotation(obj.id, 45);
        assertEqual(getSelectedObject().rotation, 45);
    });

    await runTest("updateObjectZIndex changes z-index", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        updateObjectZIndex(obj.id, 10);
        assertEqual(getSelectedObject().zIndex, 10);
    });

    await runTest("removeObject removes the object from scene", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        assertEqual(getEditorState().sceneData.objects.length, 1);
        removeObject(obj.id);
        assertEqual(getEditorState().sceneData.objects.length, 0);
    });

    await runTest("removeObject deselects if selected object is removed", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        assertEqual(getEditorState().selectedObjectId, obj.id);
        removeObject(obj.id);
        assertEqual(getEditorState().selectedObjectId, null);
    });

    await runTest("removeObject does nothing for non-existent ID", () => {
        initEditorState(makeProject());
        addNewLObject();
        removeObject("nonexistent");
        assertEqual(getEditorState().sceneData.objects.length, 1);
    });

    await runTest("renameObject changes the ID", () => {
        initEditorState(makeProject());
        const obj = addNewLObject();
        const oldId = obj.id;
        const success = renameObject(oldId, "player");
        assert(success, "rename should succeed");
        assertEqual(getEditorState().selectedObjectId, "player");
        assertEqual(getEditorState().sceneData.objects[0].id, "player");
    });

    await runTest("renameObject fails if new ID already exists", () => {
        initEditorState(makeProject());
        const a = addNewLObject();
        const b = addNewLObject();
        const success = renameObject(a.id, b.id);
        assertEqual(success, false);
    });

    await runTest("renameObject fails for non-existent source ID", () => {
        initEditorState(makeProject());
        const result = renameObject("ghost", "anything");
        assertEqual(result, false);
    });

    await runTest("multiple objects maintain independent state", () => {
        initEditorState(makeProject());
        const a = addNewLObject();
        const b = addNewLObject();
        updateObjectPosition(a.id, 10, 20);
        updateObjectPosition(b.id, 100, 200);
        const objA = getEditorState().sceneData.objects.find(o => o.id === a.id);
        const objB = getEditorState().sceneData.objects.find(o => o.id === b.id);
        assertEqual(objA.position.x, 10);
        assertEqual(objB.position.x, 100);
    });

    await runTest("initEditorState calculates nextObjectId from existing objects", () => {
        const project = makeProject();
        project.sceneData.objects = [
            { id: "obj_5", position: { x: 0, y: 0 }, zIndex: 0, rotation: 0, components: [] },
            { id: "obj_3", position: { x: 0, y: 0 }, zIndex: 0, rotation: 0, components: [] }
        ];
        initEditorState(project);
        const newObj = addNewLObject();
        assertEqual(newObj.id, "obj_6");
    });

    return printSummary();
}

export { runEditorStateTests };
