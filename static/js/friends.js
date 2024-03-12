import { scrollToSection } from "./control-panel.js";
import hasElement from "./tinyDOM/hasElement.js";
import emptyElement from "./tinyDOM/emptyElement.js";
import swapInnerHTMLOfElement from "./tinyDOM/swapInnerHTMLOfElement.js";
import insertElement from "./tinyDOM/insertElement.js";

document.getElementById('addSign').addEventListener('click', function() {
	emptyElement('friendsList');
    fetchFriends();
	scrollToSection('findFriends');
});


function getCsrfToken() {
	return document.getElementsByName('csrfmiddlewaretoken')[0].value;
}


document.addEventListener('DOMContentLoaded', function() {
    var searchForm = document.getElementById('userSearchForm');
    
    searchForm.addEventListener('submit', function(event) {
        event.preventDefault();
        var searchTerm = document.getElementById('searchField').value;
        
        if (hasElement('resultsContainer','userNotFoundDel')){
            emptyElement('resultsContainer');
        }
        
        fetch(`/search-user/?search=${encodeURIComponent(searchTerm)}`)
            .then(response => response.json())
            .then(userData => {
                if (userData.error) {
                    swapInnerHTMLOfElement('resultsContainer', '<p id="userNotFoundDel" class="text-danger">User not found!</p>');
					displayUserNotFound();
                } else {
                    checkFriendshipAndShowModal(userData);
                }
            })
            .catch(error => console.error('Error:', error));
    });
});


function checkFriendshipAndShowModal(userData) {
    fetch(`/check-friendship-status/?user_id=${userData.id}`)
        .then(response => response.json())
        .then(data => {
            if (data.status === 'not_friends') {
				data['id'] = userData.id;
                showAddFriendModal(userData, data);
            } else if (data.status === 'pending') {
                if (data.isRequester) {
                    showPendingFriendModal(userData, data);
                } else {
                    showRemoveFriendModal(userData, data);
                }
            } else if (data.status === 'accepted') {
                showRemoveFriendModal(userData, data);
            }
        })
        .catch(error => console.error('Error:', error));
}


function showAddFriendModal(userData, data) {
    document.getElementById('modalUserNameAdd').innerText = userData.displayName;
    document.getElementById('addFriendButton').onclick = function() {
        sendFriendRequest(data.id);
    };

    const addFriendModal = new bootstrap.Modal(document.getElementById('addFriendModal'));
    addFriendModal.show();
}


function showPendingFriendModal(userData, data) {
	insertElement('modalUserNamePending', userData.displayName);
    document.getElementById('pendingFriendButton').onclick = function() {
        cancelFriendRequest(data.id);
    };

    const pendingFriendModal = new bootstrap.Modal(document.getElementById('pendingFriendModal'));
    pendingFriendModal.show();
}

function showRemoveFriendModal(userData, data) {
    document.getElementById('modalUserNameRemove').innerText = userData.displayName;
    document.getElementById('removeFriendButton').onclick = function() {
        removeFriend(data.id);
    };

    const removeFriendModal = new bootstrap.Modal(document.getElementById('removeFriendModal'));
    removeFriendModal.show();
}


function cancelFriendRequest(friendshipId) {
	const pendingFriendModal = bootstrap.Modal.getInstance(document.getElementById('pendingFriendModal'));
    fetch('/cancel-friend-request/', {
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
		pendingFriendModal.hide();
        emptyElement('friendsList');
        fetchFriends();
    })
    .catch(error => console.error('Error:', error));
}


function fetchFriends() {
    fetch('/friends-list/')
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Assuming the key in the JSON response containing the HTML is 'html'
        document.getElementById('friendsList').innerHTML = data.html;
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
            throw new Error(body.error);
        }
        if (hasElement("addFriendModal", "errorMessage")) {
            emptyElement("errorMessage");
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

function removeFriend(friendshipId) {
	const removeFriendModal = bootstrap.Modal.getInstance(document.getElementById('removeFriendModal'));
    fetch('/remove-friend/', {
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
		removeFriendModal.hide();
		emptyElement('friendsList');
        fetchFriends();
    })
    .catch(error => console.error('Error:', error));
}