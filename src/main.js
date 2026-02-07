import { renderWelcomeScreen } from "./ui/welcome_screen.js";
import { renderEditorScreen } from "./ui/editor_screen.js";

const app = document.getElementById("app");

function onProjectLoaded(project) {
    renderEditorScreen(app, project);
}

renderWelcomeScreen(app, onProjectLoaded);
