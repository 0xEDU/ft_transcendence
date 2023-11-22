let lastTime = 0;
let countdown = 3;
let countdownTime = Date.now();
let isCountdownActive = true;
let gameOver = false;
let leftScore = 0;
let rightScore = 0;
let requestId = null;
let canvasWidth = window.innerWidth * 0.8;
let canvasHeight = window.innerHeight * 0.8;
let paddleSpeed = 50;
const canvas = document.getElementById('game');
const matchId = canvas.dataset.matchId;
const player1 = canvas.dataset.player1;
const player2 = canvas.dataset.player2;
const context = canvas.getContext('2d');
const winningScore = 5;
const ballSpeed = 8;
const maxBallSpeed = 15;
const ballSpeedIncreaseFactor = 1.10;
const originalCanvasWidth = 1536;
const originalCanvasHeight = 864;


canvas.width = canvasWidth = Math.min(canvasWidth, originalCanvasWidth);
canvas.height = canvasHeight = Math.min(canvasHeight, originalCanvasHeight);
const grid = 15;
let paddleHeight = grid * 6;
let maxPaddleY = canvasHeight - grid - paddleHeight;

const leftPaddle = {
    x: grid * 2,
    y: canvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,
    dy: 0
};

const rightPaddle = {
    x: canvas.width - grid * 3,
    y: canvas.height / 2 - paddleHeight / 2,
    width: grid,
    height: paddleHeight,
    dy: 0
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: grid,
    height: grid,
    resetting: false,
    dx: ballSpeed,
    dy: ballSpeed
};

const keyState = {
    ArrowUp: false,
    ArrowDown: false,
    w: false,
    s: false
};

function collides(obj1, obj2) {
    if (obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y) {
        
        let hitPoint = (obj1.y + (obj1.height / 2)) - (obj2.y + (obj2.height / 2));
        hitPoint /= (obj2.height / 2);

        const angleRange = Math.PI / 4;
        const angle = hitPoint * angleRange;

        let currentSpeed = Math.sqrt(obj1.dx * obj1.dx + obj1.dy * obj1.dy);
        currentSpeed = Math.min(currentSpeed * ballSpeedIncreaseFactor, maxBallSpeed);

        obj1.dy = currentSpeed * Math.sin(angle);
        obj1.dx = -obj1.dx;

        return true;
    }
    return false;
}

function resetGame() {
    leftScore = 0;
    rightScore = 0;
    gameOver = false;
    isCountdownActive = true;
    countdown = 3;
    countdownTime = Date.now();

    // Reset ball position
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    // The ball will be set in motion after the countdown ends
    ball.dx = 0;
    ball.dy = 0;

    // Reset paddle positions if needed
    leftPaddle.y = (canvas.height / 2) - (leftPaddle.height / 2);
    rightPaddle.y = (canvas.height / 2) - (rightPaddle.height / 2);

    // Reset key states to prevent stuck keys during game over
    keyState.ArrowUp = false;
    keyState.ArrowDown = false;
    keyState.w = false;
    keyState.s = false;
}

function drawScore() {
    context.font = 'bold 45px Helvetica';
    context.fillText(leftScore, canvas.width / 4, 50);
    context.fillText(rightScore, 3 * canvas.width / 4, 50);
}

function checkGameOver() {
    if (leftScore >= winningScore || rightScore >= winningScore) {
        gameOver = true;
        context.fillStyle = 'black';
        context.fillRect(canvas.width / 2 - grid / 2, grid, grid, canvas.height - grid * 2);

        // Adjust the font size based on the new canvas size
        const fontSize = canvasWidth / 20; // Example: base your font size on the width
        context.font = `bold ${fontSize}px Helvetica`;
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
        context.fillText("Press Enter to restart", canvas.width / 2, canvas.height / 2 + fontSize);
        
        const baseUrl = window.location.origin
        const url =  baseUrl + "/pong/match"
        const data = {
            "player1": player1,
            "player2": player2,
            "player1_score": leftScore,
            "player2_score": rightScore,
            "match_id": matchId
        }
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify(data)
        })
    }
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie != '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function updatePaddleMovement(deltaTime) {
    const movementScale = deltaTime * 0.01;

    if (keyState.ArrowUp) rightPaddle.dy = -paddleSpeed;
    else if (keyState.ArrowDown) rightPaddle.dy = paddleSpeed;
    else rightPaddle.dy = 0;

    if (keyState.w) leftPaddle.dy = -paddleSpeed;
    else if (keyState.s) leftPaddle.dy = paddleSpeed;
    else leftPaddle.dy = 0;

    // Ensure paddles stay within the canvas bounds
    leftPaddle.y = Math.max(grid, Math.min(leftPaddle.y + leftPaddle.dy * movementScale, maxPaddleY));
    rightPaddle.y = Math.max(grid, Math.min(rightPaddle.y + rightPaddle.dy * movementScale, maxPaddleY));
}

// All your function definitions (collides, resetGame, drawScore, checkGameOver) will remain the same.

function drawEverything() {
    // Clear the canvas
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw paddles
    context.fillStyle = 'white';
    context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
    context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

    // Draw ball if countdown is not active
    if (!isCountdownActive) {
        context.fillRect(ball.x, ball.y, ball.width, ball.height);
    }

    // Draw scores
    drawScore();

    // Draw the net if countdown is not active
    if (!isCountdownActive) {
        for (let i = grid; i < canvas.height - grid; i += grid * 2) {
            context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
        }
    }

    // Handle game over display
    checkGameOver();

    // Display Countdown
    if (isCountdownActive) {
        context.font = 'bold 60px Helvetica';
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.fillText(countdown.toString(), canvas.width / 2, canvas.height / 2);
    }
}

