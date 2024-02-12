import emptyElement from "./tinyDOM/emptyElement.js"

const state = {
    position: "",
    isLoggedIn: false,
};

export default function scrollToSection(sectionName, behaviour = "smooth") {
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
    let togglePeg = document.querySelector('div.switch-component[name="login"]')
    let circle = togglePeg.querySelector("div#control-panel .right-side svg circle")

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

    // Sends user to profile is the user is logged in, otherwise keeps them in the login screen
    state.isLoggedIn = (document.getElementById('userImage') !== null);

    scrollToSection("login", "instant");
    if (state.isLoggedIn === true) {
        toggleControlPanelSize(controlPanel);
        togglePowerSwitchPegState()
        scrollToSection("profile");
    }

    // Setup of navigation via control panel
    controlPanel.addEventListener('click', function(event) {
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
                if (state.isLoggedIn == true)
                    scrollToSection(clickedSwitchName)
            }
        }
    });

    // Reposition viewport to the current board position when windows is resized:
    window.addEventListener('resize', function() {
        scrollToSection(state.position, "instant")
    });
})
