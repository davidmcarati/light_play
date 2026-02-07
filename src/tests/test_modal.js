import {
    assert,
    assertEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import { createModal, closeModal } from "../ui/modal.js";

function cleanup() {
    document.querySelectorAll(".modal-overlay").forEach(el => el.remove());
}

async function runModalTests() {
    console.log("\n▶ Modal Tests\n");

    await runTest("createModal creates an overlay in the DOM", () => {
        const overlay = createModal("Test", "<p>Body</p>", []);
        assert(document.querySelector(".modal-overlay"), "overlay should exist in DOM");
        cleanup();
    });

    await runTest("createModal sets the title text", () => {
        const overlay = createModal("My Title", "<p>Content</p>", []);
        const heading = overlay.querySelector("h2");
        assertEqual(heading.textContent, "My Title");
        cleanup();
    });

    await runTest("createModal renders body HTML", () => {
        const overlay = createModal("Title", "<p class='test-body'>Hello</p>", []);
        const body = overlay.querySelector(".test-body");
        assert(body, "body content should be rendered");
        assertEqual(body.textContent, "Hello");
        cleanup();
    });

    await runTest("createModal renders action buttons", () => {
        const overlay = createModal("Title", "<p>Body</p>", [
            { label: "OK", className: "btn-primary", onClick: () => {} },
            { label: "Cancel", className: "btn-secondary", onClick: () => {} }
        ]);
        const buttons = overlay.querySelectorAll(".modal-actions .btn");
        assertEqual(buttons.length, 2);
        assertEqual(buttons[0].textContent, "OK");
        assertEqual(buttons[1].textContent, "Cancel");
        cleanup();
    });

    await runTest("createModal button receives correct class", () => {
        const overlay = createModal("Title", "", [
            { label: "Go", className: "btn-primary", onClick: () => {} }
        ]);
        const btn = overlay.querySelector(".modal-actions .btn");
        assert(btn.classList.contains("btn-primary"), "button should have btn-primary class");
        cleanup();
    });

    await runTest("createModal button onClick is called on click", () => {
        let clicked = false;
        const overlay = createModal("Title", "", [
            { label: "Click Me", onClick: () => { clicked = true; } }
        ]);
        const btn = overlay.querySelector(".modal-actions .btn");
        btn.click();
        assert(clicked, "onClick handler should have been called");
        cleanup();
    });

    await runTest("createModal onClick receives overlay reference", () => {
        let receivedOverlay = null;
        const overlay = createModal("Title", "", [
            { label: "Test", onClick: (o) => { receivedOverlay = o; } }
        ]);
        const btn = overlay.querySelector(".modal-actions .btn");
        btn.click();
        assertEqual(receivedOverlay, overlay);
        cleanup();
    });

    await runTest("closeModal removes the overlay from DOM", () => {
        const overlay = createModal("Title", "", []);
        assert(document.querySelector(".modal-overlay"), "overlay should exist before close");
        closeModal(overlay);
        assert(!document.querySelector(".modal-overlay"), "overlay should be removed after close");
        cleanup();
    });

    await runTest("closeModal handles null gracefully", () => {
        closeModal(null);
        assert(true, "should not throw");
    });

    await runTest("closeModal handles already-removed overlay gracefully", () => {
        const overlay = createModal("Title", "", []);
        overlay.remove();
        closeModal(overlay);
        assert(true, "should not throw on double removal");
    });

    await runTest("clicking directly on overlay background closes the modal", () => {
        const overlay = createModal("Title", "<p>Body</p>", []);

        const mousedown = new MouseEvent("mousedown", { bubbles: true });
        Object.defineProperty(mousedown, "target", { value: overlay });
        overlay.dispatchEvent(mousedown);

        const mouseup = new MouseEvent("mouseup", { bubbles: true });
        Object.defineProperty(mouseup, "target", { value: overlay });
        overlay.dispatchEvent(mouseup);

        assert(!document.querySelector(".modal-overlay"), "overlay should be removed");
        cleanup();
    });

    await runTest("mousedown on modal + mouseup on overlay does NOT close", () => {
        const overlay = createModal("Title", "<p>Body</p>", []);
        const modal = overlay.querySelector(".modal");

        const mousedown = new MouseEvent("mousedown", { bubbles: true });
        Object.defineProperty(mousedown, "target", { value: modal });
        overlay.dispatchEvent(mousedown);

        const mouseup = new MouseEvent("mouseup", { bubbles: true });
        Object.defineProperty(mouseup, "target", { value: overlay });
        overlay.dispatchEvent(mouseup);

        assert(document.querySelector(".modal-overlay"), "overlay should NOT be removed on drag");
        cleanup();
    });

    return printSummary();
}

export { runModalTests };
