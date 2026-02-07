import { getEditorState } from "../../core/editor_state.js";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp", ".svg"];
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg", ".flac", ".aac", ".m4a"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".avi", ".mov"];
const DATA_EXTENSIONS = [".json", ".xml", ".csv", ".txt"];

let _container = null;

function renderAssetsBrowser(container) {
    _container = container;
    _container.innerHTML = "";
    loadAssets();
}

async function loadAssets() {
    if (!_container) return;
    _container.innerHTML = "";

    const state = getEditorState();
    if (!state || !state.project || !state.project.directoryHandle) {
        showMessage("No project directory available.");
        return;
    }

    const dirHandle = state.project.directoryHandle;

    let assetsHandle;
    try {
        assetsHandle = await dirHandle.getDirectoryHandle("Assets", { create: false });
    } catch {
        showCreateAssetsFolder(dirHandle);
        return;
    }

    const files = [];
    try {
        for await (const entry of assetsHandle.values()) {
            files.push({
                name: entry.name,
                kind: entry.kind,
                handle: entry
            });
        }
    } catch (err) {
        showMessage("Failed to read Assets folder: " + err.message);
        return;
    }

    renderFileList(files);
}

function showMessage(text) {
    const msg = document.createElement("div");
    msg.className = "assets-empty";
    msg.textContent = text;
    _container.appendChild(msg);
}

function showCreateAssetsFolder(dirHandle) {
    const wrapper = document.createElement("div");
    wrapper.className = "assets-empty";

    const msg = document.createElement("div");
    msg.textContent = "No \"Assets\" folder found in project.";
    wrapper.appendChild(msg);

    const btn = document.createElement("button");
    btn.className = "btn btn-small btn-primary";
    btn.textContent = "Create Assets Folder";
    btn.style.marginTop = "12px";
    btn.addEventListener("click", async () => {
        try {
            await dirHandle.getDirectoryHandle("Assets", { create: true });
            loadAssets();
        } catch (err) {
            showMessage("Failed to create Assets folder: " + err.message);
        }
    });
    wrapper.appendChild(btn);

    _container.appendChild(wrapper);
}

function renderFileList(files) {
    _container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "assets-content";

    const header = document.createElement("div");
    header.className = "assets-header";

    const title = document.createElement("span");
    title.textContent = "Assets";
    header.appendChild(title);

    const refreshBtn = document.createElement("button");
    refreshBtn.className = "btn btn-small btn-secondary";
    refreshBtn.textContent = "Refresh";
    refreshBtn.addEventListener("click", () => loadAssets());
    header.appendChild(refreshBtn);

    wrapper.appendChild(header);

    const list = document.createElement("div");
    list.className = "assets-list";

    if (files.length === 0) {
        const empty = document.createElement("div");
        empty.className = "assets-list-empty";
        empty.textContent = "Assets folder is empty. Add images, audio, and other files to your project's Assets folder.";
        list.appendChild(empty);
    } else {
        const sorted = [...files].sort((a, b) => {
            if (a.kind !== b.kind) return a.kind === "directory" ? -1 : 1;
            return a.name.localeCompare(b.name);
        });

        sorted.forEach(file => {
            const item = document.createElement("div");
            item.className = "assets-item";

            const icon = document.createElement("span");
            icon.className = "assets-item-icon";
            icon.textContent = getFileIcon(file);
            item.appendChild(icon);

            const nameSpan = document.createElement("span");
            nameSpan.className = "assets-item-name";
            nameSpan.textContent = file.name;
            item.appendChild(nameSpan);

            const typeSpan = document.createElement("span");
            typeSpan.className = "assets-item-type";
            typeSpan.textContent = getFileTypeLabel(file);
            item.appendChild(typeSpan);

            list.appendChild(item);
        });
    }

    wrapper.appendChild(list);
    _container.appendChild(wrapper);
}

function getFileIcon(file) {
    if (file.kind === "directory") return "\uD83D\uDCC1";
    const ext = getExtension(file.name);
    if (IMAGE_EXTENSIONS.includes(ext)) return "\uD83D\uDDBC";
    if (AUDIO_EXTENSIONS.includes(ext)) return "\uD83D\uDD0A";
    if (VIDEO_EXTENSIONS.includes(ext)) return "\uD83C\uDFAC";
    if (DATA_EXTENSIONS.includes(ext)) return "\uD83D\uDCC4";
    return "\uD83D\uDCCE";
}

function getFileTypeLabel(file) {
    if (file.kind === "directory") return "Folder";
    const ext = getExtension(file.name);
    if (IMAGE_EXTENSIONS.includes(ext)) return "Image";
    if (AUDIO_EXTENSIONS.includes(ext)) return "Audio";
    if (VIDEO_EXTENSIONS.includes(ext)) return "Video";
    if (DATA_EXTENSIONS.includes(ext)) return "Data";
    return "File";
}

function getExtension(filename) {
    const dot = filename.lastIndexOf(".");
    if (dot === -1) return "";
    return filename.substring(dot).toLowerCase();
}

export { renderAssetsBrowser };
