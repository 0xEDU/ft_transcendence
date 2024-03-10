import { scrollToSection } from "./control-panel.js";
import { showControlPanel } from "./play-button.js";
import insertInElement from "./tinyDOM/insertInElement.js";
import styleGuide from "./style-guide.js"
import { fetchStatsPage } from "./stats-nav.js"

// Game constants (trying to avoid magic numbers)
let canvas;
let context;
let gameCanvasDiv;
let gameLoopIntervalId;

// ball variables
const ballRadius = 10;
let ballX = 0;
let ballY = 0;

// paddle variables
const paddlePadding = 10;
const paddleWidth = 15;
const paddleHeight = 130;
let rightPaddleY = 0;
let leftPaddleY = 0;
let rightPaddlePosition = 0;

let rightScore = 0;
let leftScore = 0;
let coopMatchIsOver = false;
let rightPlayerLogin;
let leftPlayerLogin;
const winningScore = 3;

// randomize this later
let dx = -3.2;
let dy = 2.4;
let speedX = 1;
let speedY = 1;

// Players movement
let rightUpPressed = false;
let rightDownPressed = false;
let leftUpPressed = false;
let leftDownPressed = false;

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

function adjustCanvasSizeToWindow() {
	//Gets the devicePixelRatio
	var pixelRatio = window.devicePixelRatio || 1;

	//The viewport is in portrait mode, so var width should be based off viewport WIDTH
	if (window.innerHeight > window.innerWidth) {
		//Makes the canvas 100% of the viewport width
		var width = Math.round(1.3 * window.innerWidth);
	}
	//The viewport is in landscape mode, so var width should be based off viewport HEIGHT
	else {
		//Makes the canvas 100% of the viewport height
		var width = Math.round(1.3 * window.innerHeight);
	}

	//This is done in order to maintain the 1:1 aspect ratio, adjust as needed
	var height = width * 0.7;

	//This will be used to downscale the canvas element when devicePixelRatio > 1
	gameCanvasDiv.style.width = width + "px";
	gameCanvasDiv.style.height = height + "px";

	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
}

const drawStartingScreen = () => {
	context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

	drawPlayersNames();
	context.fillStyle = styleGuide.__WHITEr
	context.font = "48px sans serif"; // Text font and size
	context.textAlign = "center"; // Align text to the center
	context.fillText("Pong Game", canvas.width / 2, canvas.height / 4); // Game title
	context.font = "24px sans serif"; // Smaller text for instructions
	context.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2); // Start instructions
}

const drawEndingScreen = (game_type) => {
	context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	resetBall();
	if (gameState === States.GAME_OVER) {
		if (game_type === "classic") {
			context.textAlign = 'center';
			context.font = "bold 48px sans serif";
			context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
			context.fillText(leftPlayerLogin + ' ' + leftScore + " x " + rightScore + ' ' + rightPlayerLogin, canvas.width / 2, canvas.height / 2 + 60);
			context.font = "bold 18px sans serif";
			context.fillText("(press enter to return to lobby)", canvas.width / 2, canvas.height / 2 + 100);
		}
		if (game_type === "co-op") {
			context.textAlign = 'center';
			context.font = "bold 48px sans serif";
			context.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 60);
			context.fillText(matchStats.paddleHits, canvas.width / 2, canvas.height / 2);
			context.fillText(leftPlayerLogin + ' + ' + rightPlayerLogin, canvas.width / 2, canvas.height / 2 + 60);
			context.font = "bold 18px sans serif";
			context.fillText("(press enter to return to lobby)", canvas.width / 2, canvas.height / 2 + 120);
		}
	}
}

const drawBall = () => {
	context.fillStyle = styleGuide.__WHITE;

	context.beginPath();
	context.arc(
		canvas.width / 2 + ballX, canvas.height / 2 + ballY,
		ballRadius, 0, Math.PI * 2);
	context.fill();
	context.closePath();
}

const drawPaddles = () => {
	// Right paddle
	context.fillStyle = styleGuide.__WHITE;
	rightPaddlePosition = (canvas.height / 2) - (paddleHeight / 2) + rightPaddleY;
	context.beginPath();
	context.rect(
		(canvas.width - paddlePadding) - (paddleWidth), rightPaddlePosition,
		paddleWidth, paddleHeight
	);
	context.fill();
	context.closePath();

	// Left paddle
	context.fillStyle = styleGuide.__WHITE;
	context.beginPath();
	context.rect(
		paddlePadding, (canvas.height / 2) - (paddleHeight / 2) + leftPaddleY,
		paddleWidth, paddleHeight
	);
	context.fill();
	context.closePath();
}

