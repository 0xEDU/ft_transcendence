import emptyElement from "./tinyDOM/emptyElement.js";

export const state = {
    position: "",
    isLoggedIn: false,
};

export function scrollToSection(sectionName, behaviour = "smooth") {
    if (typeof sectionName === "string") {
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
        console.error("Invalid argument type. Expected a string.");
    }
}

function triggerAnimation(element, animationClass) {
    // Add the animation class to trigger the animation
    element.classList.add(animationClass);

    // Get the computed animation duration from the CSS styles
    const animationDuration =
        parseFloat(getComputedStyle(element).animationDuration) * 1000; // Convert seconds to milliseconds

    // Listen for the 'animationend' event to know when the animation completes
    const animationEndHandler = () => {
        // Remove the animation class after the animation completes
        element.classList.remove(animationClass);

        // Remove the event listener to avoid memory leaks
        element.removeEventListener("animationend", animationEndHandler);
    };

    // Add the 'animationend' event listener
    element.addEventListener("animationend", animationEndHandler);

    // Set a timeout to remove the animation class after the specified duration
    setTimeout(() => {
        // If the animationend event hasn't fired yet, remove the animation class
        element.classList.remove(animationClass);
    }, animationDuration);
}

function toggleControlPanelSize(controlPanel) {
    controlPanel.classList.toggle("shrink");
    controlPanel.querySelectorAll(".switch-component").forEach(
        function (element, index) {
            if (element.getAttribute("name") !== "login") {
                element.classList.toggle("hiding");
                setTimeout(function () {
                    if (element.classList.contains("hiding")) {
                        element.style.display = "none";
                    } else {
                        element.style.display = "block";
                    }
                }, 200 * index);
            }
        },
        { once: true }
    );
}

