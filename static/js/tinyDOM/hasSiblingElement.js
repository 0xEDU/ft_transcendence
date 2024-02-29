export default function hasSiblingElement(elementId, siblingElementHTML) {
    // Step 1: Get the reference to the target element
    const targetElement = document.getElementById(elementId);

    // Step 2: Traverse through its siblings
    let sibling = targetElement.nextElementSibling;
    let foundMatchingElement = false;

    while (sibling) {
        // Check if the sibling matches the provided HTML string
        if (sibling.outerHTML === siblingElementHTML) {
            foundMatchingElement = true;
            break; // Stop searching if a match is found
        }

        // Move to the next sibling
        sibling = sibling.nextElementSibling;
    }

    return foundMatchingElement;
}
