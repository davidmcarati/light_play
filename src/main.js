import { renderWelcomeScreen } from "./ui/welcome_screen.js";
import { renderEditorScreen } from "./ui/editor_screen.js";
import { getLastProject, saveRecentProject } from "./core/recent_projects.js";
import { loadProjectFromHandle } from "./core/project.js";

const app = document.getElementById("app");

function onProjectLoaded(project) {
    if (project.projectData && project.directoryHandle) {
        saveRecentProject(project.projectData.name, project.directoryHandle).catch(() => {});
    }
    renderEditorScreen(app, project);
}

async function init() {
    try {
        const lastProject = await getLastProject();
        if (lastProject && lastProject.directoryHandle) {
            const handle = lastProject.directoryHandle;
            const permission = await handle.queryPermission({ mode: "readwrite" });

            if (permission === "granted") {
                const project = await loadProjectFromHandle(handle);
                onProjectLoaded(project);
                return;
            }
        }
    } catch {
        // Fall through to welcome screen
    }

    renderWelcomeScreen(app, onProjectLoaded);
}

init();