const drawMiddleLine = () => {
	const lineLength = 2 * paddleWidth; // Length of each dash
	const gap = paddleWidth; // Gap between dashes
	let y = 0;

	context.fillStyle = styleGuide.__WHITE;

	while (y < canvas.height) {
		context.fillRect(canvas.width / 2 - lineLength / 2, y, paddleWidth, lineLength);
		y += lineLength + gap;
	}
}

const drawScore = (game_type) => {
	context.fillStyle = styleGuide.__WHITE
	let y = canvas.height / 15;
	let margin = canvas.width / 20;

	context.font = "bold 48px sans serif";
	if (game_type === "classic") {
		context.textAlign = "left";
		context.fillText(leftScore, margin, y);
		context.textAlign = "right";
		context.fillText(rightScore, canvas.width - margin, y);
	}
	if (game_type === "co-op") {
		const x = canvas.width / 2;
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(matchStats.paddleHits, x, y);
	}
	return;
}

const drawPlayersNames = () => {
	context.fillStyle = styleGuide.__WHITE
	let y = canvas.height / 15 + 60;
	let margin = canvas.width / 20;
	context.font = "bold 18px sans serif";
	context.textAlign = "left";
	context.fillText(leftPlayerLogin, margin, y);
	context.textAlign = "right";
	context.fillText(rightPlayerLogin, canvas.width - margin, y);
	return;
}

const resetBall = () => {
	ballX = 0;
	ballY = 0;
	randomizeBallMovement();
}

const checkCollisionWithPaddle = () => {
	// Convert ball position to canvas coordinates
	let ballCanvasX = (canvas.width / 2) + ballX;
	let ballCanvasY = (canvas.height / 2) + ballY;

	// Calculate the top and bottom of the paddles in canvas coordinates
	let leftPaddleTop = (canvas.height / 2) + leftPaddleY - (paddleHeight / 2);
	let leftPaddleBottom = leftPaddleTop + paddleHeight;
	let rightPaddleTop = (canvas.height / 2) + rightPaddleY - (paddleHeight / 2);
	let rightPaddleBottom = rightPaddleTop + paddleHeight;

	// Collision with Left Paddle
	if (ballCanvasX - ballRadius <= paddleWidth + paddlePadding && ballCanvasY >= leftPaddleTop && ballCanvasY <= leftPaddleBottom) {
		dx = -dx;
		// Adjust the ball's position to ensure it bounces from the paddle's edge
		ballX = -canvas.width / 2 + paddleWidth + paddlePadding + ballRadius;
		matchStats.paddleHits++;
	}

	// Collision with Right Paddle
	if (ballCanvasX + ballRadius > canvas.width - paddleWidth && ballCanvasY > rightPaddleTop && ballCanvasY < rightPaddleBottom) {
		dx = -dx;
		ballX = canvas.width / 2 - paddleWidth - ballRadius; // Reposition ball after collision
		matchStats.paddleHits++;
	}
}

const movePaddles = () => {
	if (rightUpPressed) {
		rightPaddleY -= 7;
		if (rightPaddleY - (paddleHeight / 2) - paddlePadding < -canvas.height / 2) {
			rightPaddleY = -canvas.height / 2 + paddleHeight / 2 + paddlePadding;
		}
	} else if (rightDownPressed) {
		rightPaddleY += 7
		if (rightPaddleY + (paddleHeight / 2) + paddlePadding >= canvas.height / 2) {
			rightPaddleY = canvas.height / 2 - paddleHeight / 2 - paddlePadding;
		};
	}
	if (leftUpPressed) {
		leftPaddleY -= 7;
		if (leftPaddleY - (paddleHeight / 2) - paddlePadding < -canvas.height / 2) {
			leftPaddleY = -canvas.height / 2 + paddleHeight / 2 + paddlePadding;
		}
	} else if (leftDownPressed) {
		leftPaddleY += 7
		if (leftPaddleY + (paddleHeight / 2) + paddlePadding >= canvas.height / 2) {
			leftPaddleY = canvas.height / 2 - paddleHeight / 2 - paddlePadding;
		};
	}
}

