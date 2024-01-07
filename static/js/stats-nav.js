const currentStatPage = "matchesHistoryText"
const statPages = ["matchesHistoryText", "tournamentsText", "userStatsText"]

function highlightCurrentPage() {
	document.getElementById(currentStatPage).style.textDecoration = "underline";
}

document.addEventListener("DOMContentLoaded", function() {
	const statsNav = document.getElementById("statsNav");
	highlightCurrentPage();

	statsNav.addEventListener("click", function(event) {
		const 
		highlightCurrentPage();
	})
})

