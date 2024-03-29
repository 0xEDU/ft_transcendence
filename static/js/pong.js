import { scrollToSection } from "./control-panel.js";
import { showControlPanel } from "./play-button.js";
import swapInnerHTMLOfElement from "./tinyDOM/swapInnerHTMLOfElement.js";
import styleGuide from "./style-guide.js"
import { fetchStatsPage } from "./stats-nav.js"

// Game constants (trying to avoid magic numbers)
let canvas;
let context;
let gameLoopIntervalId;
let hasFourPlayers;
let lastPaddleHit = "";
let isLastMatch;
let isTournament;
let tournamentPlayers = [];
let tournamentAllPlayers = [];
let tournamentMatchesLeft = 0;
let tournamentFinalResult = [];
let tournamentMatches = [];
let tempPair = [];
let global_game_type = "";

// ball variables
const ballRadius = 10;
let ballX = 0;
let ballY = 0;
let ballColor = styleGuide.__WHITE;

// paddle variables
const paddlePadding = 10;
const paddleWidth = 15;
const paddleHeight = 130;
const horizontalPaddleHeight = 15;
const horizontalPaddleWidth = 170;
const horizontalPaddlePadding = 20;
let paddleCoords = {
	rightPaddleY: 0,
	leftPaddleY: 0,
	topPaddleX: 0,
	bottomPaddleX: 0,
};
let rightPaddlePosition = 0;
let topPaddlePosition = 0;
const rightPaddleColor = "#00A0E9";
const leftPaddleColor = "#8E44AD";
const topPaddleColor = "#008B45";
const bottomPaddleColor = "#C62C36";

let scores = {
	rightScore: 0,
	leftScore: 0,
	topScore: 0,
	bottomScore: 0
};
let coopMatchIsOver = false;
let rightPlayerLogin;
let rightPlayerDName;
let leftPlayerLogin;
let leftPlayerDName;
let topPlayerLogin;
let topPlayerDName;
let bottomPlayerLogin;
let bottomPlayerDname;
const winningScore = 3;

// randomize this later
let dx = -3.2;
let dy = 2.4;
let speedX = 1;
let speedY = 1;
let incrementX = 0;
let incrementY = 0;

// Players movement
let rightUpPressed = false;
let rightDownPressed = false;
let leftUpPressed = false;
let leftDownPressed = false;

let topLeftPressed = false;
let topRightPressed = false;
let bottomLeftPressed = false;
let bottomRightPressed = false;

// Stats
let matchStats = {
	startTime: 0,
	endTime: 0,
	paddleHits: 0,
	ballTraveledDistance: 0
};

const States = {
	NOT_STARTED: "NotStarted",
	RUNNING: "Running",
	GAME_OVER: "GameOver",
};

let gameState = States.NOT_STARTED;


const randomizeBallMovement = () => {
	// Randomize direction and speed
	dx = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2); // Randomize between -5 and 5
	dy = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2); // Randomize between -5 and 5
}

function adjustCanvasSizeToWindow(game_type) {
	// Width will always be proportional to the width of the screen
	let canvasWidth = window.innerWidth * 0.7;
	// Height is calculated proportional to canvas width
	let canvasHeight = 0.7 * canvasWidth;
	if (canvasHeight > window.innerHeight)
		canvasHeight = 0.7 * window.innerHeight;

	// Calculate the minimum and maximum allowable heights for the canvas
	let minHeight = 0.6 * canvasWidth;
	let maxHeight = 0.8 * canvasWidth;

	// Check if the canvas height is within the allowable range
	if (canvasHeight < minHeight) {
		canvasHeight = minHeight;
	} else if (canvasHeight > maxHeight) {
		canvasHeight = maxHeight;
	}

	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	// TODO: redraw the screen, when a window 'resize' event happens
	if (!hasFourPlayers || game_type === "classic") {
		drawMiddleLine();
	}
	drawPlayersNames();
	drawScore(game_type);
	drawBall();
	drawPaddles();
}

