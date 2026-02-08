let _nextPanelId = 1;
let _panelRegistry = new Map();
let _tabRegistry = new Map();
let _dragData = null;

const LAYOUT_STORAGE_KEY = "lightplay_editor_layout";

function registerTabType(label, renderFn, cleanupFn) {
    _tabRegistry.set(label, { render: renderFn, cleanup: cleanupFn || null });
}

function createPanelLayout(container, layoutConfig) {
    _panelRegistry.clear();
    _nextPanelId = 1;

    const wrapper = document.createElement("div");
    wrapper.className = "panel-layout";
    container.appendChild(wrapper);

    return buildLayoutNode(wrapper, layoutConfig);
}

function buildLayoutNode(parentEl, config) {
    if (config.type === "panel") {
        return createPanel(parentEl, config);
    }
    if (config.type === "split") {
        return createSplit(parentEl, config);
    }
    return null;
}

function createPanel(parentEl, config) {
    const panelId = "panel_" + _nextPanelId++;

    const panel = document.createElement("div");
    panel.className = "panel";
    panel.dataset.panelId = panelId;

    const tabBar = document.createElement("div");
    tabBar.className = "panel-tab-bar";

    const tabContent = document.createElement("div");
    tabContent.className = "panel-content";

    panel.appendChild(tabBar);
    panel.appendChild(tabContent);
    parentEl.appendChild(panel);

    const panelState = {
        type: "panel",
        id: panelId,
        element: panel,
        tabBar: tabBar,
        contentArea: tabContent,
        tabs: [],
        activeTabIndex: -1
    };

    _panelRegistry.set(panelId, panelState);
    setupPanelDropTarget(panelState);

    if (config.tabs) {
        config.tabs.forEach(tab => {
            const render = tab.render || (_tabRegistry.has(tab.label) ? _tabRegistry.get(tab.label).render : null);
            const cleanup = tab.cleanup || (_tabRegistry.has(tab.label) ? _tabRegistry.get(tab.label).cleanup : null);
            if (render) {
                addTab(panelState, tab.label, render, cleanup);
            }
        });
        const activeIdx = config.activeTabIndex !== undefined ? config.activeTabIndex : 0;
        if (panelState.tabs.length > 0) {
            activateTab(panelState, Math.min(activeIdx, panelState.tabs.length - 1));
        }
    }

    return panelState;
}

function addTab(panelState, label, renderFn, cleanupFn) {
    const tabEl = document.createElement("div");
    tabEl.className = "panel-tab";
    tabEl.textContent = label;
    tabEl.draggable = true;

    const tabData = {
        label: label,
        render: renderFn,
        cleanup: cleanupFn || null,
        element: tabEl
    };

    tabEl.addEventListener("click", () => {
        const idx = panelState.tabs.indexOf(tabData);
        if (idx >= 0) {
            activateTab(panelState, idx);
            saveLayout();
        }
    });

    tabEl.addEventListener("dragstart", (e) => {
        const idx = panelState.tabs.indexOf(tabData);
        _dragData = {
            sourcePanelId: panelState.id,
            tabIndex: idx,
            tabLabel: label,
            tabRender: renderFn,
            tabCleanup: cleanupFn || null
        };
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", label);
        tabEl.classList.add("dragging");
        setTimeout(() => showDropIndicators(panelState.id), 0);
    });

    tabEl.addEventListener("dragend", () => {
        tabEl.classList.remove("dragging");
        hideDropIndicators();
        _dragData = null;
    });

    panelState.tabBar.appendChild(tabEl);
    panelState.tabs.push(tabData);
}

function removeTab(panelState, tabIndex) {
    if (tabIndex < 0 || tabIndex >= panelState.tabs.length) return;

    const prevActiveIndex = panelState.activeTabIndex;
    if (prevActiveIndex === tabIndex && panelState.tabs[prevActiveIndex].cleanup) {
        panelState.tabs[prevActiveIndex].cleanup();
    }

    const tab = panelState.tabs[tabIndex];
    tab.element.remove();
    panelState.tabs.splice(tabIndex, 1);

    if (panelState.tabs.length === 0) {
        panelState.activeTabIndex = -1;
        panelState.contentArea.innerHTML = "";
        collapseEmptyPanel(panelState);
    } else {
        const newActive = Math.min(
            panelState.activeTabIndex >= tabIndex ? panelState.activeTabIndex - 1 : panelState.activeTabIndex,
            panelState.tabs.length - 1
        );
        panelState.activeTabIndex = -1;
        activateTab(panelState, Math.max(0, newActive));
    }
}

