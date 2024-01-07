import emptyElement from "./tinyDOM/emptyElement.js"

const state = {
    position: "",
    isLoggedIn: false,
};

function scrollToSection(sectionName, behaviour = "smooth") {
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

// Handles main navigation logic of our SPA
document.addEventListener('DOMContentLoaded', function () {
    // Elements selection
    var publicArea = ["login"]
    var restrictedArea = ["profile", "stats", "lobby", "kudos"]

    let controlPanel = document.getElementById('control-panel')

    // Decide the initial positioning of viewport on first load of the webpage
    state.isLoggedIn = (document.getElementById('userImage') !== null);
    const defaultScreen = (state.isLoggedIn) ? "profile" : "login";
    if (state.isLoggedIn === true) {
        console.log('TODO: faz o toggLes');
    }
    scrollToSection(defaultScreen, "instant");

    // Setup of navigation via control panel
    controlPanel.addEventListener('click', function(event) {
        // Find the closest switch element or null if not found
        var clickedSwitch = event.target.closest('.switch-component');

        if (clickedSwitch) {
            // Extract the switch name from the data attribute or any other identifier
            var clickedSwitchName = clickedSwitch.getAttribute('name');

            if (clickedSwitchName == "login") {
                if (state.isLoggedIn == false) {
                    // Do the authentication magic
                    // opens the link to the intra login page in the current window
                    window.location.href = document.getElementById('intraLoginRedirectUrl').textContent;
                }
                else {
                    // Do the logging out magic
                    fetch("/auth/logout")
                        .then(() => emptyElement('userDiv'));
                    state.isLoggedIn = false;
                    // controlPanel.classList.toggle('shrink');
                    controlPanel.querySelectorAll('.switch-component').forEach(function (element) {
                        if (element.getAttribute('name') !== 'login')
                            element.classList.toggle('hidden');
                    })
                    scrollToSection("login")
                }
            }
            if (restrictedArea.includes(clickedSwitchName)) {
                if (state.isLoggedIn == true)
                    scrollToSection(clickedSwitchName)
            }
        }
    });
})
