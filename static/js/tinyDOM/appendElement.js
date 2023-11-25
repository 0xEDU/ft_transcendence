export default function appendElement(elementId, htmlString) {
    const targetElement = document.getElementById(elementId);

    if (targetElement) {
        // Create a temporary container element
        const tempContainer = document.createElement('div');
        
        // Insert the HTML string into the container
        tempContainer.innerHTML = htmlString;

        // Get the child nodes from the container
        const childNodes = tempContainer.childNodes;

        // Insert each child node after the target element
        for (let i = childNodes.length - 1; i >= 0; i--) {
            targetElement.parentNode.insertBefore(childNodes[i].cloneNode(true), targetElement.nextSibling);
        }

        // Remove the temporary container
        tempContainer.remove();
    } else {
        console.error(`Element with ID '${elementId}' not found.`);
    }
}