import {
    assert,
    assertEqual,
    assertDeepEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import {
    PROJECT_FILE_NAME,
    SCENE_FILE_NAME,
    isFileSystemAccessSupported,
    createProjectData,
    createSceneData,
    createLObject
} from "../core/project.js";

async function runProjectTests() {
    console.log("\n▶ Project Core Tests\n");

    await runTest("PROJECT_FILE_NAME is project.lplay", () => {
        assertEqual(PROJECT_FILE_NAME, "project.lplay");
    });

    await runTest("SCENE_FILE_NAME is scene.lscene", () => {
        assertEqual(SCENE_FILE_NAME, "scene.lscene");
    });

    await runTest("isFileSystemAccessSupported returns a boolean", () => {
        const result = isFileSystemAccessSupported();
        assertEqual(typeof result, "boolean");
    });

    await runTest("createProjectData returns valid structure", () => {
        const data = createProjectData("Test Project");
        assertEqual(data.name, "Test Project");
        assertEqual(data.version, "1.0.0");
        assert(data.createdAt, "createdAt should be set");
        assert(data.lastModified, "lastModified should be set");
        assert(Array.isArray(data.scenes), "scenes should be an array");
        assertEqual(data.scenes.length, 1);
        assertEqual(data.scenes[0], "scene.lscene");
    });

    await runTest("createProjectData uses the provided name", () => {
        const data = createProjectData("My Cool Game");
        assertEqual(data.name, "My Cool Game");
    });

    await runTest("createProjectData with empty string name", () => {
        const data = createProjectData("");
        assertEqual(data.name, "");
    });

    await runTest("createProjectData sets timestamps as valid ISO strings", () => {
        const data = createProjectData("Timestamp Test");
        const created = new Date(data.createdAt);
        const modified = new Date(data.lastModified);
        assert(!isNaN(created.getTime()), "createdAt should be a valid date");
        assert(!isNaN(modified.getTime()), "lastModified should be a valid date");
    });

    await runTest("createProjectData timestamps are recent", () => {
        const before = Date.now();
        const data = createProjectData("Time Check");
        const after = Date.now();
        const created = new Date(data.createdAt).getTime();
        assert(created >= before && created <= after, "createdAt should be within test execution window");
    });

    await runTest("createSceneData returns valid structure with default name", () => {
        const scene = createSceneData();
        assertEqual(scene.name, "Main Scene");
        assertEqual(scene.version, "1.0.0");
        assert(scene.createdAt, "createdAt should be set");
        assert(scene.lastModified, "lastModified should be set");
        assert(Array.isArray(scene.objects), "objects should be an array");
        assertEqual(scene.objects.length, 0);
    });

    await runTest("createSceneData accepts a custom name", () => {
        const scene = createSceneData("Level 1");
        assertEqual(scene.name, "Level 1");
    });

    await runTest("createSceneData objects array starts empty", () => {
        const scene = createSceneData();
        assertEqual(scene.objects.length, 0);
    });

    await runTest("createSceneData objects array is independent per instance", () => {
        const a = createSceneData("A");
        const b = createSceneData("B");
        a.objects.push(createLObject("test"));
        assertEqual(a.objects.length, 1);
        assertEqual(b.objects.length, 0);
    });

    await runTest("createLObject returns valid structure with defaults", () => {
        const obj = createLObject("obj_1");
        assertEqual(obj.id, "obj_1");
        assertDeepEqual(obj.position, { x: 0, y: 0 });
        assertEqual(obj.zIndex, 0);
        assertEqual(obj.rotation, 0);
        assert(Array.isArray(obj.components), "components should be an array");
        assertEqual(obj.components.length, 0);
    });

    await runTest("createLObject accepts custom position values", () => {
        const obj = createLObject("obj_2", 150, 200);
        assertEqual(obj.position.x, 150);
        assertEqual(obj.position.y, 200);
    });

    await runTest("createLObject accepts negative position values", () => {
        const obj = createLObject("neg", -50, -100);
        assertEqual(obj.position.x, -50);
        assertEqual(obj.position.y, -100);
    });

    await runTest("createLObject accepts custom z-index and rotation", () => {
        const obj = createLObject("obj_3", 0, 0, 5, 90);
        assertEqual(obj.zIndex, 5);
        assertEqual(obj.rotation, 90);
    });

    await runTest("createLObject accepts fractional values", () => {
        const obj = createLObject("frac", 10.5, 20.75, 0, 45.5);
        assertEqual(obj.position.x, 10.5);
        assertEqual(obj.position.y, 20.75);
        assertEqual(obj.rotation, 45.5);
    });

    await runTest("createLObject components array is independent per instance", () => {
        const a = createLObject("a");
        const b = createLObject("b");
        a.components.push({ type: "sprite" });
        assertEqual(a.components.length, 1);
        assertEqual(b.components.length, 0);
    });

    await runTest("createLObject position object is independent per instance", () => {
        const a = createLObject("a", 10, 20);
        const b = createLObject("b", 30, 40);
        a.position.x = 999;
        assertEqual(b.position.x, 30);
    });

    await runTest("project data serializes to valid JSON", () => {
        const data = createProjectData("JSON Test");
        const json = JSON.stringify(data);
        const parsed = JSON.parse(json);
        assertEqual(parsed.name, "JSON Test");
        assertEqual(parsed.version, "1.0.0");
        assertEqual(parsed.scenes.length, 1);
    });

    await runTest("scene data serializes to valid JSON", () => {
        const scene = createSceneData("Serialization");
        scene.objects.push(createLObject("s_obj", 10, 20, 1, 45));
        const json = JSON.stringify(scene);
        const parsed = JSON.parse(json);
        assertEqual(parsed.objects.length, 1);
        assertEqual(parsed.objects[0].id, "s_obj");
        assertEqual(parsed.objects[0].position.x, 10);
        assertEqual(parsed.objects[0].rotation, 45);
    });

    await runTest("scene with multiple L-Objects serializes correctly", () => {
        const scene = createSceneData("Multi");
        scene.objects.push(createLObject("a", 0, 0, 0, 0));
        scene.objects.push(createLObject("b", 100, 200, 5, 180));
        scene.objects.push(createLObject("c", -50, -50, 10, 360));
        const json = JSON.stringify(scene);
        const parsed = JSON.parse(json);
        assertEqual(parsed.objects.length, 3);
        assertEqual(parsed.objects[2].id, "c");
        assertEqual(parsed.objects[2].zIndex, 10);
    });

    await runTest("L-Object with components serializes correctly", () => {
        const obj = createLObject("comp_test", 0, 0);
        obj.components.push({ type: "sprite", src: "player.png" });
        obj.components.push({ type: "collider", width: 32, height: 32 });
        const json = JSON.stringify(obj);
        const parsed = JSON.parse(json);
        assertEqual(parsed.components.length, 2);
        assertEqual(parsed.components[0].type, "sprite");
        assertEqual(parsed.components[1].width, 32);
    });

    await runTest("full project roundtrip (create -> serialize -> parse)", () => {
        const project = createProjectData("Roundtrip");
        const scene = createSceneData("Level 1");
        scene.objects.push(createLObject("player", 100, 200, 1, 0));

        const bundle = { project: project, scene: scene };
        const json = JSON.stringify(bundle, null, 2);
        const restored = JSON.parse(json);

        assertEqual(restored.project.name, "Roundtrip");
        assertEqual(restored.scene.name, "Level 1");
        assertEqual(restored.scene.objects[0].id, "player");
        assertEqual(restored.scene.objects[0].position.x, 100);
    });

    return printSummary();
}

export { runProjectTests };