const drawStartingScreen = (map_skin, game_type) => {
	context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

	if (map_skin === "map1")
		context.fillStyle = styleGuide.__WHITE
	else
		context.fillStyle = styleGuide.__ORANGE
	context.font = "48px sans serif"; // Text font and size
	context.textAlign = "center"; // Align text to the center
	context.fillText("Pong Game", canvas.width / 2, canvas.height / 4); // Game title
	context.fillText(leftPlayerDName + " and " + rightPlayerDName, canvas.width / 2, canvas.height / 4 + 120); // Game title
	context.font = "24px sans serif"; // Smaller text for instructions
	if (hasFourPlayers) {
		context.fillText("Top paddle controls: <- [i] [o] ->", canvas.width / 2, canvas.height / 4 + 170);
		context.fillText("Bottom paddle controls: <- [b] [n] ->", canvas.width / 2, canvas.height / 4 + 200);
	}
	context.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2); // Start instructions
}

function drawNextMatchScreen() {
	context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

	context.fillStyle = styleGuide.__WHITE
	context.font = "48px sans serif"; // Text font and size
	context.textAlign = "center"; // Align text to the center
	context.fillText("Next match:", canvas.width / 2, canvas.height / 3 + 60);
	context.font = "36px sans serif"; // Smaller text for instructions
	context.fillText(leftPlayerDName + " x " + rightPlayerDName, canvas.width / 2, canvas.height / 2);
	context.font = "24px sans serif"; // Smaller text for instructions
	context.fillText("Press Enter to continue", canvas.width / 2, canvas.height / 2 + 60); // Start instructions
}

const drawEndingScreen = (game_type) => {
	context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	resetBall();
	context.fillStyle = styleGuide.__WHITE;
	if (gameState === States.GAME_OVER) {
		let pressEnterHeight = 100
		if (game_type === "classic") {
			context.textAlign = 'center';
			context.font = "bold 48px sans serif";
			context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
			context.fillText(leftPlayerDName + ' ' + scores.leftScore + " x " + scores.rightScore + ' ' + rightPlayerDName, canvas.width / 2, canvas.height / 2 + 60);
			if (hasFourPlayers) {
				context.fillText(topPlayerDName + ' ' + scores.topScore + " x " + scores.bottomScore + ' ' + bottomPlayerDname, canvas.width / 2, canvas.height / 2 + 120);
				pressEnterHeight += 60;
			}
			context.font = "bold 18px sans serif";
			if (isLastMatch) {
				context.fillText("(press enter to return to lobby)", canvas.width / 2, canvas.height / 2 + pressEnterHeight);
			} else {
				context.fillText("(press enter to continue)", canvas.width / 2, canvas.height / 2 + pressEnterHeight);
			}
		}
		if (game_type === "co-op") {
			context.textAlign = 'center';
			context.font = "bold 48px sans serif";
			context.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60);
			context.fillText(matchStats.paddleHits, canvas.width / 2, canvas.height / 2);
			context.fillText(leftPlayerDName + ' + ' + rightPlayerDName, canvas.width / 2, canvas.height / 2 + 60);
			if (hasFourPlayers) {
				context.fillText(topPlayerDName + ' + ' + bottomPlayerDname, canvas.width / 2, canvas.height / 2 + 120);
				pressEnterHeight += 60;
			}
			context.font = "bold 18px sans serif";
			context.fillText("(press enter to return to lobby)", canvas.width / 2, canvas.height / 2 + pressEnterHeight);
		}
	}
}

const drawBall = (map_skin) => {
	if (map_skin === "map1" || hasFourPlayers)
		context.fillStyle = ballColor;
	else
		context.fillStyle = styleGuide.__HEAVY_GRAY;

	context.beginPath();
	context.arc(
		canvas.width / 2 + ballX, canvas.height / 2 + ballY,
		ballRadius, 0, Math.PI * 2);
	context.fill();
	context.closePath();
	context.fillStyle = styleGuide.__WHITE;
}

