import { scrollToSection } from "./control-panel.js";
import { showControlPanel } from "./play-button.js";
import styleGuide from "./style-guide.js"

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
const winningScore = 3;

// randomize this later
let dx = -3.2;
let dy = 2.4;
let speedX = 5;
let speedY = 5;

// Players movement
let rightUpPressed = false;
let rightDownPressed = false;
let leftUpPressed = false;
let leftDownPressed = false;

// Stats
let startTime = 0;
let endTime = 0;
let paddleHits = 0;
let ballTraveledDistance = 0;

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
	speedX = 0.5
	speedY = 0.5
}

function adjustCanvasSizeToWindow() {
	context.fillStyle = styleGuide.__YELLOW_100;
	context.font = "48px sans serif";
	context.textAlign = "center";
	context.fillText(55, canvas.width / 2, canvas.height / 2);
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
	context.fillStyle = styleGuide.__RED; // Text color
	// context.fillStyle = styleGuide.__WHITE; // Text color
	context.font = "48px sans serif"; // Text font and size
	context.textAlign = "center"; // Align text to the center
	context.fillText("Pong Game", canvas.width / 2, canvas.height / 4); // Game title
	context.font = "24px sans serif"; // Smaller text for instructions
	context.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2); // Start instructions
}

const drawEndingScreen = () => {
	context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	resetBall();
	if (gameState === States.GAME_OVER) {
		context.textAlign = 'center';
		context.font = "bold 48px sans serif";
		context.fillText("Game Over", canvas.width / 2, canvas.height / 2);
		context.fillText(leftScore + " x " + rightScore, canvas.width / 2, canvas.height / 2 + 60);
		context.font = "bold 18px sans serif";
		context.fillText("(press enter to return to lobby)", canvas.width / 2, canvas.height / 2 + 100);
	}
}

const drawBall = () => {
	context.fillStyle = styleGuide.__YELLOW_100;
	// context.fillStyle = styleGuide.__WHITE;
	context.fill();
	context.beginPath();
	context.arc(
		canvas.width / 2 + ballX, canvas.height / 2 + ballY,
		ballRadius, 0, Math.PI * 2);
	context.fill();
	context.closePath();
}

const drawPaddles = () => {
	// Right paddle
	context.fillStyle = styleGuide.__ORANGE;
	rightPaddlePosition = (canvas.height / 2) - (paddleHeight / 2) + rightPaddleY;
	context.beginPath();
	context.rect(
		(canvas.width - paddlePadding) - (paddleWidth), rightPaddlePosition,
		paddleWidth, paddleHeight
	);
	context.fill();
	context.closePath();

	// Left paddle
	context.fillStyle = styleGuide.__ORANGE;
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

	context.fillStyle = styleGuide.__GREEN;

	while (y < canvas.height) {
		context.fillRect(canvas.width / 2 - lineLength / 2, y, paddleWidth, lineLength);
		y += lineLength + gap;
	}
}

const drawScore = () => {
	console.log("TODO: Write logic to update the score on screen;")
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
	}

	// Collision with Right Paddle
	if (ballCanvasX + ballRadius > canvas.width - paddleWidth && ballCanvasY > rightPaddleTop && ballCanvasY < rightPaddleBottom) {
		dx = -dx;
		ballX = canvas.width / 2 - paddleWidth - ballRadius; // Reposition ball after collision
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

const keyDownHandler = (e, match_id) => {
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
		rightScore = 0;
		leftScore = 0;
		gameState = States.NOT_STARTED;
		scrollToSection("lobby");
		showControlPanel();

		const url = `/pong/match/${match_id}`;

		const durationSecs = (endTime - startTime) / 1000;
		ballTraveledDistance = 10;
		paddleHits = 42;
		const matchData = {
			"match_duration": durationSecs,
			"ball_traveled_distance": ballTraveledDistance,
			"paddle_hits": paddleHits,
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
				return response.json();
			})
			.then(data => {
				console.log('Match data updated successfully:', data);
			})
			.catch(error => {
				console.error('Error updating match data:', error);
			});
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

const launchGame = () => {
	if (gameState === States.RUNNING) {
		if (rightScore === winningScore || leftScore === winningScore) {
			// Somebody won. The game is over.
			gameState = States.GAME_OVER;
			endTime = performance.now();
			clearInterval(gameLoopIntervalId); // stop game execution
			drawEndingScreen();
			return;
		}

		context.clearRect(0, 0, canvas.width, canvas.height);
		drawMiddleLine();
		drawBall();
		drawPaddles();
		movePaddles();

		if (ballY + dy > canvas.height / 2 || ballY + dy < (-canvas.height / 2) + ballRadius) {
			dy = -dy;
		}

		checkCollisionWithPaddle();

		if (ballX + dx > canvas.width / 2) {
			leftScore++;
			resetBall();
			drawScore();
			return;
		}

		if (ballX + dx < -canvas.width / 2) {
			rightScore++;
			resetBall();
			drawScore();
			return;
		}

		ballX += dx * speedX;
		ballY += dy * speedY;
	}
}

function startGameAfterCountdown() {
	let seconds = 3; // Initial value for the countdown

	function countdown() {
		if (seconds >= 0) {
			context.clearRect(0, 0, canvas.width, canvas.height);

			drawPaddles();

			context.fillStyle = styleGuide.__RED;
			context.font = "48px sans serif";
			context.textAlign = "center";
			context.fillText(seconds, canvas.width / 2, canvas.height / 2);

			setTimeout(() => {
				seconds--;
				countdown();
				if (seconds === 0) {
					gameState = States.RUNNING;
					startTime = performance.now();
				}
			}, 1000);
		}
	}

	// Start the countdown
	countdown();
}

// main
export default function launchClassicPongMatch(match_id) {
	console.log(`about to start match number ${match_id}...`)
	canvas = document.getElementById("pongGameCanvas");
	context = canvas.getContext("2d");
	gameCanvasDiv = document.getElementById("gameDiv");

	// Initial set up of the canvas
	adjustCanvasSizeToWindow();
	randomizeBallMovement();
	drawStartingScreen();

	// Readjusts the size of the canvas in case of window resizing mid-game
	window.addEventListener("resize", adjustCanvasSizeToWindow);
	// Set keyboard event handlers.
	document.addEventListener("keydown", function (event) {
		// Call the original event handler function with the event and additional variable
		keyDownHandler(event, match_id);
	});
	document.addEventListener("keyup", keyUpHandler);

	// Start game execution in loop. The loop ends onde gameLoopIntervalId is cleared
	gameLoopIntervalId = setInterval(launchGame, 10);
};

