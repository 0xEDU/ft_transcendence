import swapInnerHTMLOfElement from "./tinyDOM/swapInnerHTMLOfElement.js";

document.addEventListener('DOMContentLoaded', () => {
	fetch('/get-friends/')
	.then(response => response.json())
	.then(data => {
		let friendsHTML = '';
		data.forEach(friend => {
		friendsHTML += `
			<img class="matesImages me-3 mt-3"
				src="${friend.image_url}" 
				alt="${friend.username}'s Photo" 
				title="${friend.username}">
		`;
		});

		swapInnerHTMLOfElement('friendsContainer', friendsHTML);
	})
	.catch(error => {
		console.error('Error loading friends:', error);
	});
});