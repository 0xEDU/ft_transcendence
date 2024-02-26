document.getElementById('profilePicEditionInput').addEventListener('change', function(event) {
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
        var innermostDiv = document.getElementById('currentProfilePicture');
        innermostDiv.style.backgroundImage = `url(${event.target.result})`
    };

    reader.readAsDataURL(file);
});