const state = {
    position: "login",
    isLoggedIn: false,
};

document.addEventListener('DOMContentLoaded', function() {
    let loginSection = document.getElementById('login');
    let profileSection = document.getElementById('profile');
    let statsSection = document.getElementById('stats');
    let lobbySection = document.getElementById('lobby');
    let kudosSection = document.getElementById('kudos');

    // Initial positioning of viewport
    window.scrollTo({
        top: loginSection.offsetTop,
        behavior: 'smooth'
    });

    // Configure behaviour of panel switches
    let loginSwitch = document.getElementById('switch-component-login');
    loginSwitch.addEventListener('click', function() {
        // Trigger button animation
        let currentY = parseFloat(loginSwitch.getAttribute('cy'));
        let newY = (currentY === 147.54) ? 54.54 : 147.54;
        loginSwitch.setAttribute('cy', newY.toString());

        // Decides where to move the board to
        if (state.position == "login") {
            window.scrollTo({
                top: profileSection.offsetTop,
                behavior: 'smooth'
            });
            state.position = "profile";
        } else {
            window.scrollTo({
                top: loginSection.offsetTop,
                behavior: 'smooth'
            });
            state.position = "login";
            state.isLoggedIn = false;
        }
    });

    let profileSwitch = document.getElementById('switch-component-profile');
    profileSwitch.addEventListener('click', function() {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: profileSection.offsetTop,
            behavior: 'smooth'
        });
        state.position = "profile";
    });

    let statsSwitch = document.getElementById('switch-component-stats');
    statsSwitch.addEventListener('click', function() {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: statsSection.offsetTop,
            behavior: 'smooth'
        });
        state.position = "stats";
    });

    let lobbySwitch = document.getElementById('switch-component-lobby');
    lobbySwitch.addEventListener('click', function() {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: lobbySection.offsetTop,
            behavior: 'smooth'
        });
        state.position = "lobby";
    });

    let kudosSwitch = document.getElementById('switch-component-kudos');
    kudosSwitch.addEventListener('click', function() {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: kudosSection.offsetTop,
            behavior: 'smooth'
        });
        state.position = "kudos";
    });
});

