import { scrollToSection } from "./control-panel.js";
import appendElement from "./tinyDOM/appendElement.js";
import deleteElement from "./tinyDOM/deleteElement.js";

document.getElementById('addSign').addEventListener('click', function() {
  scrollToSection('findFriends');
});

document.addEventListener('DOMContentLoaded', function() {
	fetchFriends();
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
// function createFriendCardHtml(friend) {
//     return `
//     <div class="friendCardHtml d-flex">
//         <img src="${friend.profilePictureUrl}" alt="Profile Picture" class="imgProfile">
//         <div class="friendCard d-flex align-items-center justify-content-between">
//             <div></div>
//             <div class="friendName">${friend.displayName}</div>
//             <button type="button" class="btn btn-primary ml-auto" onclick="viewProfile('${friend.id}')">view profile</button>
//         </div>
//     </div>
//     `;
// }

function addFriend(friend) {
	const htmlString = createFriendCardHtml(friend);
	appendElement('friendsList', htmlString);
}


function displayUserNotFound() {
	appendElement('resultsContainer', '<p id="userNotFoundDel" class="text-danger">User not found!</p>');
	
	// Remove the error message after 1 second
	setTimeout(() => {
	deleteElement('userNotFoundDel');
	}, 1000);
}

function fetchFriends() {
	fetch('/friends-list/')
	.then(response => response.json())
	.then(data => {
	data.forEach(friend => {
		const friendCardHtml = createFriendCardHtml(friend);
		document.getElementById('friendsList').innerHTML += friendCardHtml;
	});
	});
}

function createFriendCardHtml(friend) {
	const btnClass = friend.status === 'pending' ? 'btn-warning' : 'btn-primary';
	const btnText = friend.status === 'pending' ? 'Accept' : 'View Profile';
	const btnOnClick = friend.status === 'pending' ? `acceptFriend('${friend.friendshipId}')` : `viewProfile('${friend.id}')`;
	
	return `
	<div class="friendCardHtml d-flex ${friend.status}">
		<img src="${friend.profilePictureUrl}" alt="Profile Picture" class="imgProfile">
		<div class="friendCard d-flex align-items-center justify-content-between">
			<div class="friendName">${friend.displayName}</div>
			<button type="button" class="btn ${btnClass} ml-auto" onclick="${btnOnClick}">${btnText}</button>
		</div>
	</div>
	`;
}

function acceptFriend(friendshipId) {
	fetch(`/accept-friendship-endpoint/`, {
	  method: 'POST',
	  body: JSON.stringify({ 'friendshipId': friendshipId }),
	  headers: {
		'Content-Type': 'application/json',
		'X-CSRFToken': getCsrfToken() // You need to handle CSRF token
	  }
	})
	.then(response => response.json())
	.then(data => {
	  // Update the card for the accepted friend...
	});
  }
  
  // Utility function to get CSRF token from cookie
  function getCsrfToken() {
	return document.cookie.split(';').find(c => c.trim().startsWith('csrftoken=')).split('=')[1];
  }

  