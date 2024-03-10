import { scrollToSection } from "./control-panel.js";
import hasElement from "./tinyDOM/hasElement.js";
import emptyElement from "./tinyDOM/emptyElement.js";
import swapInnerHTMLOfElement from "./tinyDOM/swapInnerHTMLOfElement.js";
import insertElement from "./tinyDOM/insertElement.js";

document.getElementById('addSign').addEventListener('click', function() {
  scrollToSection('findFriends');
});


function getCsrfToken() {
	return document.getElementsByName('csrfmiddlewaretoken')[0].value;
}


document.addEventListener('DOMContentLoaded', function() {
	var searchForm = document.getElementById('userSearchForm');
	
	fetchFriends();
	searchForm.addEventListener('submit', function(event) {
		var searchTerm = document.getElementById('searchField').value;
	event.preventDefault();
	if (hasElement('resultsContainer','userNotFoundDel')){
		emptyElement('resultsContainer');
	}
	fetch(`/search-user/?search=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(userData => {
                if (userData.error) {
                    swapInnerHTMLOfElement('resultsContainer', '<p id="userNotFoundDel" class="text-danger">User not found!</p>');
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

    const addFriendModal = new bootstrap.Modal(document.getElementById('addFriendModal'));
    addFriendModal.show();
}


function fetchFriends() {
	fetch('/friends-list/')
	.then(response => {
		if (!response.ok) {
		throw new Error('Network response was not ok ' + response.statusText);
		}
		return response.json();
	})
	.then(friendsData => {
		friendsData.forEach(friend => {
		const friendCardHtml = createFriendCardHtml(friend);
		insertElement('friendsList', friendCardHtml);
		});
	})
	.catch(error => console.error('There has been a problem with your fetch operation:', error));
}

function createFriendCardHtml(friend) {
	// Adjust the class and button text based on friendship status
	const cardClass = friend.status === 'pending' ? 'friendCard-pending' : 'friendCard';
	const buttonText = friend.status === 'pending' && !friend.isRequester ? 'Accept' : 'View Profile';
	const buttonClass = friend.status === 'pending' && !friend.isRequester ? 'acceptFriendshipButton' : 'viewProfileButton';
	const buttonColor = friend.status === 'pending' ? 'btn-outline-secondary' : 'btn-outline-light';
	const friendshipStatus = friend.status === 'pending' ? '(Pending friendship request)' : '';

	// Return the HTML string for the friend card
	return `
    <div class="${cardClass} d-flex">
        <img src="${friend.profilePictureUrl}" alt="Profile Picture" class="imgProfile">
        <div class="friendCard d-flex align-items-center justify-content-between">
            <div></div>
            <div class="friendName">${friend.displayName} ${friendshipStatus}</div>
            <button type="button" class="btn ${buttonColor} ${buttonClass} ml-auto" 
                    data-friendship-id="${friend.friendshipId}" data-friend-id="${friend.id}">${buttonText}</button>
        </div>
    </div>
    `;
}

document.getElementById('friendsList').addEventListener('click', function(event) {
    if (event.target.matches('.acceptFriendshipButton')) {
        const friendshipId = event.target.getAttribute('data-friendship-id');
        acceptFriendship(friendshipId);
    } else if (event.target.matches('.viewProfileButton')) {
        const friendId = event.target.getAttribute('data-friend-id');
        viewProfile(friendId);
    }
});

function acceptFriendship(friendshipId) {
    fetch('/accept-friendship/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ 'friendshipId': friendshipId }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
		emptyElement('friendsList');
        fetchFriends();
    })
    .catch(error => console.error('Error:', error));
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
    .then(response => response.json().then(data => ({ status: response.status, body: data })))
    .then(({ status, body }) => {
        if (status === 409) {
            throw new Error(body.error); // Use the customized error message from the server
        }
        addFriendModal.hide();
        emptyElement('friendsList');
        fetchFriends();
    })
    .catch(error => {
        if (hasElement("addFriendModal", "errorMessage")) {
            emptyElement("errorMessage");
        }
        swapInnerHTMLOfElement('errorMessage', `<p id="userAlreadyFriend" class="text-danger">${error.message}</p>`);
    });
}