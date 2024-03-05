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

let rightUpPressed = false;
let rightDownPressed = false;
let leftUpPressed = false;
let leftDownPressed = false;

const States = {
	NOT_STARTED: "NotStarted",
	RUNNING: "Running",
	GAME_OVER: "GameOver",
};

const randomizeBallMovement = () => {
	// Randomize direction and speed
	dx = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2); // Randomize between -4.5 and 4.5
	dy = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2); // Randomize between -4.5 and 4.5
	speedX = 0.5
	speedY = 0.5
}

let gameState = States.NOT_STARTED;

function adjustCanvasSizeToWindow() {
	context.fillStyle = styleGuide.__YELLOW_100;
	context.font = "48px sans serif";
	context.textAlign = "center";
	context.fillText(55, canvas.width / 2, canvas.height / 2);
	// context.clearRect(0, 0, canvas.width, canvas.height);
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
	context.fillStyle = styleGuide.__WHITE; // Text color
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
	context.fillStyle = styleGuide.__WHITE;
	context.fill();
	context.beginPath();
	context.arc(
		canvas.width / 2 + ballX, canvas.height / 2 + ballY,
		ballRadius, 0, Math.PI * 2);
	context.fill();
	context.closePath();
}

const drawPaddles = () => {
	context.fillStyle = styleGuide.__ORANGE;

	// Left paddle
	context.beginPath();
	context.rect(
		paddlePadding, (canvas.height / 2) - (paddleHeight / 2) + leftPaddleY,
		paddleWidth, paddleHeight);
	context.fill();
	context.closePath();

	// Right paddle
	rightPaddlePosition = (canvas.height / 2) - (paddleHeight / 2) + rightPaddleY;
	context.beginPath();
	context.rect(
		(canvas.width - paddlePadding) - (paddleWidth), rightPaddlePosition,
		paddleWidth, paddleHeight);
	context.fill();
	context.closePath();
}

const drawMiddleLine = () => {
	const lineLength = 5; // Length of each dash
	const gap = 10; // Gap between dashes
	let y = 0;

	context.fillStyle = styleGuide.__GREEN;

	while (y < canvas.height) {
		context.fillRect(canvas.width / 2 - lineLength / 2, y, lineLength, lineLength);
		y += lineLength + gap;
	}
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

const launchGame = () => {
	if (gameState === States.RUNNING) {

		if (rightScore === winningScore || leftScore === winningScore) {
			// Somebody won. The game is over.
			gameState = States.GAME_OVER;
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

const drawScore = () => {
	console.log("TODO: Write logic to update the score on screen;")
	return ;
}

const keyDownHandler = (e) => {
	// drawMiddleLine(); // HERE IT WORKS.
	if (e.key === "Up" || e.key === "ArrowUp") {
		rightUpPressed = true;
	}
	if (e.key === "Down" || e.key === "ArrowDown") {
		rightDownPressed = true;
	}
	if (e.key === "w" || e.key === "W") {
		leftUpPressed = true;
	}
	if (e.key === "s" || e.key === "S") {
		leftDownPressed = true;
	}
	if (e.key == "Enter" && gameState === States.NOT_STARTED) {
		drawMiddleLine();
		startGameAfterCountdown(3);
	}
	if (e.key == "Enter" && gameState === States.GAME_OVER) {
		scrollToSection("lobby");
		showControlPanel();
		rightScore = 0;
		leftScore = 0;
		gameState = States.NOT_STARTED;
	}
}

const keyUpHandler = (e) => {
	if (e.key === "Up" || e.key === "ArrowUp") {
		rightUpPressed = false;
	}
	if (e.key === "Down" || e.key === "ArrowDown") {
		rightDownPressed = false;
	}
	if (e.key === "w" || e.key === "W") {
		leftUpPressed = false;
	}
	if (e.key === "s" || e.key === "S") {
		leftDownPressed = false;
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
				countdown(); // Recursive call for next countdown iteration
				if (seconds === 0) {
					gameState = States.RUNNING;
				}
			}, 1000); // Delay of 1 second (1000 milliseconds)
		}
	}

	// Start the countdown
	countdown();
}

// main
export default function launchClassicPongMatch() {
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
	document.addEventListener("keydown", keyDownHandler);
	document.addEventListener("keyup", keyUpHandler);

	// Start game execution in loop. The loop ends onde gameLoopIntervalId is cleared
	gameLoopIntervalId = setInterval(launchGame, 10);
};

