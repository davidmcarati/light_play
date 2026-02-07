function createModal(title, bodyHTML, actions) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modal = document.createElement("div");
    modal.className = "modal";

    const heading = document.createElement("h2");
    heading.textContent = title;
    modal.appendChild(heading);

    const body = document.createElement("div");
    body.innerHTML = bodyHTML;
    modal.appendChild(body);

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "modal-actions";

    actions.forEach(action => {
        const btn = document.createElement("button");
        btn.className = `btn ${action.className || "btn-primary"}`;
        btn.textContent = action.label;
        btn.addEventListener("click", () => {
            action.onClick(overlay, modal);
        });
        actionsContainer.appendChild(btn);
    });

    modal.appendChild(actionsContainer);
    overlay.appendChild(modal);

    let mouseDownTarget = null;

    overlay.addEventListener("mousedown", (e) => {
        mouseDownTarget = e.target;
    });

    overlay.addEventListener("mouseup", (e) => {
        if (e.target === overlay && mouseDownTarget === overlay) {
            overlay.remove();
        }
        mouseDownTarget = null;
    });

    document.body.appendChild(overlay);

    return overlay;
}

function closeModal(overlay) {
    if (overlay && overlay.parentNode) {
        overlay.remove();
    }
}

export { createModal, closeModal };
