const DB_NAME = "LightPlayDB";
const DB_VERSION = 1;
const STORE_NAME = "recent_projects";
const LAST_PROJECT_KEY = "__last_project__";

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveRecentProject(name, directoryHandle) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    store.put({
        id: name,
        name: name,
        directoryHandle: directoryHandle,
        lastOpened: Date.now()
    });

    store.put({
        id: LAST_PROJECT_KEY,
        name: name,
        directoryHandle: directoryHandle,
        lastOpened: Date.now()
    });

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

async function getRecentProjects() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        return new Promise((resolve) => {
            const request = store.getAll();
            request.onsuccess = () => {
                db.close();
                const all = request.result.filter(e => e.id !== LAST_PROJECT_KEY);
                all.sort((a, b) => b.lastOpened - a.lastOpened);
                resolve(all);
            };
            request.onerror = () => { db.close(); resolve([]); };
        });
    } catch {
        return [];
    }
}

async function getLastProject() {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);

        return new Promise((resolve) => {
            const request = store.get(LAST_PROJECT_KEY);
            request.onsuccess = () => {
                db.close();
                resolve(request.result || null);
            };
            request.onerror = () => { db.close(); resolve(null); };
        });
    } catch {
        return null;
    }
}

async function removeRecentProject(name) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(name);

    return new Promise((resolve, reject) => {
        tx.oncomplete = () => { db.close(); resolve(); };
        tx.onerror = () => { db.close(); reject(tx.error); };
    });
}

export {
    saveRecentProject,
    getRecentProjects,
    getLastProject,
    removeRecentProject
};
