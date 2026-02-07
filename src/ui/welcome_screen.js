import { createModal, closeModal } from "./modal.js";
import { showNotification } from "./notification.js";
import { createNewProject, loadExistingProject, isFileSystemAccessSupported } from "../core/project.js";

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

function handleLoadProject(onProjectLoaded) {
    const bodyHTML = `
        <p>All projects in Light Play are stored <strong>locally on your device</strong>. 
        Nothing is uploaded to any server or cloud.</p>
        <p>Select the folder that contains your <strong>project.lplay</strong> file to open it.</p>
    `;

    createModal("Open Existing Project", bodyHTML, [
        {
            label: "Cancel",
            className: "btn-secondary",
            onClick: (overlay) => closeModal(overlay)
        },
        {
            label: "Choose Project Folder",
            className: "btn-primary",
            onClick: async (overlay) => {
                closeModal(overlay);

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
}

export { renderWelcomeScreen };
