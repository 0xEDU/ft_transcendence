import hasSiblingElement from "./tinyDOM/hasSiblingElement.js"
import appendElement from "./tinyDOM/appendElement.js"
import deleteElement from "./tinyDOM/deleteElement.js"

const profilePictureEditionModal = new bootstrap.Modal(document.getElementById("profilePictureEditionModal"));

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

document.getElementById("profilePictureEditionForm").addEventListener("submit", function (event) {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Collect form data
    const formData = new FormData(event.target);

    fetch('/auth/user/profile-picture', {
        method: 'POST',
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

                    return ;
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