import insertElement from "./tinyDOM/insertElement.js"
import emptyElement from "./tinyDOM/emptyElement.js"

const logoutCallback = () => {
    fetch("/auth/logout")
        .then(() => emptyElement('userDiv'))
        .then(() => displayUser())
}

// We might need and endpoint that return texts based on locale for the translations
const displayUser = async () => {
    const id = 'userDiv'
    fetch('/auth/user/')
    .then((response) => response.text())
    .then((text) => {insertElement(id, text)})
    .then(() => {
        const logoutButton = document.getElementById('logoutButton')
        if (logoutButton)
            logoutButton.addEventListener('click', logoutCallback)
    })
}

document.addEventListener("DOMContentLoaded", () => {
    displayUser()
});