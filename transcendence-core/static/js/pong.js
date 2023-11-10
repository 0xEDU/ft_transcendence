let lastTime = 0;
const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
let canvasWidth = window.innerWidth * 0.8;
let canvasHeight = window.innerHeight * 0.8;

canvasWidth = Math.min(canvasWidth, 1536);
canvasHeight = Math.min(canvasHeight, 864);

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const grid = 15;
const paddleHeight = grid * 6;
const maxPaddleY = canvas.height - grid - paddleHeight;
const paddleSpeed = 70;
const ballSpeed = 4.7;
const maxBallSpeed = 10;
const ballSpeedIncreaseFactor = 1.10;

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
  dy: -ballSpeed
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

let leftScore = 0;
let rightScore = 0;
const winningScore = 5;
let gameOver = false;

function resetGame() {
  leftScore = 0;
  rightScore = 0;
  gameOver = false;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  ball.dx = ballSpeed;
  ball.dy = -ballSpeed;
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
    context.fillStyle = 'white';
    context.font = 'bold 50px Helvetica';
    context.textAlign = 'center';
    context.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    context.fillText("Press Enter to restart", canvas.width / 2, canvas.height / 2 + 60);
    context.textAlign = 'start';
  }
}

function updatePaddleMovement(deltaTime) {
  const movementScale = deltaTime * 0.01;

  if (keyState.ArrowUp) rightPaddle.dy = -paddleSpeed;
  else if (keyState.ArrowDown) rightPaddle.dy = paddleSpeed;
  else rightPaddle.dy = 0;

  if (keyState.w) leftPaddle.dy = -paddleSpeed;
  else if (keyState.s) leftPaddle.dy = paddleSpeed;
  else leftPaddle.dy = 0;

  leftPaddle.y += leftPaddle.dy * movementScale;
  rightPaddle.y += rightPaddle.dy * movementScale;

  leftPaddle.y = Math.max(grid, Math.min(leftPaddle.y, maxPaddleY));
  rightPaddle.y = Math.max(grid, Math.min(rightPaddle.y, maxPaddleY));
}

function loop(timestamp) {
  if (gameOver) {
    return;
  }

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);

  updatePaddleMovement(deltaTime);

  if (leftPaddle.y < grid) leftPaddle.y = grid;
  else if (leftPaddle.y > maxPaddleY) leftPaddle.y = maxPaddleY;

  if (rightPaddle.y < grid) rightPaddle.y = grid;
  else if (rightPaddle.y > maxPaddleY) rightPaddle.y = maxPaddleY;

  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y < grid || ball.y + grid > canvas.height - grid) {
    ball.dy *= -1;
    if (ball.y < grid) ball.y = grid;
    else ball.y = canvas.height - grid * 2;
  }

  if (ball.x < 0 || ball.x > canvas.width) {
    if (!ball.resetting) {
      ball.resetting = true;
      if (ball.x < 0) rightScore++;
      else if (ball.x > canvas.width) leftScore++;

      setTimeout(() => {
        ball.resetting = false;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        const randomAngle = Math.random() * Math.PI/2 - Math.PI/4;
        const direction = Math.random() < 0.5 ? 1 : -1;
        ball.dx = direction * ballSpeed * Math.cos(randomAngle);
        ball.dy = ballSpeed * Math.sin(randomAngle);
      }, 400);
    }
  }

  if (collides(ball, leftPaddle) || collides(ball, rightPaddle)) {
    // Ball speed influenced by paddle movement
    let additionalSpeed = (leftPaddle.dy + rightPaddle.dy) / 4;
    additionalSpeed = Math.max(Math.min(additionalSpeed, 1), -1);  // Limiting additional speed
    ball.dy += additionalSpeed;
  }

  context.fillRect(ball.x, ball.y, ball.width, ball.height);
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);

  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }

  drawScore();
  checkGameOver();
}

// Key down event
document.addEventListener('keydown', function(e) {
	if (e.key in keyState) {
	  keyState[e.key] = true;
	}
  
	// Check if 'Enter' is pressed and game is over
	if (e.key === 'Enter' && gameOver) {
	  resetGame();
	  gameOver = false;  // Ensure the game is marked as not over
	  requestAnimationFrame(loop);  // Restart the game loop
	}
  });
  
  // Key up event
  document.addEventListener('keyup', function(e) {
	if (e.key in keyState) {
	  keyState[e.key] = false;
	}
  });

window.addEventListener('resize', () => {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  leftPaddle.x = grid * 2;
  leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
  rightPaddle.x = canvas.width - grid * 3;
  rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;
  maxPaddleY = canvas.height - grid - paddleHeight;
});

requestAnimationFrame(loop);
