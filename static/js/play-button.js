import scrollToSection from "./control-panel.js";

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
        modalInstance.hide();
        scrollToSection("arena");
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
                console.log("Error:", response);
                return Promise.reject(response);
            }
            return response.text();
        })
        .then(responseText => {
            console.log("Response:", responseText);
        })
        .catch(error => console.error('Error:', error));
    });
});
