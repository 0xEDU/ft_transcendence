import scrollToSection from "./control-panel.js";
import {showControlPanel} from "./play-button.js";

// Game constants (trying to avoid magic numbers)
let canvas;
let ctx;
let game_main;
let gameInterval;
let pongString;

// ball variables
const ballWidth = 20;
const ballHeight = 20;
const ballRadius = 10;
const ballColor = "#fff"
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
const winningScore = 1;

// randomize this later
let dx = -3.2;
let dy = 2.4;
let speedX = 5;
let speedY = 5;

let rightUpPressed = false;
let rightDownPressed = false;
let leftUpPressed = false;
let leftDownPressed = false;

const randomizeBallMovement = () => {
	// Randomize direction and speed
	dx = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2); // Randomize between -4.5 and 4.5
	dy = (Math.random() > 0.5 ? 1 : -1) * (2.5 + Math.random() * 2); // Randomize between -4.5 and 4.5
	speedX = 0.5
	speedY = 0.5
}

class StateMachine {
	constructor() {
		this._state = "NotStarted";
	}

	get state() {
		return this._state;
	}

	set state(newState) {
		this._state = newState;
		this.handleStateChange();
	}

	handleStateChange() {
		if (this.state === "NotStarted") {
			drawStartingScreen();
		} else if (this.state === "Running") {
			// Clear the starting screen and start the game loop
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			countdownStart(); // This will start the countdown
		} else if (this.state === "GameOver") {
			// Handle game over logic
			console.log("Game Over!");
		}
	}

	startGame() {
		if (this.state === "NotStarted") {
			this.state = "Running";
			countdown = 4; // Reset countdown
			countdownStart();
		}
	}

	endGame() {
		if (this.state === "Running") {
			this.state = "GameOver";
			stopGame();
			// Call to django goes here I guess
		}
	}
}

const stateMachine = new StateMachine();

const stopGame = () => {
	clearInterval(gameInterval);
	resetBall();
	stateMachine.state = "GameOver";
}

function setCanvasScalingFactor() {
	return window.devicePixelRatio || 1;
}

function setCanvasSize() {
	//Gets the devicePixelRatio
	var pixelRatio = setCanvasScalingFactor();

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
	game_main.style.width = width + "px";
	game_main.style.height = height + "px";

	canvas.width = width * pixelRatio;
	canvas.height = height * pixelRatio;
}

const drawStartingScreen = () => {
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	ctx.fillStyle = "#FFF"; // Text color
	ctx.font = "48px sans serif"; // Text font and size
	ctx.textAlign = "center"; // Align text to the center
	ctx.fillText("Pong Game", canvas.width / 2, canvas.height / 4); // Game title
	ctx.font = "24px sans serif"; // Smaller text for instructions
	ctx.fillText("Press Enter to Start", canvas.width / 2, canvas.height / 2); // Start instructions
}

const drawBall = () => {
	ctx.fill();
	ctx.beginPath();
	ctx.arc(
		canvas.width / 2 + ballX, canvas.height / 2 + ballY,
		ballRadius, 0, Math.PI * 2);
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();
}

const drawPaddles = () => {
	// Left paddle
	ctx.fill();
	ctx.beginPath();
	ctx.rect(
		paddlePadding, (canvas.height / 2) - (paddleHeight / 2) + leftPaddleY,
		paddleWidth, paddleHeight);
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();

	// Right paddle
	rightPaddlePosition = (canvas.height / 2) - (paddleHeight / 2) + rightPaddleY;
	ctx.fill();
	ctx.beginPath();
	ctx.rect(
		(canvas.width - paddlePadding) - (paddleWidth), rightPaddlePosition,
		paddleWidth, paddleHeight);
	ctx.fillStyle = ballColor;
	ctx.fill();
	ctx.closePath();
}

const drawMiddleLine = () => {
	const lineLength = 5; // Length of each dash
	const gap = 10; // Gap between dashes
	let y = 0;

	ctx.fillStyle = "rgba(255, 255, 255, 0.6)"; // Use the same color as the ball for consistency

	while (y < canvas.height) {
		ctx.fillRect(canvas.width / 2 - lineLength / 2, y, lineLength, lineLength);
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

let countdown = 4;
const countdownStart = () => {
	if (countdown > 0) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		drawMiddleLine();
		drawPaddles();
		ctx.fillStyle = "#FFF";
		ctx.font = "48px sans serif";
		ctx.textAlign = "center";
		ctx.fillText(countdown, canvas.width / 2, canvas.height / 2);

		countdown--;
		setTimeout(countdownStart, 800);
	} else {
		clearInterval(gameInterval);
		// Start the game loop once the countdown is finished
		gameInterval = setInterval(start, 10);
	}
}

const start = () => {
	if (rightScore === winningScore || leftScore === winningScore) {
		stopGame();
        drawScore();
		return;
	}

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	drawMiddleLine();
	drawBall();
	drawPaddles();
	movePaddles();

	if (ballY + dy > canvas.height / 2 || ballY + dy < (-canvas.height / 2) + ballRadius) {
		dy = -dy;
	}

	checkCollisionWithPaddle();

	if (ballX + dx > canvas.width / 2) {
		rightScore++;
		resetBall();
        drawScore();
		return;
	}

	if (ballX + dx < -canvas.width / 2) {
		leftScore++;
		resetBall();
        drawScore;
		return;
	}

	ballX += dx * speedX;
	ballY += dy * speedY;
}

const drawScore = () => {
	ctx.font = "bold 48px sans serif";
	if (leftScore === winningScore || rightScore === winningScore) {
		ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2);
	}
}

const keyDownHandler = (e) => {
	if (e.key === "Up" || e.key === "ArrowUp") {
		rightUpPressed = true;
	}
	if (e.key === "Down" || e.key === "ArrowDown") {
		rightDownPressed = true;
	}
	if (e.key === "w") {
		leftUpPressed = true;
	}
	if (e.key === "s") {
		leftDownPressed = true;
	}
	if (e.key == "Enter" && stateMachine.state === "NotStarted") {
		stateMachine.startGame();
	}
	if (e.key == "Enter" && stateMachine.state === "GameOver") {
		stateMachine.endGame();
		scrollToSection("lobby");
		showControlPanel();
		rightScore = 0;
		leftScore = 0;
		stateMachine.state = "NotStarted"
		
	}
}

const keyUpHandler = (e) => {
	if (e.key === "Up" || e.key === "ArrowUp") {
		rightUpPressed = false;
	}
	if (e.key === "Down" || e.key === "ArrowDown") {
		rightDownPressed = false;
	}
	if (e.key === "w") {
		leftUpPressed = false;
	}
	if (e.key === "s") {
		leftDownPressed = false;
	}
}

// main
export default function pongMain() {
	canvas = document.getElementById("pongGameCanvas");
	game_main = document.getElementById("gameDiv");
	ctx = canvas.getContext("2d");
	pongString = canvas.dataset.pong;
	setCanvasSize();
	randomizeBallMovement();
	stateMachine.handleStateChange();
	window.addEventListener("resize", setCanvasSize, false);
	document.addEventListener("keydown", keyDownHandler, false);
	document.addEventListener("keyup", keyUpHandler, false);
};

