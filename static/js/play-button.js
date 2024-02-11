import scrollToSection from "./control-panel.js";
import appendElement from "./tinyDOM/appendElement.js";
import deleteElement from "./tinyDOM/deleteElement.js";
import hasElement from "./tinyDOM/hasElement.js";

document.addEventListener('DOMContentLoaded', function() {
    const playButtonSvg = document.getElementById('playButtonSvg');
    const redCircle = document.getElementById('redCircle');
    const modalElement = document.getElementById('singleMatchModal');
    const singleMatchForm = document.getElementById('singleMatchForm');
    const twoPlayersRadio = document.getElementById('twoPlayersRadio');
    const fourPlayersRadioSM = document.getElementById('fourPlayersRadioSM');
    const fourPlayersRadioT = document.getElementById('fourPlayersRadioT');
    const eightPlayersRadio = document.getElementById('eightPlayersRadio');
    const secondPlayerInput = document.getElementById('secondPlayer');
    const thirdPlayerInput = document.getElementById('thirdPlayer');
    const fourthPlayerInput = document.getElementById('fourthPlayer');
    const player3And4Div = document.getElementById('player3And4Div');
    const player5And6Div = document.getElementById('player5And6Div');
    const player7And8Div = document.getElementById('player7And8Div');
    
    
    twoPlayersRadio.addEventListener('change', function() {
        if (twoPlayersRadio.checked) {
            thirdPlayerInput.value = '';
            fourthPlayerInput.value = '';
            player3And4Div.classList.add('visually-hidden');
        }
    })

    fourPlayersRadioSM.addEventListener('change', function() {
        if (fourPlayersRadioSM.checked) {
            player3And4Div.classList.remove('visually-hidden');
        } 
    })
    
    fourPlayersRadioT.addEventListener('change', function() {
        if (fourPlayersRadioT.checked) {
            player5And6Div.classList.add('visually-hidden');
            player7And8Div.classList.add('visually-hidden');
        } 
    })

    eightPlayersRadio.addEventListener('change', function() {
        if (eightPlayersRadio.checked) {
            player5And6Div.classList.remove('visually-hidden');
            player7And8Div.classList.remove('visually-hidden');
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
            if (hasElement("playButtonDiv", "playerNotFound")) {
                deleteElement("playerNotFound");
            }
            modalInstance.hide();
            secondPlayerInput.value = '';
            thirdPlayerInput.value = '';
            fourthPlayerInput.value = '';
            scrollToSection("arena");
            return response.text();
        })
        .then(responseText => {
            console.log("Response:", responseText);
        })
        .catch(error => {
            error.text().then(errorBody => {
                if (!hasElement("playButtonDiv", "playerNotFound")) {
                    appendElement("playButtonSvg", errorBody);
                }
            });
        });
    });
});
