export default function insertElement(parentId, childHtml) {
    const parentElement = document.getElementById(parentId);

    if (parentElement) {
      parentElement.innerHTML = childHtml;
    } else {
        console.error(`Parent element with ID '${parentId}' not found.`);
    }
}