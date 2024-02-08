export default function hasElement(parentId, elementId) {
    const parentElement = document.getElementById(parentId);
    return !!parentElement.querySelector('#' + elementId); 
}