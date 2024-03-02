import hasSiblingElement from "./tinyDOM/hasSiblingElement.js"
import appendElement from "./tinyDOM/appendElement.js"
import deleteElement from "./tinyDOM/deleteElement.js"


// ------------------------------------------------- Profile Picture Edition ---

let profilePictureEditionModal = new bootstrap.Modal(document.getElementById('profilePictureEditionModal'));

// Update preview with selected photo
document.getElementById('profilePicEditionInput').addEventListener('change', function (event) {
    // When the user selects a new picture from the file system, 
    let file = event.target.files[0];
    let reader = new FileReader();
    let currentProfilePicDiv = document.getElementById('currentProfilePicture');
    let oldPicUrl = currentProfilePicDiv.style.backgroundImage;

    if (file && file.type.startsWith('image/')) {
        // Check if the selected file is in a common image format (JPG, PNG)
        if (file.type === 'image/jpeg' || file.type === 'image/png') {
            reader.onload = function (event) {
                // Update preview with newly selected photo
                currentProfilePicDiv.style.backgroundImage = `url(${event.target.result})`
            };

            reader.readAsDataURL(file);
        } else {
            // Display an error message if the file format is not supported
            alert('Please select a file in JPG or PNG format.');
            // Clear the file input to prevent submission
            currentProfilePicDiv.style.backgroundImage = oldPicUrl;
            event.target.value = '';
        }
    } else {
        // Display an error message if the selected file is not an image
        alert('Please select an image file.');
        // Clear the file input to prevent submission
        currentProfilePicDiv.style.backgroundImage = oldPicUrl;
        event.target.value = '';
    }
});

// Profile picture form submission
document.getElementById("profilePictureEditionForm").addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);

    // Send request
    const url = event.target.getAttribute('action');
    const method = event.target.getAttribute('method');

    fetch(url, {
        method: method,
        body: formData
    })
        .then(response => {
            // Check if the response status is 200 OK
            if (response.ok) {
                return response.json();
            } else if (response.status === 400) {
                // Handle the response as HTML (rendered template)
                return response.text().then(html => {
                    // Work with the HTML content here
                    const trimmedHtml = html.replace(/(\r\n|\n|\r){2,}/gm, '\n').trim()
                    if (!hasSiblingElement("profilePicEditionInput", trimmedHtml))
                        appendElement("profilePicEditionInput", trimmedHtml)
                    return;
                });
            } else {
                // Handle other response statuses (e.g., server errors)
                throw new Error('Server error: ' + response.statusText);
            }
        })
        .then(data => {
            if (data) {
                // Update the profile picture in the browser
                let userImage = document.getElementById("userImage")
                userImage.style.backgroundImage = `url(${data.new_pfp_url})`;

                // Reset input field
                document.getElementById('profilePicEditionInput').value = ''
                deleteElement("formErrMsg");

                // Close the Bootstrap modal
                profilePictureEditionModal.hide();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});

// ------------------------------------------------- Display Name Edition ------
// Get the alternating elements
let paragraph = document.querySelector('#userDisplayName');
let form = document.getElementById('userDisplayNameForm');

// Add click event listener to display name button
document.querySelector('#userDisplayName > button').addEventListener('click', function () {
    let inputField = document.querySelector('#userDisplayNameForm input[type="text"]');

    // Toggle the 'd-none' class to alternating elements
    paragraph.classList.add('d-none');
    form.classList.remove('d-none');

    // Focus input field
    inputField.focus();
    inputField.setSelectionRange(inputField.value.length, inputField.value.length);
});

// Display name form submission
document.getElementById("userDisplayNameForm").addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);

    // Send request
    const url = event.target.getAttribute('action');
    const method = event.target.getAttribute('method');

    fetch(url, {
        method: method,
        body: formData
    })
        .then(response => {
            // Check if the response status is 200 OK
            if (response.ok) {
                return response.json();
            } else if (response.status === 400) {
                // Handle the response as HTML (rendered template)
                return response.text().then(html => {
                    // Work with the HTML content here
                    const trimmedHtml = html.replace(/(\r\n|\n|\r){2,}/gm, '\n').trim()
                    if (!hasSiblingElement("displayNameEditionInput", trimmedHtml))
                        appendElement("displayNameEditionInput", trimmedHtml)
                    return;
                });
            } else {
                // Handle other response statuses (e.g., server errors)
                throw new Error('Server error: ' + response.statusText);
            }
        })
        .then(data => {
            if (data) {
                // Update the display name in the browser
                let displayName = document.querySelector("#userDisplayName span")
                displayName.textContent = data.new_display_name;

                // Reset input field
                document.querySelector('#userDisplayNameForm input[name="display-name"]').value = data.new_display_name
                deleteElement("formErrMsg");

                // Toggle the 'd-none' class to alternating elements
                paragraph.classList.remove('d-none');
                form.classList.add('d-none');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});