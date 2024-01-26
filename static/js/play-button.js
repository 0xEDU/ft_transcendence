import scrollToSection from "./control-panel.js";

document.addEventListener('DOMContentLoaded', function() {
    var playButtonSvg = document.getElementById('playButtonSvg');
    var redCircle = document.getElementById('redCircle');
    var modalElement = document.getElementById('singleMatchModal');
    
    var modalInstance = new bootstrap.Modal(modalElement, {
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
});