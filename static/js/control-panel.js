const state = {
    position: "login",
    isLoggedIn: false,
};

function scrollToSection(sectionName, behaviour) {
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

document.addEventListener('DOMContentLoaded', function() {
    // Elements selection
    var publicArea = ["login"]
    var restrictedArea = ["profile", "stats", "lobby", "kudos"]

    let controlPanel = document.getElementById('control-panel')

    // Initial positioning of viewport
    scrollToSection("login");

    // Setup of navigation via control panel
    controlPanel.addEventListener('click', function(event) {
        // Find the closest switch element or null if not found
        var clickedSwitch = event.target.closest('.switch-component');

        if (clickedSwitch) {
            // Extract the switch name from the data attribute or any other identifier
            var clickedSwitchName = clickedSwitch.getAttribute('name');

            if (publicArea.includes(clickedSwitchName)) {
                if (state.isLoggedIn == false) {
                    // Do the authentication magic
                    state.isLoggedIn = true;
                    scrollToSection("profile")
                }
                else {
                    // Do the logging out magic
                    state.isLoggedIn = false;
                    scrollToSection("login")
                }
            }
            if (restrictedArea.includes(clickedSwitchName)) {
                if (state.isLoggedIn == true)
                    scrollToSection(clickedSwitchName)
            }
        }
    });
});