const keyDownHandler = (e) => {
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

	// Transitions for starting and ending screens
	if (e.key == "Enter" && gameState === States.NOT_STARTED) {
		drawMiddleLine();
		startGameAfterCountdown();
	}
	if (e.key == "Enter" && gameState === States.GAME_OVER) {
		gameState = States.NOT_STARTED;
		scrollToSection("lobby");
		showControlPanel();
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
}

const sendMatchDataToServer = (match_id, players_array) => {
	const url = `/pong/match/${match_id}`;

	const matchData = {
		"match_duration_secs": (matchStats.endTime - matchStats.startTime) / 1000,
		"ball_traveled_distance_cm": (matchStats.ballTraveledDistance / window.devicePixelRatio) * (2.54 / 96), // 1 inch = 2.54 centimeters, 1 inch = 96 CSS pixels
		"paddle_hits": matchStats.paddleHits,
		"scores": {
			[players_array[0]]: leftScore,
			[players_array[1]]: rightScore,
		}
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
			insertInElement("userStatsDiv", responseHTML);
			fetchStatsPage("/stats/matches-history");
			fetchStatsPage("/stats/tournaments");
			fetchStatsPage("/stats/user-stats");
		})
		.catch(error => {
			console.error('Error updating match data:', error);
		});
}

const runGame = (match_id, players_array, game_type) => {
	if (gameState === States.RUNNING) {
		if ((game_type === "classic" && rightScore === winningScore || leftScore === winningScore)
			|| (game_type === "co-op" && coopMatchIsOver)) {
			// Somebody won. The game is over.
			gameState = States.GAME_OVER;
			matchStats.endTime = performance.now();
			clearInterval(gameLoopIntervalId); // stop game execution
			drawEndingScreen(game_type);
			sendMatchDataToServer(match_id, players_array);
			leftScore = 0;
			rightScore = 0;
			coopMatchIsOver = false;
			rightPaddleY = 0;
			leftPaddleY = 0;
			matchStats = {
				startTime: 0,
				endTime: 0,
				paddleHits: 0,
				ballTraveledDistance: 0
			};
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		drawMiddleLine();
		drawPlayersNames();
		drawScore(game_type);
		drawBall();
		drawPaddles();
		movePaddles();

		if (ballY + dy > canvas.height / 2 || ballY + dy < (-canvas.height / 2) + ballRadius) {
			dy = -dy;
		}

		checkCollisionWithPaddle();

		// Check if ball hit side walls (score)
		if (ballX + dx > canvas.width / 2) {
			if (game_type === "classic")
				leftScore++;
			if (game_type === "co-op")
				coopMatchIsOver = true;
			resetBall();
			return;
		}

		if (ballX + dx < -canvas.width / 2) {
			if (game_type === "classic")
				rightScore++;
			if (game_type === "co-op")
				coopMatchIsOver = true;
			resetBall();
			return;
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
	}
}

function startGameAfterCountdown() {
	let seconds = 3; // Initial value for the countdown

	function countdown() {
		if (seconds >= 0) {
			context.clearRect(0, 0, canvas.width, canvas.height);

			drawPaddles();
			drawPlayersNames();

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
export default function launchMatch(match_id, players_array, game_type) {
	// console.log(`about to start match number ${match_id} of type ${game_type} with ${players_array}...`)
	canvas = document.getElementById("pongGameCanvas");
	context = canvas.getContext("2d");
	gameCanvasDiv = document.getElementById("gameDiv");

	leftPlayerLogin = players_array[0];
	rightPlayerLogin = players_array[1];

	// Initial set up of the canvas
	adjustCanvasSizeToWindow();
	randomizeBallMovement();
	drawStartingScreen();

	// Readjusts the size of the canvas in case of window resizing mid-game
	window.addEventListener("resize", adjustCanvasSizeToWindow);
	// Set keyboard event handlers.
	document.addEventListener("keydown", keyDownHandler);
	document.addEventListener("keyup", keyUpHandler);

	// Start game execution in loop. The loop ends onde gameLoopIntervalId is cleared
	gameLoopIntervalId = setInterval(() => {
		runGame(match_id, players_array, game_type); // Pass arguments to runGame function
	}, 10);
};