const drawPaddles = (map_skin) => {
	// Right paddle
	if (map_skin === "map1")
		context.fillStyle = hasFourPlayers ? rightPaddleColor : styleGuide.__WHITE;
	else
		context.fillStyle = hasFourPlayers ? rightPaddleColor : styleGuide.__HEAVY_GRAY;
	rightPaddlePosition = (canvas.height / 2) - (paddleHeight / 2) + paddleCoords.rightPaddleY;
	context.beginPath();
	context.rect(
		(canvas.width - paddlePadding) - (paddleWidth), rightPaddlePosition,
		paddleWidth, paddleHeight
	);
	context.fill();
	context.closePath();

	// Left paddle
	if (map_skin === "map1")
		context.fillStyle = hasFourPlayers ? leftPaddleColor : styleGuide.__WHITE;
	else
		context.fillStyle = hasFourPlayers ? leftPaddleColor : styleGuide.__HEAVY_GRAY;
	context.beginPath();
	context.rect(
		paddlePadding, (canvas.height / 2) - (paddleHeight / 2) + paddleCoords.leftPaddleY,
		paddleWidth, paddleHeight
	);
	context.fill();
	context.closePath();

	if (hasFourPlayers) {
		// Top paddle
		context.fillStyle = topPaddleColor;
		topPaddlePosition = horizontalPaddlePadding - (horizontalPaddleHeight / 2);
		context.beginPath();
		context.rect(
			(canvas.width / 2) - (horizontalPaddleWidth / 2) + paddleCoords.topPaddleX, topPaddlePosition,
			horizontalPaddleWidth, horizontalPaddleHeight
		);
		context.fill();
		context.closePath();

		// Bottom paddle
		context.fillStyle = bottomPaddleColor;
		context.beginPath();
		context.rect(
			(canvas.width / 2) - (horizontalPaddleWidth / 2) + paddleCoords.bottomPaddleX, canvas.height - horizontalPaddlePadding - (horizontalPaddleHeight / 2),
			horizontalPaddleWidth, horizontalPaddleHeight
		);
		context.fill();
		context.closePath();

	}
}

const drawMiddleLine = (map_skin) => {
	const lineLength = 2 * paddleWidth; // Length of each dash
	const gap = paddleWidth; // Gap between dashes
	let y = 0;
	if (global_game_type === "co-op" || hasFourPlayers) {
		return;
	}

	if (map_skin === "map1")
		context.fillStyle = styleGuide.__WHITE;
	else
		context.fillStyle = styleGuide.__ORANGE;

	while (y < canvas.height) {
		context.fillRect(canvas.width / 2 - lineLength / 2, y, paddleWidth, lineLength);
		y += lineLength + gap;
	}
}

const drawScore = (game_type, map_skin) => {
	if (map_skin === "map1")
		context.fillStyle = styleGuide.__WHITE
	else
		context.fillStyle = styleGuide.__HEAVY_GRAY
	let y = canvas.height / 15;
	let margin = canvas.width / 20;

	context.font = "bold 48px sans serif";
	if (game_type === "classic" && !hasFourPlayers) {
		context.textAlign = "left";
		context.fillText(scores.leftScore, margin, y);
		context.textAlign = "right";
		context.fillText(scores.rightScore, canvas.width - margin, y);
	}
	if (game_type === "co-op" && !hasFourPlayers) {
		const x = canvas.width / 2;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(matchStats.paddleHits, x, y);
	}
	if (game_type === "classic" && hasFourPlayers) {
		context.textAlign = "left";
		context.fillText(scores.leftScore, margin, canvas.height / 2);
		context.fillText(scores.rightScore, canvas.width - margin, canvas.height / 2);
		context.fillText(scores.topScore, canvas.width / 2, margin);
		context.fillText(scores.bottomScore, canvas.width / 2, canvas.height - margin);
	}
	if (game_type === "co-op" && hasFourPlayers) {
		const x = canvas.width / 2;
		const middleY = canvas.height / 2;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(matchStats.paddleHits, x, middleY);
	}
	return;
}

const drawPlayersNames = (map_skin) => {
	if (map_skin === "map1")
		context.fillStyle = styleGuide.__WHITE
	else
		context.fillStyle = styleGuide.__HEAVY_GRAY
	let margin = canvas.width / 20;
	context.font = "bold 18px sans serif";
	if (!hasFourPlayers) {
		let y = canvas.height / 15 + 60;
		context.textAlign = "left";
		context.fillText(leftPlayerDName, margin, y);
		context.textAlign = "right";
		context.fillText(rightPlayerDName, canvas.width - margin, y);

	} else {
		context.fillText(leftPlayerDName, canvas.width / 2 - 60 - 60, canvas.height / 2);
		context.fillText(rightPlayerDName, canvas.width / 2 + 60 + 60, canvas.height / 2);
		context.fillText(topPlayerDName, canvas.width / 2, canvas.height / 2 - 60);
		context.fillText(bottomPlayerDname, canvas.width / 2, canvas.height / 2 + 60);
	}
	return;
}

