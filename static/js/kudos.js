document.addEventListener('DOMContentLoaded', function () {
	const emojiCarousel = document.getElementById('emojiCarousel');
	const nameCarousel = document.getElementById('nameCarousel');

	const emojis = ['❤️', '🤖', '🧋', '💛', '🤌🏾', '🧡', '🩸', '🦾', '🥵'];
	const people = [
		{ name: 'etachott', image: 'static/images/etachott.jpeg' },
		{ name: 'feralves', image: 'static/images/feralves.jpeg' },
		{ name: 'guribeir', image: 'static/images/guribeir.png' },
		{ name: 'roaraujo', image: 'static/images/roaraujo.jpeg' },
		{ name: 'viferrei', image: 'static/images/viferrei.jpeg' },
	];

	let pickedEmojisHistory = [];
	let pickedNamesHistory = [];
	let currentEmojiIndex = 0;
	let currentNameIndex = 0;
	let lastPickedEmojiIndex = 1;
	let lastPickedNameIndex = 1;

	function updateEmojiCarousel() {
		let index;

		// Picks a previously unpicked index
		do {
			index = Math.floor(Math.random() * emojis.length);
		} while (pickedEmojisHistory.includes(index) || (pickedEmojisHistory.length === 0 && index === lastPickedEmojiIndex));
		currentEmojiIndex = index

		// Updates history array and resets it if needed
		pickedEmojisHistory.push(index);
		if (pickedEmojisHistory.length === emojis.length) {
			lastPickedEmojiIndex = currentEmojiIndex
			pickedEmojisHistory = []
		}

		// Updates element on screen
		const emoji = emojis[currentEmojiIndex];
		emojiCarousel.innerHTML = `<div class="carousel-item active">MADE WITH { ${emoji} } </div>`;
	}

	function updateNameCarousel() {
		let index

		// Picks a previously unpicked person
		do {
			index = Math.floor(Math.random() * people.length);
		} while (pickedNamesHistory.includes(index) || (pickedNamesHistory.length === 0 && index === lastPickedNameIndex))
		currentNameIndex = index

		// Updates history array and resets it if needed
		pickedNamesHistory.push(index);
		if (pickedNamesHistory.length === people.length) {
			lastPickedNameIndex = currentNameIndex
			pickedNamesHistory = []
		}

		// Updates element on screen
		const person = people[currentNameIndex];
		nameCarousel.innerHTML = `<div class="carousel-item active">BY { <span class="name">${person.name}</span> <img src="${person.image}" alt="${person.name}'s picture"> }</div>`;
	}

	updateEmojiCarousel();
	updateNameCarousel();

	setInterval(updateEmojiCarousel, 2000);
	setInterval(updateNameCarousel, 2000);
});
