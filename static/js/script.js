import { scrollToSection, state } from "./control-panel.js"

// Reposition viewport to the current board position when window is resized:
window.addEventListener('resize', function () {
    scrollToSection(state.position, "instant")
});