// Handles main navigation logic of our SPA
document.addEventListener("DOMContentLoaded", function () {
    let controlPanel = document.getElementById("control-panel");
    let pongLogo = document.getElementById("pong-title-svg");

    // Dragging logic
    let isDragging,
        activateFullMotion,
        clicked = false;
    let startY,
        deltaY = 0;
    let selectedPegToDrag;

    // Sends user to profile is the user is logged in, otherwise keeps them in the login screen
    state.isLoggedIn = document.getElementById("userImage") !== null;

    scrollToSection("login", "instant");
    if (state.isLoggedIn === true) {
        // Trigger continuity animation then navigates to Home
        pongLogo.classList.add("minimise");
        pongLogo.classList.add("bounce");
        setTimeout(() => {
            pongLogo.classList.remove("bounce")
            pongLogo.classList.remove("minimise")

            toggleControlPanelSize(controlPanel);
            scrollToSection("profile");
        }, 3000);
    }

    // Setup of navigation via control panel
    // If a peg is merely clicked, it shouldn't scroll anywhere, and an animation is triggered indicating that further action should be performed.
    controlPanel.addEventListener("click", function (event) {
        // Find the closest switch element or null if not found
        let clickedSwitch = event.target.closest(
            "div#control-panel .right-side svg circle"
        );
        let switchName;
        if (clickedSwitch)
            switchName = clickedSwitch
                .closest(".switch-component")
                .getAttribute("name");
        if (clickedSwitch && !deltaY) {
            if (switchName === "login") {
                if (state.isLoggedIn)
                    triggerAnimation(clickedSwitch, "performIncompleteMotion");
                else {
                    triggerAnimation(
                        clickedSwitch,
                        "performReverseIncompleteMotion"
                    );
                }
            } else {
                triggerAnimation(clickedSwitch, "performIncompleteMotion");
            }
        }
        deltaY = 0;
    });

    // Mouse down event for starting the drag
    let pegs = document.querySelectorAll(
        "#control-panel div.switch-component .right-side svg circle"
    );
    pegs.forEach((peg) => {
        peg.addEventListener("mousedown", (e) => {
            clicked = true;
            document.body.style.cursor = "grabbing";
            startY = e.clientY;
            selectedPegToDrag = e.target;
        });
    });

    // Mouse move event for updating the drag position
    document.addEventListener("mousemove", (e) => {
        if (clicked) {
            let currentY = e.clientY;
            deltaY = currentY - startY;
            isDragging = Math.abs(deltaY) > 5;
        }
        if (isDragging) {
            let pegGrooveHeight =
                document.querySelector(
                    "#control-panel div.switch-component .right-side"
                ).offsetHeight / 2;
            let displacementPctg = deltaY / pegGrooveHeight;

            // Decide whether the user mouse movement is enough to activate the peg's action
            const isWithinLoggedInRange =
                state.isLoggedIn &&
                displacementPctg > 0 &&
                displacementPctg <= 0.9;
            const isWithinLoggedOutRange =
                !state.isLoggedIn &&
                displacementPctg >= -0.9 &&
                displacementPctg < 0;
            if (isWithinLoggedInRange || isWithinLoggedOutRange) {
                selectedPegToDrag.setAttribute(
                    "cy",
                    String(
                        (state.isLoggedIn ? 54 : 147) +
                            displacementPctg * (147 - 54)
                    )
                );
                if (displacementPctg < -0.7 || displacementPctg > 0.7)
                    activateFullMotion = true;
                else
                    activateFullMotion = false;
            }
        }
    });

    // Mouse up event for ending the drag -- Other pegs than Login
    document.addEventListener("mouseup", () => {
        let pegName;
        if (selectedPegToDrag)
            pegName = selectedPegToDrag
                .closest(".switch-component")
                .getAttribute("name");
        if (selectedPegToDrag && pegName !== "login" && isDragging) {
            if (activateFullMotion) {
                triggerAnimation(selectedPegToDrag, "performFullMotion");
                setTimeout(() => {
                    scrollToSection(pegName);
                }, 500);
            } else {
                triggerAnimation(selectedPegToDrag, "returnToTop");
            }
            setTimeout(() => {
                selectedPegToDrag.setAttribute("cy", "54");
            }, 300);
        }
        if (selectedPegToDrag && pegName === "login" && isDragging) {
            if (activateFullMotion) {
                if (state.isLoggedIn) {
                    // LOG USER OUT
                    // Do the logging out magic
                    fetch("/auth/logout").then(() => emptyElement("userDiv"));
                    state.isLoggedIn = false;

                    // Trigger animations
                    triggerAnimation(selectedPegToDrag, "returnToBottom");
                    setTimeout(() => {
                        selectedPegToDrag.setAttribute("cy", "147");
                        toggleControlPanelSize(controlPanel);
                        scrollToSection("login");
                    }, 300);
                } else {
                    // Trigger animations
                    triggerAnimation(selectedPegToDrag, "returnToTop");
                    setTimeout(() => {
                        selectedPegToDrag.setAttribute("cy", "54");
                    }, 300);

                    pongLogo.classList.add("minimise")
                    pongLogo.classList.add("bounce")
                    setTimeout(() => {
                        // Do the authentication magic -- opens the link to the intra login page in the current window
                        window.location.href = document.getElementById(
                            "intraLoginRedirectUrl"
                        ).textContent;
                    }, 2000);

                }
            } else {
                if (state.isLoggedIn) {
                    triggerAnimation(selectedPegToDrag, "returnToTop");
                    setTimeout(() => {
                        selectedPegToDrag.setAttribute("cy", "54");
                    }, 300);
                } else {
                    triggerAnimation(selectedPegToDrag, "returnToBottom");
                    setTimeout(() => {
                        selectedPegToDrag.setAttribute("cy", "147");
                    }, 300);
                }
            }
        }

        // General reset
        activateFullMotion = false;
        clicked = false;
        isDragging = false;
        document.body.style.cursor = "auto";
    });
});
