export default function emptyElement(elementId) {
    const targetElement = document.getElementById(elementId);
    if (targetElement) {
        // Remove all child nodes from the target element
        while (targetElement.firstChild) {
            targetElement.removeChild(targetElement.firstChild);
        }
    } else {
        console.error(`Element with ID '${elementId}' not found.`);
    }
}