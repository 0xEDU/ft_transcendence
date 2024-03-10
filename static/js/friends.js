import { scrollToSection } from "./control-panel.js";
import appendElement from "./tinyDOM/appendElement.js";
import deleteElement from "./tinyDOM/deleteElement.js";
import hasElement from "./tinyDOM/hasElement.js";
import emptyElement from "./tinyDOM/emptyElement.js";
import insertInElement from "./tinyDOM/insertInElement.js";

document.getElementById('addSign').addEventListener('click', function() {
  scrollToSection('findFriends');
});

document.addEventListener('DOMContentLoaded', function() {
	var searchForm = document.getElementById('userSearchForm');

	searchForm.addEventListener('submit', function(event) {
	event.preventDefault();
	var searchTerm = document.getElementById('searchField').value;

	fetch(`/search-user/?search=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(userData => {
                if (userData.error) {
                    displayUserNotFound();
                } else {
					if (hasElement("addFriendModal", "errorMessage")){
						emptyElement("errorMessage");
					}
                    showAddFriendModal(userData);
                }
            })
            .catch(error => console.error('Error:', error));
    });
});

function showAddFriendModal(userData) {
    document.getElementById('modalUserName').innerText = userData.displayName;
    document.getElementById('addFriendButton').onclick = function() {
        sendFriendRequest(userData.id);
    };

    // Show the modal
    const addFriendModal = new bootstrap.Modal(document.getElementById('addFriendModal'));
    addFriendModal.show();
}

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

// function addFriend(friend) {
// 	const htmlString = createFriendCardHtml(friend);
// 	appendElement('friendsList', htmlString);
// }


function displayUserNotFound() {
	appendElement('resultsContainer', '<p id="userNotFoundDel" class="text-danger">User not found!</p>');
	
	// Remove the error message after 1 second
	setTimeout(() => {
	deleteElement('userNotFoundDel');
	}, 1000);
}

function fetchFriends() {
	// Use the endpoint you've set up in your Django urls.py
	fetch('/friends-list/')
	.then(response => {
		if (!response.ok) {
		throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.then(friendsData => {
		// Call a function to create and insert the friend cards into the DOM
		friendsData.forEach(friend => {
		const friendCardHtml = createFriendCardHtml(friend);
		document.getElementById('friendsList').innerHTML += friendCardHtml;
		});
	})
	.catch(error => console.error('There has been a problem with your fetch operation:', error));
}

function createFriendCardHtml(friend) {
	// Adjust the class and button text based on friendship status
	const cardClass = friend.status === 'pending' && !friend.isRequester ? 'friendCard-pending' : 'friendCard';
	const buttonText = friend.status === 'pending' ? 'Accept' : 'View Profile';
	const buttonAction = friend.status === 'pending' ? `acceptFriendship('${friend.id}');` : `viewProfile('${friend.id}');`;
	
	// Return the HTML string for the friend card
	return `
	<div class="${cardClass}">
		<img src="${friend.profilePictureUrl}" alt="Profile Picture" class="friend-img">
		<div class="friend-info">
		<h3>${friend.displayName}</h3>
		<button onclick="${buttonAction}" class="friend-btn">${buttonText}</button>
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
	return document.getElementsByName('csrfmiddlewaretoken')[0].value;
}


function sendFriendRequest(friendId) {
	const addFriendModal = bootstrap.Modal.getInstance(document.getElementById('addFriendModal'));
	fetch('/create-friendship/', {
	method: 'POST',
	headers: {
		'Content-Type': 'application/json',
		'X-CSRFToken': getCsrfToken(),
	},
	body: JSON.stringify({ 'accepter_id': friendId }),
	})
	.then(response => {
		if (response.status == 406) {
			throw new Error('User already exists')
		}
		return response.json()
	})
	.then(data => {
	addFriendModal.hide();
	})
	.catch(error => {
		if (hasElement("addFriendModal", "errorMessage")){
			emptyElement("errorMessage");
		}
		insertInElement('errorMessage', '<p id="userAlredyFriend" class="text-danger">Invitation alredy sent!</p>');
	});
}