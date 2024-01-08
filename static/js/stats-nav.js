let currentStatPage = "matchesHistoryText"
const statPages = ["matchesHistoryText", "tournamentsText", "userStatsText"]

function removeHighlight() {
	document.getElementById(currentStatPage).style.textDecoration = "none";
}

function highlightCurrentPage() {
	document.getElementById(currentStatPage).style.textDecoration = "underline";
}

document.addEventListener("DOMContentLoaded", function() {
	const statsNav = document.getElementById("statsNav");
	highlightCurrentPage();

	// Highlight the current 'page' when clicked
	statsNav.addEventListener("click", function(event) {
		if (event.target.id !== currentStatPage && statPages.includes(event.target.id)) {
			removeHighlight();
			currentStatPage = event.target.id;
			highlightCurrentPage();
		}
	})
})

