import scrollToSection from "./control-panel.js";
import appendElement from "./tinyDOM/appendElement.js";
import deleteElement from "./tinyDOM/deleteElement.js";
import hasElement from "./tinyDOM/hasElement.js";

class ModalObj {
    constructor(form, modalElement, modalInstance, playButtonSvg, playButtonDiv, fourPlayersRadio, redCircle) {
        this.form = form;
        this.modalElement = modalElement;
        this.modalInstance = modalInstance;
        this.playButtonSvg = playButtonSvg;
        this.playButtonDiv = playButtonDiv;
        this.fourPlayersRadio = fourPlayersRadio;
        this.redCircle = redCircle;
        
        const buttonMouseDown = () => { this.redCircle.setAttribute('cy', '68'); };
        const buttonMouseUp = () => { this.redCircle.setAttribute('cy', '58'); };
        this.playButtonSvg.addEventListener('mousedown', buttonMouseDown);
        this.playButtonSvg.addEventListener('mouseup', buttonMouseUp);
    }
}

function curry(f) {
    return function(a) {
        return function(b) {
            return f(a, b);
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const smObj = new ModalObj(
        document.getElementById('singleMatchForm'),
        document.getElementById('singleMatchModal'),
        new bootstrap.Modal(document.getElementById('singleMatchModal'), {}),
        document.getElementById('smPlayButtonSvg'),
        document.getElementById('smPlayButtonDiv'),
        document.getElementById('smFourPlayersRadio'),
        document.getElementById('smRedCircle'),
    )
    
    const tObj = new ModalObj(
        document.getElementById('tournamentForm'),
        document.getElementById('tournamentModal'),
        new bootstrap.Modal(document.getElementById('tournamentModal'), {}),
        document.getElementById('tPlayButtonSvg'),
        document.getElementById('tPlayButtonDiv'),
        document.getElementById('tFourPlayersRadio'),
        document.getElementById('tRedCircle'),
    )

    const twoPlayersRadio = document.getElementById('twoPlayersRadio');
    const eightPlayersRadio = document.getElementById('eightPlayersRadio');

    const secondPlayerInput = document.getElementById('secondPlayer');
    const thirdPlayerInput = document.getElementById('thirdPlayer');
    const fourthPlayerInput = document.getElementById('fourthPlayer');
    const fifthPlayerInput = document.getElementById('fifthPlayer');
    const sixthPlayerInput = document.getElementById('sixthPlayer');
    const seventhPlayerInput = document.getElementById('seventhPlayer');
    const eighthPlayerInput = document.getElementById('eighthPlayer');

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

    smObj.fourPlayersRadio.addEventListener('change', function() {
        if (fourPlayersRadioSM.checked) {
            player3And4Div.classList.remove('visually-hidden');
        } 
    })
    
    tObj.fourPlayersRadio.addEventListener('change', function() {
        if (fourPlayersRadioT.checked) {
            fifthPlayerInput.value = '';
            sixthPlayerInput.value = '';
            seventhPlayerInput.value = '';
            eighthPlayerInput.value = '';
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

    function handleFormSubmit(modalObj, event) {
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
            if (hasElement(modalObj.playButtonDiv.id, "playerNotFound")) {
                deleteElement("playerNotFound");
            }
            modalObj.modalInstance.hide();
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
                if (!hasElement(modalObj.playButtonDiv.id, "playerNotFound")) {
                    appendElement(modalObj.playButtonSvg.id, errorBody);
                }
            });
        });
    }       

    smObj.form.addEventListener("submit", curry(handleFormSubmit)(smObj));
    tObj.form.addEventListener("submit", curry(handleFormSubmit)(tObj));
});
