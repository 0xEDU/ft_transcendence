export default function swapInnerHTMLOfElement(elementId, innerHtml) {
    const targetElement = document.getElementById(elementId);

    if (targetElement) {
      targetElement.innerHTML = innerHtml;
    } else {
        console.error(`Target element with ID '${elementId}' not found.`);
    }
}