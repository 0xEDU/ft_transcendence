import insertInElement from "./tinyDOM/insertInElement.js";
import emptyElement from "./tinyDOM/emptyElement.js";

let currentStatPage = "matchesHistoryText"
const statPages = {
	"matchesHistoryText": "/stats/matches-history",
	"tournamentsText": "/stats/tournaments",
	"userStatsText": "/stats/user-stats",
}

function removeHighlight() {
	document.getElementById(currentStatPage).style.textDecoration = "none";
}

function highlightCurrentPage() {
	document.getElementById(currentStatPage).style.textDecoration = "underline";
}

function fetchStatsPage(page) {
	fetch(page)
		.then(response => {
			if (response.status !== 200)
				return emptyElement("statsDiv");
			else
				return response.text();
		})
		.then(text => {
			if (text) {
				emptyElement("statsDiv");
				insertInElement("statsDiv", text);
			}
		})
}

document.addEventListener("DOMContentLoaded", function() {
	// Highlight 'Matches History' by default
	const statsNav = document.getElementById("statsNav");
	highlightCurrentPage();
	fetchStatsPage(statPages[currentStatPage]);


	// Update the current 'page' when clicked
	statsNav.addEventListener("click", async function(event) {
		if (event.target.id !== currentStatPage && Object.keys(statPages).includes(event.target.id)) {
			removeHighlight();
			currentStatPage = event.target.id;
			highlightCurrentPage();
			fetchStatsPage(statPages[currentStatPage]);
		}
	})
})

