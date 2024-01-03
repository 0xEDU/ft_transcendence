import emptyElement from "./tinyDOM/emptyElement.js"

const state = {
    position: "",
    isLoggedIn: false,
};

document.addEventListener('DOMContentLoaded', function () {
    let loginSection = document.getElementById('login');
    let profileSection = document.getElementById('profile');
    let statsSection = document.getElementById('stats');
    let lobbySection = document.getElementById('lobby');
    let kudosSection = document.getElementById('kudos');

    // Decide the initial positioning of viewport
    state.isLoggedIn = (document.getElementById('userImage') !== null);
    state.position = (state.isLoggedIn) ? "profile" : "login";
    const defaultScreen = (state.isLoggedIn) ? profileSection : loginSection;
    window.scrollTo({
        top: defaultScreen.offsetTop,
        left: defaultScreen.offsetLeft,
        behavior: 'smooth'
    });

    // Configure behaviour of panel switches
    let loginSwitch = document.getElementById('switch-component-login');
    loginSwitch.addEventListener('click', function () {

        // Trigger button animation
        let currentY = parseFloat(loginSwitch.getAttribute('cy'));
        let newY = (currentY === 147.54) ? 54.54 : 147.54;
        loginSwitch.setAttribute('cy', newY.toString());

        // Decides where to move the board to
        if (state.position == "login") {
            // Login/Intra authentication
            window.location.href = document.getElementById('redirectUrl').textContent;
        } else {
            window.scrollTo({
                top: loginSection.offsetTop,
                left: loginSection.offsetLeft,
                behavior: 'smooth'
            });
            state.position = "login";
            state.isLoggedIn = false;
            fetch("/auth/logout")
                .then(() => emptyElement('userDiv'));
        }
    });

    let profileSwitch = document.getElementById('switch-component-profile');
    profileSwitch.addEventListener('click', function () {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: profileSection.offsetTop,
            left: profileSection.offsetLeft,
            behavior: 'smooth'
        });
        state.position = "profile";
    });

    let statsSwitch = document.getElementById('switch-component-stats');
    statsSwitch.addEventListener('click', function () {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: statsSection.offsetTop,
            left: statsSection.offsetLeft,
            behavior: 'smooth'
        });
        state.position = "stats";
    });

    let lobbySwitch = document.getElementById('switch-component-lobby');
    lobbySwitch.addEventListener('click', function () {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: lobbySection.offsetTop,
            left: lobbySection.offsetLeft,
            behavior: 'smooth'
        });
        state.position = "lobby";
    });

    let kudosSwitch = document.getElementById('switch-component-kudos');
    kudosSwitch.addEventListener('click', function () {
        // Trigger button animation

        // Decides where to move the board to
        window.scrollTo({
            top: kudosSection.offsetTop,
            left: kudosSection.offsetLeft,
            behavior: 'smooth'
        });
        state.position = "kudos";
    });
});

