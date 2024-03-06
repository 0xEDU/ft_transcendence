import { scrollToSection } from "./control-panel.js";
import appendElement from "./tinyDOM/appendElement.js";

document.getElementById('addSign').addEventListener('click', function() {
  scrollToSection('findFriends');
});

document.addEventListener('DOMContentLoaded', function() {
	var searchForm = document.getElementById('userSearchForm');

	searchForm.addEventListener('submit', function(event) {
	event.preventDefault();
	var searchTerm = document.getElementById('searchField').value;

	// Make sure to replace '/search-user/' with the correct URL to your Django search view
	fetch(`/search-user/?search=${encodeURIComponent(searchTerm)}`)
		.then(function(response) {
			if (response.ok) {
				return response.json();
		} else if (response.status === 404) {
			// Show the user not found message
			displayUserNotFound();
			return Promise.reject('User not found'); // Reject the promise chain
		} else {
			return Promise.reject('An error occurred'); // Reject the promise chain
		}
		})
		.then(function(userData) {
			addFriend(userData);
		})
		.catch(function(error) {
		// If we reach this point, there was either a network error or a 404 error
		console.error('Error:', error);
		});
	});
});

// Function to create a friend card HTML
function createFriendCardHtml(friend) {
	return `
	<div class="d-flex">
		<img src="${friend.profilePictureUrl}" alt="Profile Picture" class="imgProfile">
		<div class="friendCard d-flex align-items-center justify-content-between">
			<div></div>
			<div class="friendName">${friend.displayName}</div>
			<button type="button" class="btn btn-primary ml-auto" onclick="viewProfile('${friend.id}')">view profile</button>
		</div>
	</div>
	`;
}

function addFriend(friend) {
	const htmlString = createFriendCardHtml(friend);
	appendElement('friendsList', htmlString);
}


function displayUserNotFound() {
	var resultsContainer = document.getElementById('resultsContainer');
	resultsContainer.innerHTML = '<p class="text-danger">User not found!</p>'; // Replace the content with the error message
	
	// Remove the error message after 1 second
	setTimeout(() => {
	resultsContainer.innerHTML = ''; // Clear the error message
	}, 1000);
}

  
  