function activateTab(panelState, index) {
    if (index < 0 || index >= panelState.tabs.length) return;

    const prevIndex = panelState.activeTabIndex;
    if (prevIndex >= 0 && prevIndex < panelState.tabs.length && prevIndex !== index) {
        const prevTab = panelState.tabs[prevIndex];
        if (prevTab.cleanup) prevTab.cleanup();
    }

    panelState.tabs.forEach((tab, i) => {
        tab.element.classList.toggle("active", i === index);
    });

    panelState.activeTabIndex = index;
    panelState.contentArea.innerHTML = "";

    const tab = panelState.tabs[index];
    if (tab.render) {
        tab.render(panelState.contentArea);
    }
}

function createSplit(parentEl, config) {
    const direction = config.direction || "horizontal";
    const splitContainer = document.createElement("div");
    splitContainer.className = `split-container split-${direction}`;
    parentEl.appendChild(splitContainer);

    const firstPane = document.createElement("div");
    firstPane.className = "split-pane split-first";
    const initialSize = config.ratio || 0.5;

    if (direction === "horizontal") {
        firstPane.style.width = (initialSize * 100) + "%";
    } else {
        firstPane.style.height = (initialSize * 100) + "%";
    }
    splitContainer.appendChild(firstPane);

    const divider = document.createElement("div");
    divider.className = `split-divider split-divider-${direction}`;
    splitContainer.appendChild(divider);

    const secondPane = document.createElement("div");
    secondPane.className = "split-pane split-second";
    secondPane.style.flex = "1";
    splitContainer.appendChild(secondPane);

    setupDividerDrag(divider, firstPane, splitContainer, direction);

    const children = config.children || [];
    const firstChild = children[0] ? buildLayoutNode(firstPane, children[0]) : null;
    const secondChild = children[1] ? buildLayoutNode(secondPane, children[1]) : null;

    return {
        type: "split",
        element: splitContainer,
        direction: direction,
        first: firstChild,
        second: secondChild,
        divider: divider,
        firstPane: firstPane,
        secondPane: secondPane
    };
}

function setupPanelDropTarget(panelState) {
    const panelEl = panelState.element;

    const dropOverlay = document.createElement("div");
    dropOverlay.className = "panel-drop-overlay";
    panelEl.appendChild(dropOverlay);
    panelState.dropOverlay = dropOverlay;

    ["center", "left", "right", "top", "bottom"].forEach(zone => {
        const indicator = document.createElement("div");
        indicator.className = `drop-zone drop-zone-${zone}`;
        indicator.dataset.zone = zone;
        dropOverlay.appendChild(indicator);
    });

    panelEl.addEventListener("dragover", (e) => {
        if (!_dragData) return;
        if (_dragData.sourcePanelId === panelState.id && panelState.tabs.length <= 1) return;

        e.preventDefault();
        e.dataTransfer.dropEffect = "move";

        const zone = detectDropZone(panelEl, e.clientX, e.clientY);
        dropOverlay.querySelectorAll(".drop-zone").forEach(z => {
            z.classList.toggle("highlight", z.dataset.zone === zone);
        });
    });

    panelEl.addEventListener("dragleave", (e) => {
        if (!panelEl.contains(e.relatedTarget)) {
            dropOverlay.querySelectorAll(".drop-zone").forEach(z => z.classList.remove("highlight"));
        }
    });

    panelEl.addEventListener("drop", (e) => {
        e.preventDefault();
        if (!_dragData) return;

        const zone = detectDropZone(panelEl, e.clientX, e.clientY);
        handleDrop(panelState, zone);
        hideDropIndicators();
    });
}

function detectDropZone(panelEl, clientX, clientY) {
    const rect = panelEl.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;

    const edge = 0.22;
    if (x < edge) return "left";
    if (x > 1 - edge) return "right";
    if (y < edge) return "top";
    if (y > 1 - edge) return "bottom";
    return "center";
}

