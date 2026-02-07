function createPanelLayout(container, layoutConfig) {
    const wrapper = document.createElement("div");
    wrapper.className = "panel-layout";
    container.appendChild(wrapper);

    const layout = buildLayoutNode(wrapper, layoutConfig);
    return layout;
}

function buildLayoutNode(parent, config) {
    if (config.type === "panel") {
        return createPanel(parent, config);
    }

    if (config.type === "split") {
        return createSplit(parent, config);
    }

    return null;
}

function createPanel(parent, config) {
    const panel = document.createElement("div");
    panel.className = "panel";
    panel.dataset.panelId = config.id || "";

    const tabBar = document.createElement("div");
    tabBar.className = "panel-tab-bar";

    const tabContent = document.createElement("div");
    tabContent.className = "panel-content";

    panel.appendChild(tabBar);
    panel.appendChild(tabContent);
    parent.appendChild(panel);

    const panelState = {
        element: panel,
        tabBar: tabBar,
        contentArea: tabContent,
        tabs: [],
        activeTabIndex: -1
    };

    if (config.tabs) {
        config.tabs.forEach((tab, i) => {
            addTab(panelState, tab.label, tab.render);
        });
        if (panelState.tabs.length > 0) {
            activateTab(panelState, 0);
        }
    }

    return panelState;
}

function addTab(panelState, label, renderFn) {
    const tabIndex = panelState.tabs.length;

    const tabEl = document.createElement("div");
    tabEl.className = "panel-tab";
    tabEl.textContent = label;
    tabEl.addEventListener("click", () => activateTab(panelState, tabIndex));
    panelState.tabBar.appendChild(tabEl);

    panelState.tabs.push({
        label: label,
        element: tabEl,
        render: renderFn
    });
}

function activateTab(panelState, index) {
    if (index < 0 || index >= panelState.tabs.length) return;

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

function createSplit(parent, config) {
    const direction = config.direction || "horizontal";
    const splitContainer = document.createElement("div");
    splitContainer.className = `split-container split-${direction}`;
    parent.appendChild(splitContainer);

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
        element: splitContainer,
        direction: direction,
        first: firstChild,
        second: secondChild,
        divider: divider
    };
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
        }
    });
}

export { createPanelLayout, addTab, activateTab };
