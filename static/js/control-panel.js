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
    // Elements selection
    var publicArea = ["login"]
    var restrictedArea = ["profile", "stats", "lobby", "kudos"]

    let controlPanel = document.getElementById('control-panel')

    // Dragging logic
    let isDragging = false;
    let startY, currentY;

    // Sends user to profile is the user is logged in, otherwise keeps them in the login screen
    state.isLoggedIn = (document.getElementById('userImage') !== null);

    scrollToSection("login", "instant");
    if (state.isLoggedIn === true) {
        setTimeout(() => {
            toggleControlPanelSize(controlPanel);
            togglePowerSwitchPegState()
            scrollToSection("profile");
        }, 1000); // Wait 1 second after browser loaded to perorm animation/change screen;
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
            if (restrictedArea.includes(clickedSwitchName)) {
                // if (state.isLoggedIn == true)
                //     scrollToSection(clickedSwitchName)
                clickedSwitch.classList.toggle("buzz")
                setTimeout(() => {
                    clickedSwitch.classList.toggle("buzz");
                }, 400);
            }
        }
    });

    // Mouse down event for starting the drag
    let pegs = document.querySelectorAll('#control-panel div.switch-component .right-side svg circle')
    pegs.forEach(peg => {
        peg.addEventListener('mousedown', (e) => {
            console.log("mouse down")
            isDragging = true;
            startY = e.clientY;
        })
    })

    // Mouse move event for updating the drag position
    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            console.log("is dragging")
            console.log(e)
            currentY = e.clientY;
            const deltaY = currentY - startY;
            // You can do something with deltaY, e.g., update button's position
            console.log(`Dragging vertically by ${deltaY}px`);
        }
    });

    // Mouse up event for ending the drag
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            console.log('Drag ended');
        }
    });

    })