function handleDrop(targetPanel, zone) {
    if (!_dragData) return;

    const sourcePanel = _panelRegistry.get(_dragData.sourcePanelId);
    if (!sourcePanel) return;

    if (targetPanel.id === sourcePanel.id && zone === "center") return;

    const label = _dragData.tabLabel;
    const render = _dragData.tabRender;
    const cleanup = _dragData.tabCleanup;
    const tabIndex = _dragData.tabIndex;

    _dragData = null;

    if (zone === "center") {
        removeTab(sourcePanel, tabIndex);
        addTab(targetPanel, label, render, cleanup);
        activateTab(targetPanel, targetPanel.tabs.length - 1);
    } else {
        const direction = (zone === "left" || zone === "right") ? "horizontal" : "vertical";
        const newPanelFirst = (zone === "left" || zone === "top");
        removeTab(sourcePanel, tabIndex);
        splitPanelWithNewTab(targetPanel, direction, newPanelFirst, label, render, cleanup);
    }

    saveLayout();
}

function splitPanelWithNewTab(targetPanel, direction, newPanelFirst, label, renderFn, cleanupFn) {
    const parentEl = targetPanel.element.parentElement;

    const splitContainer = document.createElement("div");
    splitContainer.className = `split-container split-${direction}`;

    const firstPane = document.createElement("div");
    firstPane.className = "split-pane split-first";
    firstPane.style[direction === "horizontal" ? "width" : "height"] = "50%";

    const divider = document.createElement("div");
    divider.className = `split-divider split-divider-${direction}`;

    const secondPane = document.createElement("div");
    secondPane.className = "split-pane split-second";
    secondPane.style.flex = "1";

    splitContainer.appendChild(firstPane);
    splitContainer.appendChild(divider);
    splitContainer.appendChild(secondPane);

    parentEl.replaceChild(splitContainer, targetPanel.element);

    const newPanelPane = newPanelFirst ? firstPane : secondPane;
    const existingPanelPane = newPanelFirst ? secondPane : firstPane;

    existingPanelPane.appendChild(targetPanel.element);

    createPanel(newPanelPane, {
        tabs: [{ label: label, render: renderFn, cleanup: cleanupFn }]
    });

    setupDividerDrag(divider, firstPane, splitContainer, direction);
}

function collapseEmptyPanel(panelState) {
    _panelRegistry.delete(panelState.id);

    const panelEl = panelState.element;
    const pane = panelEl.parentElement;

    if (!pane || !pane.classList.contains("split-pane")) {
        return;
    }

    const splitContainer = pane.parentElement;
    if (!splitContainer || !splitContainer.classList.contains("split-container")) {
        return;
    }

    const splitParent = splitContainer.parentElement;

    const firstPane = splitContainer.querySelector(":scope > .split-first");
    const secondPane = splitContainer.querySelector(":scope > .split-second");
    const siblingPane = (pane === firstPane) ? secondPane : firstPane;

    if (!siblingPane) return;

    const siblingContent = siblingPane.firstElementChild;
    if (siblingContent && splitParent) {
        splitParent.replaceChild(siblingContent, splitContainer);
    } else {
        splitContainer.remove();
    }

    saveLayout();
}

function showDropIndicators(sourcePanelId) {
    _panelRegistry.forEach(panel => {
        if (panel.dropOverlay) {
            const isSingleTabSource = panel.id === sourcePanelId && panel.tabs.length <= 1;
            panel.dropOverlay.classList.toggle("visible", !isSingleTabSource);
        }
    });
}

function hideDropIndicators() {
    _panelRegistry.forEach(panel => {
        if (panel.dropOverlay) {
            panel.dropOverlay.classList.remove("visible");
            panel.dropOverlay.querySelectorAll(".drop-zone").forEach(z => z.classList.remove("highlight"));
        }
    });
}