const resetBall = () => {
	ballX = 0;
	ballY = 0;
	speedX = 1;
	speedY = 1;
	incrementX = 0;
	incrementY = 0;
	lastPaddleHit = "";
	ballColor = styleGuide.__WHITE;
	randomizeBallMovement();
}

const checkCollisionWithPaddle = () => {
	// Convert ball position to canvas coordinates
	let ballCanvasX = (canvas.width / 2) + ballX;
	let ballCanvasY = (canvas.height / 2) + ballY;

	// Calculate the top and bottom of the paddles in canvas coordinates
	let leftPaddleTop = (canvas.height / 2) + paddleCoords.leftPaddleY - (paddleHeight / 2);
	let leftPaddleBottom = leftPaddleTop + paddleHeight;
	let rightPaddleTop = (canvas.height / 2) + paddleCoords.rightPaddleY - (paddleHeight / 2);
	let rightPaddleBottom = rightPaddleTop + paddleHeight;

	let topPaddleLeft = (canvas.width / 2) + paddleCoords.topPaddleX - (horizontalPaddleWidth / 2);
	let topPaddleRight = topPaddleLeft + horizontalPaddleWidth;
	let bottomPaddleLeft = (canvas.width / 2) + paddleCoords.bottomPaddleX - (horizontalPaddleWidth / 2);
	let bottomPaddleRight = bottomPaddleLeft + horizontalPaddleWidth;

	// Collision with Left Paddle
	if (ballCanvasX - ballRadius <= paddleWidth + paddlePadding && ballCanvasY >= leftPaddleTop && ballCanvasY <= leftPaddleBottom) {
		dx = -dx;
		// Adjust the ball's position to ensure it bounces from the paddle's edge
		ballX = -canvas.width / 2 + paddleWidth + paddlePadding + ballRadius;
		matchStats.paddleHits++;
		lastPaddleHit = "left";
		if (hasFourPlayers) {
			ballColor = leftPaddleColor;
		}
		incrementX += 0.07
		incrementY += 0.07
		speedX += incrementX
		speedY += incrementY
	}

	// Collision with Right Paddle
	if (ballCanvasX + ballRadius > canvas.width - paddleWidth && ballCanvasY > rightPaddleTop && ballCanvasY < rightPaddleBottom) {
		dx = -dx;
		ballX = canvas.width / 2 - paddleWidth - ballRadius; // Reposition ball after collision
		matchStats.paddleHits++;
		lastPaddleHit = "right";
		if (hasFourPlayers) {
			ballColor = rightPaddleColor;
		}
		incrementX += 0.07
		incrementY += 0.07
		speedX += incrementX
		speedY += incrementY
	}

	if (!hasFourPlayers) {
		return;
	}
	// Collision with Top Paddle
	if (ballCanvasY - ballRadius <= horizontalPaddleHeight + horizontalPaddlePadding - (horizontalPaddleHeight / 2)
		&& ballCanvasX >= topPaddleLeft && ballCanvasX <= topPaddleRight) {
		dy = -dy;
		ballY = -canvas.height / 2 + horizontalPaddleHeight + horizontalPaddlePadding + ballRadius; // Reposition ball after collision
		matchStats.paddleHits++;
		lastPaddleHit = "top";
		if (hasFourPlayers) {
			ballColor = topPaddleColor;
		}
		incrementX += 0.07
		incrementY += 0.07
		speedX += incrementX
		speedY += incrementY
	}

	// Collision with Bottom Paddle
	if (ballCanvasY + ballRadius > canvas.height - horizontalPaddleHeight
		&& ballCanvasX > bottomPaddleLeft && ballCanvasX < bottomPaddleRight) {
		dy = -dy;
		ballY = canvas.height / 2 - (horizontalPaddleHeight + horizontalPaddlePadding - horizontalPaddleHeight / 2) - ballRadius; // Reposition ball after collision
		matchStats.paddleHits++;
		lastPaddleHit = "bottom";
		if (hasFourPlayers) {
			ballColor = bottomPaddleColor;
		}
		incrementX += 0.07
		incrementY += 0.07
		speedX += incrementX
		speedY += incrementY
	}
}

