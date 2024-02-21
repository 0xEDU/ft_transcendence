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

    const playerInputIds = ['secondPlayer', 'thirdPlayer', 'fourthPlayer', 'fifthPlayer', 'sixthPlayer', 'seventhPlayer', 'eighthPlayer'];
    const playerInputs = []
    playerInputIds.forEach(id => playerInputs.push({id: id, element: document.getElementById(id)}));
    const findPlayerInput = (id) => playerInputs.find(player => player.id === id).element;
    const clearPlayerInputs = (...inputs) => inputs.forEach(input => findPlayerInput(input).value = '');

    const playerDivNames = ['player3And4Div', 'player5And6Div', 'player7And8Div'];
    const playerDivs = [];
    playerDivNames.forEach(id => playerDivs.push({id: id, element: document.getElementById(id)}));
    const findPlayerDiv = (id) => playerDivs.find(div => div.id === id).element;
    const addHiddenClass = (...divs) => divs.forEach(div => findPlayerDiv(div).classList.add('visually-hidden'));
    const removeHiddenClass = (...divs) => divs.forEach(div => findPlayerDiv(div).classList.remove('visually-hidden'));
    
    
    twoPlayersRadio.addEventListener('change', function() {
        if (twoPlayersRadio.checked) {
            clearPlayerInputs('thirdPlayer', 'fourthPlayer');
            addHiddenClass('player3And4Div');
        }
    })

    smObj.fourPlayersRadio.addEventListener('change', function() {
        if (smObj.fourPlayersRadio.checked) {
            removeHiddenClass('player3And4Div');
        } 
    })
    
    tObj.fourPlayersRadio.addEventListener('change', function() {
        if (tObj.fourPlayersRadio.checked) {
            clearPlayerInputs('fifthPlayer', 'sixthPlayer', 'seventhPlayer', 'eighthPlayer');
            addHiddenClass('player5And6Div', 'player7And8Div');
        } 
    })

    eightPlayersRadio.addEventListener('change', function() {
        if (eightPlayersRadio.checked) {
            removeHiddenClass('player5And6Div', 'player7And8Div');
        }
    })

    function handleFormSubmit(modalObj, event) {
        event.preventDefault();
        const url = "/pong/form";
        const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
        const formData = new FormData(event.target);
        const gameData = {
            "gameType": event.target.id === "singleMatchForm" ? "singleMatch" : "tournament",
            "gameMode": formData.get('gameModeDefault'),
            "playerQuantity": formData.get('playerDefault'),
            "mapSkin": formData.get('mapDefault'),
            "players": Array.from(formData.keys()).filter(key => 
                key.startsWith('player') && key.endsWith('Name')).map(key => formData.get(key)).filter(name => name !== ""),
        }
        console.log(event.target);
        console.log(formData);

        fetch(url, {
            method: 'POST',
            body: JSON.stringify(gameData),
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrfToken,
            },
        })
        .then(response => {
            if (!response.ok) {
                return Promise.reject(response);
            }
            if (hasElement(modalObj.playButtonDiv.id, "playerNotFound")) {
                deleteElement("playerNotFound");
            }
            modalObj.modalInstance.hide();
            clearPlayerInputs('secondPlayer', 'thirdPlayer', 'fourthPlayer');
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
