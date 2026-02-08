const PROJECT_FILE_NAME = "project.lplay";
const SCENE_FILE_NAME = "scene.lscene";

function isFileSystemAccessSupported() {
    return typeof window.showDirectoryPicker === "function";
}

function createProjectData(name) {
    return {
        name: name,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        scenes: [SCENE_FILE_NAME]
    };
}

function createLObject(id, x = 0, y = 0, zIndex = 0, rotation = 0) {
    return {
        id: id,
        position: { x: x, y: y },
        zIndex: zIndex,
        rotation: rotation,
        components: []
    };
}

function createSceneData(name = "Main Scene") {
    return {
        name: name,
        version: "1.0.0",
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        objects: []
    };
}

async function pickDirectory() {
    if (!isFileSystemAccessSupported()) {
        throw new Error(
            "Your browser does not support the File System Access API. " +
            "Please use a Chromium-based browser (Chrome, Edge, Opera, Brave) " +
            "and make sure you're accessing this page via localhost or HTTPS."
        );
    }

    try {
        return await window.showDirectoryPicker({ mode: "readwrite" });
    } catch (err) {
        if (err.name === "AbortError") return null;
        throw err;
    }
}

async function createNewProject(name) {
    const directoryHandle = await pickDirectory();
    if (!directoryHandle) return null;

    const projectData = createProjectData(name);
    const sceneData = createSceneData();

    const projectFile = await directoryHandle.getFileHandle(PROJECT_FILE_NAME, { create: true });
    const projectWritable = await projectFile.createWritable();
    await projectWritable.write(JSON.stringify(projectData, null, 2));
    await projectWritable.close();

    const sceneFile = await directoryHandle.getFileHandle(SCENE_FILE_NAME, { create: true });
    const sceneWritable = await sceneFile.createWritable();
    await sceneWritable.write(JSON.stringify(sceneData, null, 2));
    await sceneWritable.close();

    return {
        directoryHandle: directoryHandle,
        projectData: projectData,
        sceneData: sceneData
    };
}

async function loadProjectFromHandle(directoryHandle) {
    let projectFile;
    try {
        projectFile = await directoryHandle.getFileHandle(PROJECT_FILE_NAME);
    } catch {
        throw new Error("No project.lplay file found in the selected folder. This is not a Light Play project.");
    }

    const projectBlob = await projectFile.getFile();
    const projectText = await projectBlob.text();
    const projectData = JSON.parse(projectText);

    let sceneData = null;
    if (projectData.scenes && projectData.scenes.length > 0) {
        try {
            const sceneFile = await directoryHandle.getFileHandle(projectData.scenes[0]);
            const sceneBlob = await sceneFile.getFile();
            const sceneText = await sceneBlob.text();
            sceneData = JSON.parse(sceneText);
        } catch {
            sceneData = createSceneData();
        }
    }

    return {
        directoryHandle: directoryHandle,
        projectData: projectData,
        sceneData: sceneData
    };
}

async function loadExistingProject() {
    const directoryHandle = await pickDirectory();
    if (!directoryHandle) return null;
    return await loadProjectFromHandle(directoryHandle);
}

async function saveProject(directoryHandle, projectData, sceneData) {
    projectData.lastModified = new Date().toISOString();

    const projectFile = await directoryHandle.getFileHandle(PROJECT_FILE_NAME, { create: true });
    const projectWritable = await projectFile.createWritable();
    await projectWritable.write(JSON.stringify(projectData, null, 2));
    await projectWritable.close();

    if (sceneData) {
        sceneData.lastModified = new Date().toISOString();
        const sceneName = projectData.scenes[0] || SCENE_FILE_NAME;
        const sceneFile = await directoryHandle.getFileHandle(sceneName, { create: true });
        const sceneWritable = await sceneFile.createWritable();
        await sceneWritable.write(JSON.stringify(sceneData, null, 2));
        await sceneWritable.close();
    }
}

export {
    PROJECT_FILE_NAME,
    SCENE_FILE_NAME,
    isFileSystemAccessSupported,
    createProjectData,
    createSceneData,
    createLObject,
    createNewProject,
    loadExistingProject,
    loadProjectFromHandle,
    saveProject
};
