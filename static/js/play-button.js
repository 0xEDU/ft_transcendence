import scrollToSection from "./control-panel.js";
import appendElement from "./tinyDOM/appendElement.js";
import deleteElement from "./tinyDOM/deleteElement.js";
import hasElement from "./tinyDOM/hasElement.js";

document.addEventListener('DOMContentLoaded', function() {
    const playButtonSvg = document.getElementById('playButtonSvg');
    const redCircle = document.getElementById('redCircle');
    const modalElement = document.getElementById('singleMatchModal');
    const singleMatchForm = document.getElementById('singleMatchForm');
    
    const modalInstance = new bootstrap.Modal(modalElement, {
        // options, if any
    });

    playButtonSvg.addEventListener('mousedown', function() {
        redCircle.setAttribute('cy', '68');
    });

    playButtonSvg.addEventListener('mouseup', function() {
        redCircle.setAttribute('cy', '58');
    });

    singleMatchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const url = "/pong/form";
        const formData = new FormData(event.target);

        fetch(url, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return Promise.reject(response);
            }
            if (hasElement("playerInputDiv", "playerNotFound")) {
                deleteElement("playerNotFound");
            }
            modalInstance.hide();
            scrollToSection("arena");
            return response.text();
        })
        .then(responseText => {
            console.log("Response:", responseText);
        })
        .catch(error => {
            error.text().then(errorBody => {
                if (!hasElement("playerInputDiv", "playerNotFound")) {
                    appendElement("secondPlayer", errorBody)
                }
            })
        });
    });
});