const movePaddles = () => {
	if (rightUpPressed) {
		paddleCoords.rightPaddleY -= 7;
		if (paddleCoords.rightPaddleY - (paddleHeight / 2) - paddlePadding < -canvas.height / 2) {
			paddleCoords.rightPaddleY = -canvas.height / 2 + paddleHeight / 2 + paddlePadding;
		}
	} else if (rightDownPressed) {
		paddleCoords.rightPaddleY += 7
		if (paddleCoords.rightPaddleY + (paddleHeight / 2) + paddlePadding >= canvas.height / 2) {
			paddleCoords.rightPaddleY = canvas.height / 2 - paddleHeight / 2 - paddlePadding;
		};
	}
	if (leftUpPressed) {
		paddleCoords.leftPaddleY -= 7;
		if (paddleCoords.leftPaddleY - (paddleHeight / 2) - paddlePadding < -canvas.height / 2) {
			paddleCoords.leftPaddleY = -canvas.height / 2 + paddleHeight / 2 + paddlePadding;
		}
	} else if (leftDownPressed) {
		paddleCoords.leftPaddleY += 7
		if (paddleCoords.leftPaddleY + (paddleHeight / 2) + paddlePadding >= canvas.height / 2) {
			paddleCoords.leftPaddleY = canvas.height / 2 - paddleHeight / 2 - paddlePadding;
		};
	}
	if (topLeftPressed && hasFourPlayers) {
		paddleCoords.topPaddleX -= 7;
		if (paddleCoords.topPaddleX - (horizontalPaddleWidth / 2) - horizontalPaddlePadding < -canvas.width / 2) {
			paddleCoords.topPaddleX = -canvas.width / 2 + horizontalPaddleWidth / 2 + horizontalPaddlePadding;
		}
	} else if (topRightPressed && hasFourPlayers) {
		paddleCoords.topPaddleX += 7;
		if (paddleCoords.topPaddleX + (horizontalPaddleWidth / 2) + horizontalPaddlePadding >= canvas.width / 2) {
			paddleCoords.topPaddleX = canvas.width / 2 - horizontalPaddleWidth / 2 - horizontalPaddlePadding;
		}
	}
	if (bottomLeftPressed && hasFourPlayers) {
		paddleCoords.bottomPaddleX -= 7;
		if (paddleCoords.bottomPaddleX - (horizontalPaddleWidth / 2) - horizontalPaddlePadding < -canvas.width / 2) {
			paddleCoords.bottomPaddleX = -canvas.width / 2 + horizontalPaddleWidth / 2 + horizontalPaddlePadding;
		}
	} else if (bottomRightPressed && hasFourPlayers) {
		paddleCoords.bottomPaddleX += 7;
		if (paddleCoords.bottomPaddleX + (horizontalPaddleWidth / 2) + horizontalPaddlePadding >= canvas.width / 2) {
			paddleCoords.bottomPaddleX = canvas.width / 2 - horizontalPaddleWidth / 2 - horizontalPaddlePadding;
		}
	}
}

async function getDisplayName(login) {
	const url = `/auth/user/display-name/${login}`;
	return fetch(url)
		.then(response => response.json())
		.then(data => data["display_name"])

}

async function updatePlayers() {
	leftPlayerLogin = tournamentPlayers[0][0];
	leftPlayerDName = await getDisplayName(tournamentPlayers[0][0]);
	rightPlayerLogin = tournamentPlayers[0][1];
	rightPlayerDName = await getDisplayName(tournamentPlayers[0][1]);
	tournamentMatchesLeft--;
	if (tournamentMatchesLeft == 1) {
		isLastMatch = true;
	} else {
		tournamentPlayers.shift();
	}
}

