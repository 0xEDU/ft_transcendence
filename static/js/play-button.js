import scrollToSection from "./control-panel.js";
import appendElement from "./tinyDOM/appendElement.js";
import deleteElement from "./tinyDOM/deleteElement.js";
import hasElement from "./tinyDOM/hasElement.js";

document.addEventListener('DOMContentLoaded', function() {
    const playButtonSvg = document.getElementById('playButtonSvg');
    const redCircle = document.getElementById('redCircle');
    const modalElement = document.getElementById('singleMatchModal');
    const singleMatchForm = document.getElementById('singleMatchForm');
    const fourPlayersRadio = document.getElementById('fourPlayersRadio');
    const twoPlayersRadio = document.getElementById('twoPlayersRadio');
    
    
    twoPlayersRadio.addEventListener('change', function() {
        if (twoPlayersRadio.checked) {
            const thirdPlayer = document.getElementById('thirdPlayer');
            const fourthPlayer = document.getElementById('fourthPlayer');
            thirdPlayer.value = '';
            fourthPlayer.value = '';
            player3And4Div.classList.add('visually-hidden');
        }
    })

    fourPlayersRadio.addEventListener('change', function() {
        if (fourPlayersRadio.checked) {
            player3And4Div.classList.remove('visually-hidden');
        } 
    })
    
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
            if (hasElement("playerButtonDiv", "playerNotFound")) {
                deleteElement("playerNotFound");
            }
            modalInstance.hide();
            const secondPlayerInput = document.getElementById('secondPlayer');
            secondPlayerInput.value = '';
            scrollToSection("arena");
            return response.text();
        })
        .then(responseText => {
            console.log("Response:", responseText);
        })
        .catch(error => {
            error.text().then(errorBody => {
                if (!hasElement("playerButtonDiv", "playerNotFound")) {
                    appendElement("playButtonSvg", errorBody);
                }
            });
        });
    });
});
