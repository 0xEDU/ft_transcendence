document.addEventListener('DOMContentLoaded', function() {
	const emojiCarousel = document.getElementById('emojiCarousel');
	const nameCarousel = document.getElementById('nameCarousel');
  
	const emojis = ['❤️', '🤖', '🧋','💛', '🤌🏾', '🧡', '🦾', '🥵'];
	const people = [
		{ name: 'etachott', image: 'static/images/etachott.jpeg' },
		{ name: 'feralves', image: 'static/images/feralves.jpeg' },
		{ name: 'guribeir', image: 'static/images/guribeir.png' },
		{ name: 'roaraujo', image: 'static/images/roaraujo.jpeg' },
		{ name: 'viferrei', image: 'static/images/viferrei.jpeg' },
	];
  
	let currentEmojiIndex = 0;
	let currentNameIndex = 0;

	function updateEmojiCarousel() {
		const emoji = emojis[currentEmojiIndex];
		emojiCarousel.innerHTML = `<div class="carousel-item active">MADE WITH { ${emoji} } </div>`;
		currentEmojiIndex = (currentEmojiIndex + 1) % emojis.length;
	}

	function updateNameCarousel() {
		const person = people[currentNameIndex];
		nameCarousel.innerHTML = `<div class="carousel-item active">BY { <span class="name">${person.name}</span> <img src="${person.image}" alt="${person.name}'s picture"> }</div>`;
		currentNameIndex = (currentNameIndex + 1) % people.length;
	}

	updateEmojiCarousel();
	updateNameCarousel();

	setInterval(updateEmojiCarousel, 2000);
	setInterval(updateNameCarousel, 2000);
});