const keyDownHandler = async (e) => {
	// Right-side player
	if (e.key === "Up" || e.key === "ArrowUp") {
		rightUpPressed = true;
	}
	if (e.key === "Down" || e.key === "ArrowDown") {
		rightDownPressed = true;
	}

	// Left-side player
	if (e.key === "w" || e.key === "W") {
		leftUpPressed = true;
	}
	if (e.key === "s" || e.key === "S") {
		leftDownPressed = true;
	}

	// Top-side player
	if ((e.key === "i" || e.key === "I") && hasFourPlayers) {
		topLeftPressed = true;
	}
	if ((e.key === "o" || e.key === "O") && hasFourPlayers) {
		topRightPressed = true;
	}
	if ((e.key === "b" || e.key === "B") && hasFourPlayers) {
		bottomLeftPressed = true;
	}
	if ((e.key === "n" || e.key === "N") && hasFourPlayers) {
		bottomRightPressed = true;
	}

	// Transitions for starting and ending screens
	if (e.key == "Enter" && gameState === States.NOT_STARTED) {
		if (!hasFourPlayers || global_game_type === "classic") {
			drawMiddleLine();
		}
		startGameAfterCountdown();
	}
	if (e.key == "Enter" && gameState === States.GAME_OVER && isLastMatch) {
		gameState = States.NOT_STARTED;
		scrollToSection("lobby");
		showControlPanel();
	}
	if (e.key == "Enter" && gameState === States.GAME_OVER && !isLastMatch) {
		gameState = States.NOT_STARTED;
		await updatePlayers();
		drawNextMatchScreen();
	}
}

const keyUpHandler = (e) => {
	// Right-hand player
	if (e.key === "Up" || e.key === "ArrowUp") {
		rightUpPressed = false;
	}
	if (e.key === "Down" || e.key === "ArrowDown") {
		rightDownPressed = false;
	}

	// Left-hand player
	if (e.key === "w" || e.key === "W") {
		leftUpPressed = false;
	}
	if (e.key === "s" || e.key === "S") {
		leftDownPressed = false;
	}

	// Top-hand player
	if ((e.key === "i" || e.key === "I") && hasFourPlayers) {
		topLeftPressed = false;
	}
	if ((e.key === "o" || e.key === "O") && hasFourPlayers) {
		topRightPressed = false;
	}

	// Bottom-hand player
	if ((e.key === "b" || e.key === "B") && hasFourPlayers) {
		bottomLeftPressed = false;
	}
	if ((e.key === "n" || e.key === "N") && hasFourPlayers) {
		bottomRightPressed = false;
	}
}

const sendMatchDataToServer = (match_id, players_array) => {
	const url = `/pong/match/${match_id}`;

	const matchData = {
		"match_duration_secs": (matchStats.endTime - matchStats.startTime) / 1000,
		"ball_traveled_distance_cm": (matchStats.ballTraveledDistance / window.devicePixelRatio) * (2.54 / 96), // 1 inch = 2.54 centimeters, 1 inch = 96 CSS pixels
		"paddle_hits": matchStats.paddleHits,
		"scores": {
			[players_array[0]]: scores.leftScore,
			[players_array[1]]: scores.rightScore,
		}
	}
	if (hasFourPlayers) {
		matchData.scores[players_array[2]] = scores.topScore
		matchData.scores[players_array[3]] = scores.bottomScore
	}

	const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;

	// Define the options for the fetch request
	const options = {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify(matchData),
	};

	// Send the fetch request
	fetch(url, options)
		.then(response => {
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.text();
		})
		.then(responseHTML => {
			// update front end dynamically
			swapInnerHTMLOfElement("userStatsDiv", responseHTML);
			fetchStatsPage("/stats/matches-history");
			fetchStatsPage("/stats/tournaments");
			fetchStatsPage("/stats/user-stats");
		})
		.catch(error => {
			console.error('Error updating match data:', error);
		});
	tournamentMatches.push({
		"id": match_id,
		"players": players_array,
		"score": [scores.leftScore, scores.rightScore],
		"date": Date.now()
	})
	if (isLastMatch && isTournament) {
		sendTournamentDataToBlockchain(scores.leftScore > scores.rightScore ? players_array[0] : players_array[1])
	}
}

function sendTournamentDataToBlockchain(winner) {
	const tournamentData = {
		"winner": winner,
		"players": tournamentAllPlayers,
		"matches": tournamentMatches
	}
	const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	const url = `/blockchain/tournament/`;
	const options = {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify(tournamentData),
	};
	fetch(url, options).then(response => response.text())
}

