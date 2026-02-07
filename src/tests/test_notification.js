import {
    assert,
    assertEqual,
    runTest,
    printSummary
} from "./test_runner.js";

import { showNotification } from "../ui/notification.js";

function cleanup() {
    document.querySelectorAll(".notification").forEach(el => el.remove());
}

async function runNotificationTests() {
    console.log("\n▶ Notification Tests\n");

    await runTest("showNotification creates a notification element", () => {
        showNotification("Test message", "error", 10000);
        const el = document.querySelector(".notification");
        assert(el, "notification element should exist");
        assertEqual(el.textContent, "Test message");
        cleanup();
    });

    await runTest("showNotification applies error class by default", () => {
        showNotification("Error test");
        const el = document.querySelector(".notification");
        assert(el.classList.contains("error"), "should have error class");
        cleanup();
    });

    await runTest("showNotification applies success class", () => {
        showNotification("Success test", "success", 10000);
        const el = document.querySelector(".notification");
        assert(el.classList.contains("success"), "should have success class");
        cleanup();
    });

    await runTest("showNotification applies warning class", () => {
        showNotification("Warning test", "warning", 10000);
        const el = document.querySelector(".notification");
        assert(el.classList.contains("warning"), "should have warning class");
        cleanup();
    });

    await runTest("showNotification replaces existing notification", () => {
        showNotification("First", "error", 10000);
        showNotification("Second", "success", 10000);
        const all = document.querySelectorAll(".notification");
        assertEqual(all.length, 1);
        assertEqual(all[0].textContent, "Second");
        cleanup();
    });

    await runTest("showNotification auto-removes after duration", async () => {
        showNotification("Short", "error", 200);
        assert(document.querySelector(".notification"), "should exist immediately");
        await new Promise(resolve => setTimeout(resolve, 600));
        assert(!document.querySelector(".notification"), "should be removed after duration");
        cleanup();
    });

    return printSummary();
}

export { runNotificationTests };