function setupDividerDrag(divider, firstPane, container, direction) {
    let dragging = false;

    divider.addEventListener("mousedown", (e) => {
        e.preventDefault();
        dragging = true;
        document.body.style.cursor = direction === "horizontal" ? "col-resize" : "row-resize";
        document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
        if (!dragging) return;

        const rect = container.getBoundingClientRect();

        if (direction === "horizontal") {
            const offset = e.clientX - rect.left;
            const dividerWidth = divider.offsetWidth;
            const minSize = 100;
            const maxSize = rect.width - minSize - dividerWidth;
            const clamped = Math.max(minSize, Math.min(offset, maxSize));
            firstPane.style.width = clamped + "px";
            firstPane.style.flex = "none";
        } else {
            const offset = e.clientY - rect.top;
            const dividerHeight = divider.offsetHeight;
            const minSize = 60;
            const maxSize = rect.height - minSize - dividerHeight;
            const clamped = Math.max(minSize, Math.min(offset, maxSize));
            firstPane.style.height = clamped + "px";
            firstPane.style.flex = "none";
        }
    });

    document.addEventListener("mouseup", () => {
        if (dragging) {
            dragging = false;
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            saveLayout();
        }
    });
}

function serializeFromDOM(element) {
    if (!element) return null;

    if (element.classList.contains("split-container")) {
        const direction = element.classList.contains("split-horizontal") ? "horizontal" : "vertical";
        const firstPane = element.querySelector(":scope > .split-first");
        const secondPane = element.querySelector(":scope > .split-second");

        let ratio = 0.5;
        if (firstPane) {
            const containerRect = element.getBoundingClientRect();
            const firstRect = firstPane.getBoundingClientRect();
            if (direction === "horizontal" && containerRect.width > 0) {
                ratio = firstRect.width / containerRect.width;
            } else if (direction === "vertical" && containerRect.height > 0) {
                ratio = firstRect.height / containerRect.height;
            }
        }

        return {
            type: "split",
            direction: direction,
            ratio: Math.round(ratio * 1000) / 1000,
            children: [
                firstPane ? serializeFromDOM(firstPane.firstElementChild) : null,
                secondPane ? serializeFromDOM(secondPane.firstElementChild) : null
            ]
        };
    }

    if (element.classList.contains("panel")) {
        const panelId = element.dataset.panelId;
        const panelState = _panelRegistry.get(panelId);

        const tabs = panelState ? panelState.tabs.map(t => t.label) : [];
        const activeTabIndex = panelState ? panelState.activeTabIndex : 0;

        return {
            type: "panel",
            tabs: tabs,
            activeTabIndex: activeTabIndex
        };
    }

    return null;
}

function saveLayout() {
    const layoutEl = document.querySelector(".panel-layout");
    if (!layoutEl || !layoutEl.firstElementChild) return;

    const config = serializeFromDOM(layoutEl.firstElementChild);
    if (config) {
        try {
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(config));
        } catch {
            // Storage full or unavailable
        }
    }
}

function loadSavedLayout() {
    try {
        const saved = localStorage.getItem(LAYOUT_STORAGE_KEY);
        if (!saved) return null;
        const config = JSON.parse(saved);
        return resolveLayoutConfig(config);
    } catch {
        return null;
    }
}

function resolveLayoutConfig(config) {
    if (!config) return null;

    if (config.type === "panel") {
        const resolvedTabs = [];
        for (const label of (config.tabs || [])) {
            const registered = _tabRegistry.get(label);
            if (registered) {
                resolvedTabs.push({
                    label: label,
                    render: registered.render,
                    cleanup: registered.cleanup
                });
            }
        }
        if (resolvedTabs.length === 0) return null;
        return {
            type: "panel",
            tabs: resolvedTabs,
            activeTabIndex: config.activeTabIndex || 0
        };
    }

    if (config.type === "split") {
        const children = (config.children || []).map(c => resolveLayoutConfig(c));
        const validChildren = children.filter(c => c !== null);
        if (validChildren.length === 0) return null;
        if (validChildren.length === 1) return validChildren[0];
        return {
            type: "split",
            direction: config.direction || "horizontal",
            ratio: config.ratio || 0.5,
            children: [children[0] || validChildren[0], children[1] || validChildren[0]]
        };
    }

    return null;
}

function clearSavedLayout() {
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
}

function getPanelRegistry() {
    return _panelRegistry;
}

export {
    createPanelLayout,
    addTab,
    activateTab,
    getPanelRegistry,
    registerTabType,
    loadSavedLayout,
    clearSavedLayout,
    saveLayout
};
