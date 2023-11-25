export default function deleteElement(elementId) {
    const targetElement = document.getElementById(elementId);

    if (targetElement) {
        // Remove the target element from its parent
        targetElement.parentNode.removeChild(targetElement);
    }
}