function lastPaddleScore() {
	if (hasFourPlayers) {
		switch (lastPaddleHit) {
			case "left":
				scores.leftScore++;
				break;
			case "right":
				scores.rightScore++;
				break;
			case "top":
				scores.topScore++;
				break;
			case "bottom":
				scores.bottomScore++;
				break;
			default:
				break;
		}	
	}
}

const resetMatchData = () => {
	Object.keys(scores).forEach(score => {
		scores[score] = 0;
	})
	Object.keys(matchStats).forEach(stat => {
		matchStats[stat] = 0;
	})
	Object.keys(paddleCoords).forEach(coord => {
		paddleCoords[coord] = 0;
	})
}

const drawBackground = () => {
    // Set the background color
	if (!hasFourPlayers)
	    context.fillStyle = styleGuide.__GREEN;
	else
		context.fillStyle = styleGuide.__OFF_WHITE;


    // Draw a rectangle covering the entire canvas
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Reset the fill style to white for other elements
    context.fillStyle = styleGuide.__WHITE;
};

//acrescentar map_skin
const runGame = async (match_id, players_array, game_type, map_skin) => {
	if (gameState === States.RUNNING) { if ((game_type === "classic" && (scores.rightScore === winningScore || scores.leftScore === winningScore || scores.topScore === winningScore || scores.bottomScore === winningScore))
			|| (game_type === "co-op" && coopMatchIsOver)) {
			// Somebody won. The game is over.
			gameState = States.GAME_OVER;
			global_game_type = ""
			matchStats.endTime = performance.now();
			if (isLastMatch) {
				clearInterval(gameLoopIntervalId); // stop game execution
			}
			drawEndingScreen(game_type);
			ballColor = styleGuide.__WHITE;
			coopMatchIsOver = false;
			const finalObj = {
				"gameOver": true,
			}
			if (game_type === "classic" && isTournament) {
				const winnerObj = {}
				winnerObj["score"] = scores.leftScore === winningScore ? scores.leftScore : scores.rightScore
				winnerObj["player"] = scores.leftScore === winnerObj["score"] ? leftPlayerLogin : rightPlayerLogin
				tournamentFinalResult.push(winnerObj["score"])
				tempPair.push(winnerObj["player"])
				if (tempPair.length === 2) {
					tournamentPlayers.push(tempPair)
					tempPair = []
					match_id.push(await createNewMatchForTournament(players_array))
				}
			}
			if (isTournament) {
				sendMatchDataToServer(match_id[0], tournamentPlayers[0]);
				match_id.shift();
			} else {
				sendMatchDataToServer(match_id, players_array);
			}
			resetMatchData();
			return finalObj;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		if (map_skin === "map2")
			drawBackground();
		if (!hasFourPlayers || game_type === "classic") {
			drawMiddleLine(map_skin);
		}
		drawPlayersNames(map_skin);
		drawScore(game_type, map_skin);
		drawBall(map_skin);
		drawPaddles(map_skin);
		movePaddles();

		if ((ballY + dy > canvas.height / 2 || ballY + dy < (-canvas.height / 2) + ballRadius) && !hasFourPlayers) {
			dy = -dy;
		}

		checkCollisionWithPaddle();

		// Check if ball hit side walls (score)
		if (ballX + dx > canvas.width / 2) {
			if (game_type === "classic" && !hasFourPlayers)
				scores.leftScore++;
			if (game_type === "classic" && hasFourPlayers)
				lastPaddleScore();
			if (game_type === "co-op")
				coopMatchIsOver = true;
			resetBall();
			return {"gameOver": false};
		}

		if (ballX + dx < -canvas.width / 2) {
			if (game_type === "classic" && !hasFourPlayers)
				scores.rightScore++;
			if (game_type === "classic" && hasFourPlayers)
				lastPaddleScore();
			if (game_type === "co-op")
				coopMatchIsOver = true;
			resetBall();
			return {"gameOver": false};
		}

		// Check if ball hit vertical walls (score 4 players)
		if ((ballY + dy > canvas.height / 2) && hasFourPlayers) {
			if (game_type === "classic")
				lastPaddleScore();
			if (game_type === "co-op")
				coopMatchIsOver = true;
			resetBall();
			return {"gameOver": false};
		}

		if ((ballY + dy < -canvas.height / 2) && hasFourPlayers) {
			if (game_type === "classic")
				lastPaddleScore();
			if (game_type === "co-op")
				coopMatchIsOver = true;
			resetBall();
			return {"gameOver": false};
		}

		// Calculate the distance traveled by the ball
		// Store the initial coordinates of the ball
		let initialX = ballX;
		let initialY = ballY;

		// Move ball
		ballX += dx * speedX;
		ballY += dy * speedY;

		// Increment distance
		matchStats.ballTraveledDistance += Math.sqrt(Math.pow(ballX - initialX, 2) + Math.pow(ballY - initialY, 2));
		return {"gameOver": false};
	}
	return {"gameOver": false};
}

async function createNewMatchForTournament(players) {
	const url = "/pong/match"
	const data = {
		"gameType": "classic",
		"gameMode": "tournament",
		"players": players.flat()
	}
	const csrfToken = document.getElementsByName('csrfmiddlewaretoken')[0].value;
	const options = {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			'X-CSRFToken': csrfToken,
		},
		body: JSON.stringify(data),
	};
	return fetch(url, options)
		.then(data => data.json())
		.then(data => data["match_id"])
}

