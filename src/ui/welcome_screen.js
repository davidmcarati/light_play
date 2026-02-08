import { createModal, closeModal } from "./modal.js";
import { showNotification } from "./notification.js";
import { createNewProject, loadExistingProject, isFileSystemAccessSupported, loadProjectFromHandle } from "../core/project.js";
import { getRecentProjects, removeRecentProject } from "../core/recent_projects.js";

function renderWelcomeScreen(app, onProjectLoaded) {
    app.innerHTML = "";

    const screen = document.createElement("div");
    screen.className = "welcome-screen";

    const title = document.createElement("h1");
    title.innerHTML = "Light <span>Play</span>";
    screen.appendChild(title);

    if (!isFileSystemAccessSupported()) {
        const warning = document.createElement("p");
        warning.style.color = "#f39c12";
        warning.style.fontSize = "0.9rem";
        warning.style.maxWidth = "400px";
        warning.style.textAlign = "center";
        warning.textContent = "Your browser does not support the File System Access API. Please use Chrome, Edge, or another Chromium-based browser.";
        screen.appendChild(warning);
    }

    const actions = document.createElement("div");
    actions.className = "welcome-actions";

    const createBtn = document.createElement("button");
    createBtn.className = "btn btn-primary";
    createBtn.textContent = "New Project";
    createBtn.addEventListener("click", () => handleNewProject(onProjectLoaded));

    const loadBtn = document.createElement("button");
    loadBtn.className = "btn btn-secondary";
    loadBtn.textContent = "Open Project";
    loadBtn.addEventListener("click", () => handleLoadProject(onProjectLoaded));

    actions.appendChild(createBtn);
    actions.appendChild(loadBtn);
    screen.appendChild(actions);

    app.appendChild(screen);
}

function handleNewProject(onProjectLoaded) {
    const bodyHTML = `
        <p>All projects in Light Play are stored <strong>locally on your device</strong>. 
        Nothing is uploaded to any server or cloud — your files remain entirely yours.</p>
        <p>Choose a folder on your computer where the project files will be created.</p>
        <div class="input-group">
            <label for="project-name-input">Project Name</label>
            <input type="text" id="project-name-input" placeholder="My Game" value="My Game" />
        </div>
    `;

    createModal("Create New Project", bodyHTML, [
        {
            label: "Cancel",
            className: "btn-secondary",
            onClick: (overlay) => closeModal(overlay)
        },
        {
            label: "Choose Folder & Create",
            className: "btn-primary",
            onClick: async (overlay) => {
                const input = document.getElementById("project-name-input");
                const projectName = input.value.trim() || "My Game";

                closeModal(overlay);

                try {
                    const result = await createNewProject(projectName);
                    if (result) {
                        showNotification(`Project "${projectName}" created!`, "success");
                        onProjectLoaded(result);
                    }
                } catch (err) {
                    showNotification(err.message, "error");
                }
            }
        }
    ]);

    setTimeout(() => {
        const input = document.getElementById("project-name-input");
        if (input) {
            input.focus();
            input.select();
        }
    }, 100);
}

async function handleLoadProject(onProjectLoaded) {
    const recentProjects = await getRecentProjects();

    let bodyHTML = `
        <p>All projects in Light Play are stored <strong>locally on your device</strong>. 
        Nothing is uploaded to any server or cloud.</p>
    `;

    if (recentProjects.length > 0) {
        bodyHTML += `
            <div class="recent-projects-section">
                <div class="recent-projects-title">Recent Projects</div>
                <div class="recent-projects-list" id="recent-projects-list"></div>
            </div>
        `;
    }

    bodyHTML += `<p style="margin-top: 16px;">Or select a folder that contains your <strong>project.lplay</strong> file.</p>`;

    const overlay = createModal("Open Project", bodyHTML, [
        {
            label: "Cancel",
            className: "btn-secondary",
            onClick: (ov) => closeModal(ov)
        },
        {
            label: "Browse Folder...",
            className: "btn-primary",
            onClick: async (ov) => {
                closeModal(ov);
                try {
                    const result = await loadExistingProject();
                    if (result) {
                        showNotification(`Project "${result.projectData.name}" loaded!`, "success");
                        onProjectLoaded(result);
                    }
                } catch (err) {
                    showNotification(err.message, "error");
                }
            }
        }
    ]);

    if (recentProjects.length > 0) {
        const listEl = document.getElementById("recent-projects-list");
        if (listEl) {
            recentProjects.forEach(project => {
                const item = document.createElement("div");
                item.className = "recent-project-item";

                const nameSpan = document.createElement("span");
                nameSpan.className = "recent-project-name";
                nameSpan.textContent = project.name;
                item.appendChild(nameSpan);

                const timeSpan = document.createElement("span");
                timeSpan.className = "recent-project-time";
                timeSpan.textContent = formatTimeAgo(project.lastOpened);
                item.appendChild(timeSpan);

                const removeBtn = document.createElement("button");
                removeBtn.className = "recent-project-remove";
                removeBtn.textContent = "\u00D7";
                removeBtn.addEventListener("click", async (e) => {
                    e.stopPropagation();
                    await removeRecentProject(project.id);
                    item.remove();
                });
                item.appendChild(removeBtn);

                item.addEventListener("click", async () => {
                    closeModal(overlay);
                    try {
                        const handle = project.directoryHandle;
                        let permission = await handle.queryPermission({ mode: "readwrite" });
                        if (permission !== "granted") {
                            permission = await handle.requestPermission({ mode: "readwrite" });
                        }
                        if (permission !== "granted") {
                            showNotification("Permission denied for project folder.", "error");
                            return;
                        }

                        const result = await loadProjectFromHandle(handle);
                        showNotification(`Project "${result.projectData.name}" loaded!`, "success");
                        onProjectLoaded(result);
                    } catch (err) {
                        showNotification("Failed to open project: " + err.message, "error");
                    }
                });

                listEl.appendChild(item);
            });
        }
    }
}

function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return minutes + "m ago";
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return hours + "h ago";
    const days = Math.floor(hours / 24);
    if (days < 30) return days + "d ago";
    return new Date(timestamp).toLocaleDateString();
}

export { renderWelcomeScreen };
