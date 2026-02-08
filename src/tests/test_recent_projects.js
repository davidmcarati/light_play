import {
    assert,
    assertEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import {
    saveRecentProject,
    getRecentProjects,
    getLastProject,
    removeRecentProject
} from "../core/recent_projects.js";

async function runRecentProjectsTests() {
    console.log("\n\u25B6 Recent Projects Tests\n");

    await runTest("getRecentProjects returns an array", async () => {
        const projects = await getRecentProjects();
        assert(Array.isArray(projects), "should return an array");
    });

    await runTest("saveRecentProject stores a project entry", async () => {
        await saveRecentProject("TestProject_" + Date.now(), null);
        const projects = await getRecentProjects();
        assert(projects.length > 0, "should have at least one project");
    });

    await runTest("getLastProject returns the most recent entry", async () => {
        const name = "LastProject_" + Date.now();
        await saveRecentProject(name, null);
        const last = await getLastProject();
        assert(last, "should return last project");
        assertEqual(last.name, name);
    });

    await runTest("removeRecentProject removes the entry", async () => {
        const name = "RemoveMe_" + Date.now();
        await saveRecentProject(name, null);
        const before = await getRecentProjects();
        const countBefore = before.filter(p => p.name === name).length;
        assertEqual(countBefore, 1);

        await removeRecentProject(name);
        const after = await getRecentProjects();
        const countAfter = after.filter(p => p.name === name).length;
        assertEqual(countAfter, 0);
    });

    await runTest("recent projects are sorted by lastOpened descending", async () => {
        const name1 = "First_" + Date.now();
        const name2 = "Second_" + (Date.now() + 1);
        await saveRecentProject(name1, null);
        await new Promise(r => setTimeout(r, 10));
        await saveRecentProject(name2, null);

        const projects = await getRecentProjects();
        const idx1 = projects.findIndex(p => p.name === name1);
        const idx2 = projects.findIndex(p => p.name === name2);
        assert(idx2 < idx1, "second project should appear before first (more recent)");

        await removeRecentProject(name1);
        await removeRecentProject(name2);
    });

    return printSummary();
}

export { runRecentProjectsTests };