function updateGameLogic() {
    if (isCountdownActive) {
        if (Date.now() - countdownTime >= 1000) {
            countdown -= 1;
            countdownTime = Date.now();
            if (countdown === 0) {
                isCountdownActive = false; // End countdown
                resetBall(); // Reset the ball's position and speed
            }
        }
    } else {
            // Ball movement logic
            ball.x += ball.dx;
            ball.y += ball.dy;

            // Ball collision with top and bottom
            if (ball.y < grid || ball.y > canvas.height - grid - ball.height) {
                ball.dy = -ball.dy;
                ball.y = ball.y < grid ? grid : canvas.height - grid - ball.height;
            }

            // Ball out of bounds logic
            if (ball.x < 0 || ball.x > canvas.width - ball.width) {
                if (!ball.resetting) {
                    ball.resetting = true;
                    ball.x < 0 ? rightScore++ : leftScore++;
                    // Reset ball after a score
                    setTimeout(() => {
                        ball.resetting = false;
                        resetBall();
                    }, 400);
                }
            }

            // Paddle collision
            if (collides(ball, leftPaddle) || collides(ball, rightPaddle)) {
                let combinedSpeed = (leftPaddle.dy + rightPaddle.dy) / 4;
                combinedSpeed = Math.max(Math.min(combinedSpeed, 1), -1); // Limiting additional speed
                ball.dy += combinedSpeed;
            }
        }
}

function resetBall() {
    // Center the ball
    ball.x = canvas.width / 2 - ball.width / 2;
    ball.y = canvas.height / 2 - ball.height / 2;

    // Set the ball's speed relative to the size of the canvas
    const baseSpeedX = canvasWidth * (ballSpeed / originalCanvasWidth);
    const baseSpeedY = canvasHeight * (ballSpeed / originalCanvasHeight);

    // Randomize the direction of the ball
    const randomAngle = Math.random() * Math.PI / 2 - Math.PI / 4;
    const direction = Math.random() < 0.5 ? 1 : -1;
    ball.dx = direction * baseSpeedX * Math.cos(randomAngle);
    ball.dy = baseSpeedY * Math.sin(randomAngle);
}

function loop(timestamp) {
    if (!gameOver) {
        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        updatePaddleMovement(deltaTime);
        updateGameLogic(deltaTime);
        drawEverything();

        requestId = requestAnimationFrame(loop);
    } else {
        // Cancel the animation frame request if the game is over
        if (requestId) {
            cancelAnimationFrame(requestId);
            requestId = null;
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key in keyState) {
        keyState[e.key] = true;
    }

    if (e.key === 'Enter' && gameOver) {
        resetGame();
        // Restart the game loop if the game was over
        if (!requestId) {
            requestId = requestAnimationFrame(loop);
        }
    }
});

document.addEventListener('keyup', function(e) {
    if (e.key in keyState) {
        keyState[e.key] = false;
    }
});

window.addEventListener('resize', () => {
    // Calculate new canvas dimensions
    const newCanvasWidth = window.innerWidth * 0.8;
    const newCanvasHeight = window.innerHeight * 0.8;
    
    // Calculate scale factors based on the initial sizes
    const scaleX = newCanvasWidth / canvas.width;
    const scaleY = newCanvasHeight / canvas.height;

    // Scale the canvas size
    canvas.width = canvasWidth = newCanvasWidth;
    canvas.height = canvasHeight = newCanvasHeight;

    // Update the base unit (grid) according to the new canvas size
    const newGrid = Math.min(canvas.width, canvas.height) / 50; // Example: base your grid on the smaller dimension

    // Scale and reposition the left paddle
    leftPaddle.width = newGrid;
    leftPaddle.height = newGrid * 6;
    leftPaddle.x = newGrid * 2; // Maintain position based on new grid
    leftPaddle.y = (canvas.height / 2) - (leftPaddle.height / 2);

    // Scale and reposition the right paddle
    rightPaddle.width = newGrid;
    rightPaddle.height = newGrid * 6;
    rightPaddle.x = canvas.width - (newGrid * 3); // Maintain position based on new grid
    rightPaddle.y = (canvas.height / 2) - (rightPaddle.height / 2);

    // Scale and reposition the ball
    ball.width = newGrid;
    ball.height = newGrid;
    ball.x = (canvas.width / 2) - (newGrid / 2);
    ball.y = (canvas.height / 2) - (newGrid / 2);

    // Scale the ball's speed based on the average scale factor
    const averageScale = (scaleX + scaleY) / 2;
    ball.dx *= averageScale;
    ball.dy *= averageScale;

	const currentHeightRatio = canvas.height / originalCanvasHeight;
	paddleSpeed = 70 * currentHeightRatio;

	resetBall();

    // Update the maximum Y position for paddles
    maxPaddleY = canvas.height - newGrid - leftPaddle.height;

    // Adjust the font size for the score display
    context.font = `bold ${newGrid * 2}px Helvetica`;

    // Redraw everything after resizing
    drawEverything();
});

requestId = requestAnimationFrame(loop);