function startGameAfterCountdown() {
	let seconds = 3; // Initial value for the countdown

	function countdown() {
		if (seconds >= 0) {
			context.clearRect(0, 0, canvas.width, canvas.height);

			drawPaddles();
			context.fillStyle = styleGuide.__WHITE;
			context.font = "48px sans serif";
			context.textAlign = "center";
			context.fillText(seconds, canvas.width / 2, canvas.height / 2);

			setTimeout(() => {
				seconds--;
				countdown();
				if (seconds === 0) {
					gameState = States.RUNNING;
					matchStats.startTime = performance.now();
				}
			}, 1000);
		}
	}

	// Start the countdown
	countdown();
}

// main
export default async function launchMatch(match_id, players_array, game_type, map_skin, lastMatch, tournamentState) {
	return await new Promise(async (resolve, _reject) => {
		// console.log(`about to start match number ${match_id} of type ${game_type} with ${players_array}...`)
		canvas = document.getElementById("pongGameCanvas");
		context = canvas.getContext("2d");
		isTournament = tournamentState
		hasFourPlayers = players_array.length == 4 && !isTournament;
		isLastMatch = lastMatch

		if (isTournament) {
			tournamentAllPlayers = players_array.flat();
			tournamentMatchesLeft = players_array.length === 2 ? 3 : 7;
			leftPlayerLogin = players_array[0][0];
			leftPlayerDName = await getDisplayName(players_array[0][0]);
			rightPlayerLogin = players_array[0][1];
			rightPlayerDName = await getDisplayName(players_array[0][1]);
			players_array.shift()
			tournamentPlayers.push(...players_array)
		} else {
			leftPlayerLogin = players_array[0];
			leftPlayerDName = await getDisplayName(players_array[0]);
			rightPlayerLogin = players_array[1];
			rightPlayerDName = await getDisplayName(players_array[1]);
		}
		if (hasFourPlayers) {
			topPlayerLogin = players_array[2];
			topPlayerDName = await getDisplayName(players_array[2]);
			bottomPlayerLogin = players_array[3];
			bottomPlayerDname = await getDisplayName(players_array[3]);
		}
		global_game_type = game_type

		// Initial set up of the canvas
		adjustCanvasSizeToWindow();
		randomizeBallMovement();
		drawStartingScreen(map_skin, game_type);

		// Readjusts the size of the canvas in case of window resizing mid-game
		window.addEventListener("resize", adjustCanvasSizeToWindow);
		// Set keyboard event handlers.
		document.addEventListener("keydown", keyDownHandler);
		document.addEventListener("keyup", keyUpHandler);

		// Start game execution in loop. The loop ends onde gameLoopIntervalId is cleared
		let finalObj;
		gameLoopIntervalId = setInterval(() => {
			if (isTournament) {
				finalObj = runGame(match_id, tournamentPlayers, game_type, map_skin); // Pass arguments to runGame function
			} else {
				finalObj = runGame(match_id, players_array, game_type, map_skin); // Pass arguments to runGame function
			}
			if (finalObj.gameOver == true) {
				resolve(finalObj);
			}
		}, 10);
	});
};

