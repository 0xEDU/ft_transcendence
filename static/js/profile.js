document.getElementById('profilePicEditionInput').addEventListener('change', function (event) {
    // When the user selects a new picture from the file system, 
    let file = event.target.files[0];
    let reader = new FileReader();
    let currentProfilePicDiv = document.getElementById('currentProfilePicture');
    let oldPicUrl = currentProfilePicDiv.style.backgroundImage;
    console.log(oldPicUrl)

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

