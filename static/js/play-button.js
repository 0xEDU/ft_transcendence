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
        const url = "/pong/form";
        const request = new XMLHttpRequest();
        request.open('POST', url, true);
        request.onload = function() {
            console.log(request.responseText);
        };
        
        request.send(new FormData(event.target));
        event.preventDefault();
        console.log("AQ CHEGOU")
    });
});
