import emptyElement from "./tinyDOM/emptyElement.js"

export const state = {
    position: "",
    isLoggedIn: false,
};

export function scrollToSection(sectionName, behaviour = "smooth") {
    if (typeof sectionName === 'string') {
        let targetSection = document.getElementById(sectionName);

        if (targetSection) {
            window.scrollTo({
                top: targetSection.offsetTop,
                left: targetSection.offsetLeft,
                behavior: behaviour,
            });

            // Update the state or perform any other actions
            state.position = sectionName;
        } else {
            console.error(`Section "${sectionName}" not found.`);
        }
    } else {
        console.error('Invalid argument type. Expected a string.');
    }
}

function toggleControlPanelSize(controlPanel) {
    controlPanel.classList.toggle('shrink');
    controlPanel.querySelectorAll('.switch-component').forEach(function (element, index) {
        if (element.getAttribute('name') !== 'login') {
            element.classList.toggle('hiding');
            setTimeout(function () {
                if (element.classList.contains('hiding')) {
                    element.style.display = 'none';
                }
                else {
                    element.style.display = 'block';
                }
            }, 200 * index)
        }
    }, { once: true })
}

function togglePowerSwitchPegState() {
    let togglePeg = document.querySelector('#control-panel div.switch-component[name="login"]')
    let circle = togglePeg.querySelector(".right-side svg circle")

    if (state.isLoggedIn) {
        circle.classList.remove("peg-state-off");
        circle.classList.add("peg-state-on");
        circle.setAttribute('cy', '54');
    } else {
        circle.classList.remove("peg-state-on");
        circle.classList.add("peg-state-off");
        circle.setAttribute('cy', '147');
    }
}

// Handles main navigation logic of our SPA
document.addEventListener('DOMContentLoaded', function () {
    let controlPanel = document.getElementById('control-panel')

    // Dragging logic
    let isDragging, activateFullMotion, clicked = false;
    let startY, selectedPegToDrag;

    // Sends user to profile is the user is logged in, otherwise keeps them in the login screen
    state.isLoggedIn = (document.getElementById('userImage') !== null);

    scrollToSection("login", "instant");
    if (state.isLoggedIn === true) {
        setTimeout(() => {
            toggleControlPanelSize(controlPanel);
            togglePowerSwitchPegState()
            scrollToSection("profile");
        }, 1000); // Wait 1 second after browser loaded to perform animation/change screen;
    }

    // Setup of navigation via control panel
    // REFACTOR: THIS DOES NOT NEED TO BE DECLARED HERE so long as the script for this is placed at the end of the HTML file, or load it with the 'defer' attribute.
    controlPanel.addEventListener('click', function (event) {
        // Find the closest switch element or null if not found
        var clickedSwitch = event.target.closest('div#control-panel .right-side svg circle');

        if (clickedSwitch) {
            // Extract the switch name from the data attribute or any other identifier
            var clickedSwitchName = clickedSwitch.closest('.switch-component').getAttribute('name');

            if (clickedSwitchName == "login") {
                if (state.isLoggedIn == false) {
                    // Do the authentication magic
                    // opens the link to the intra login page in the current window
                    window.location.href = document.getElementById('intraLoginRedirectUrl').textContent;
                }
                else {
                    // Do the logging out magic
                    state.isLoggedIn = false;
                    togglePowerSwitchPegState()
                    toggleControlPanelSize(controlPanel)
                    fetch("/auth/logout")
                        .then(() => emptyElement('userDiv'));
                    scrollToSection("login")
                }
            }
        }
    });

    // Mouse down event for starting the drag
    let pegs = document.querySelectorAll('#control-panel div.switch-component .right-side svg circle')
    pegs.forEach(peg => {
        peg.addEventListener('mousedown', (e) => {
            clicked = true
            document.body.style.cursor = 'grabbing'
            startY = e.clientY;
            selectedPegToDrag = e.target;
            selectedPegToDrag.classList.remove('performFullMotion')
            selectedPegToDrag.classList.remove('returnToTop')
        })
    })

    // Mouse move event for updating the drag position
    document.addEventListener('mousemove', (e) => {
        let deltaY;
        if (clicked) {
            let currentY = e.clientY;
            deltaY = currentY - startY;
            if (Math.abs(deltaY) > 5)
                isDragging = true;
        }
        if (isDragging) {
            let pegGrooveHeight = document.querySelector('#control-panel div.switch-component .right-side').offsetHeight / 2
            let displacementPctg = deltaY / pegGrooveHeight
            if (displacementPctg > 0 && displacementPctg <= 0.9) {
                selectedPegToDrag.setAttribute('cy', String(54 + displacementPctg * (147 - 54)))
                if (displacementPctg > 0.5)
                    activateFullMotion = true
            }
        }
    });

    // Mouse up event for ending the drag
    pegs.forEach(peg => {
        peg.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                if (activateFullMotion) {
                    selectedPegToDrag.classList.add('performFullMotion')
                    setTimeout(() => {
                        scrollToSection(selectedPegToDrag.closest('.switch-component').getAttribute('name'))
                    }, 500);
                } else {
                    selectedPegToDrag.classList.add('returnToTop')
                }
            } else {
                selectedPegToDrag.classList.add("performIncompleteMotion")
                setTimeout(() => {
                    selectedPegToDrag.classList.remove("performIncompleteMotion");
                }, 400);
            }
            activateFullMotion = false
            setTimeout(() => {
                selectedPegToDrag.setAttribute('cy', '54')
            }, 300);
            clicked = false
            document.body.style.cursor = 'auto'
        });
    })
    
})
