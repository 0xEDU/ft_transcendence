const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
let canvasWidth = window.innerWidth * 0.8; // 80% of window width
let canvasHeight = window.innerHeight * 0.8; // 80% of window height

canvasWidth = Math.min(canvasWidth, 1536); // Max width
canvasHeight = Math.min(canvasHeight, 864); // Max height

canvas.width = canvasWidth;
canvas.height = canvasHeight;

const grid = 15;
const paddleHeight = grid * 5; // adjust based on canvas size
const maxPaddleY = canvas.height - grid - paddleHeight;

var paddleSpeed = 6;
var ballSpeed = 5;
const ballSpeedIncreaseFactor = 1.1;

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

function collides(obj1, obj2) {
  if (obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y) {
      
    // Determine where the ball hits the paddle (from -1 to 1)
    let hitPoint = (obj1.y + (obj1.height / 2)) - (obj2.y + (obj2.height / 2));
    hitPoint /= (obj2.height / 2);

    // Calculate angle in radians
    const angle = hitPoint * Math.PI / 4; // Max bounce angle is 45 degrees here

    // Calculate the speed of the ball
    const currentSpeed = Math.sqrt(obj1.dx * obj1.dx + obj1.dy * obj1.dy);

    // Adjust the direction of the ball
    obj1.dy = currentSpeed * Math.sin(angle);
    obj1.dx = (obj1.dx > 0 ? -1 : 1) * currentSpeed * Math.cos(angle);

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
    
    // Erase the middle line by drawing a smaller rectangle over it
    // Adjust the y-coordinate and height to avoid the top and bottom borders
    context.fillStyle = 'black'; // Use your background color
    context.fillRect(canvas.width / 2 - grid / 2, grid, grid, canvas.height - grid * 2);

    // Now draw the game over message
    context.fillStyle = 'white'; // Text color
    context.font = 'bold 50px Helvetica';
    context.textAlign = 'center'; // Align text to the center
    context.fillText("Game Over!", canvas.width / 2, canvas.height / 2);
    context.fillText("Press Enter to restart", canvas.width / 2, canvas.height / 2 + 60);

    // Reset text alignment if needed elsewhere
    context.textAlign = 'start';
  }
}

function loop() {
  if (gameOver) {
    return;
  }
  
  requestAnimationFrame(loop);
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  leftPaddle.y += leftPaddle.dy;
  rightPaddle.y += rightPaddle.dy;

  if (leftPaddle.y < grid) {
    leftPaddle.y = grid;
  } else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  } else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  context.fillStyle = 'white';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  ball.x += ball.dx;
  ball.y += ball.dy;

  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
    // Increase the speed after hitting the wall
    ball.dx *= ballSpeedIncreaseFactor;
    ball.dy *= ballSpeedIncreaseFactor;
  } else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
    // Increase the speed after hitting the wall
    ball.dx *= ballSpeedIncreaseFactor;
    ball.dy *= ballSpeedIncreaseFactor;
  }

  if (ball.x < 0 || ball.x > canvas.width) {
    if (!ball.resetting) {
      ball.resetting = true;
  
      // Update score
      if (ball.x < 0) rightScore++;
      else if (ball.x > canvas.width) leftScore++;
  
      setTimeout(() => {
        ball.resetting = false;
  
        // Reset ball position
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
  
        // Randomly set the ball's direction on reset
        const randomAngle = Math.random() * Math.PI/2 - Math.PI/4; // Random angle between -45 and 45 degrees
        const direction = Math.random() < 0.5 ? 1 : -1; // Randomly choose between left and right
  
        ball.dx = direction * ballSpeed * Math.cos(randomAngle);
        ball.dy = ballSpeed * Math.sin(randomAngle);
      }, 400);
    }
  }

  if (collides(ball, leftPaddle)) {
    ball.x = leftPaddle.x + leftPaddle.width;
  } else if (collides(ball, rightPaddle)) {
    ball.x = rightPaddle.x - ball.width;
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

document.addEventListener('keydown', function(e) {
  if (e.key === 'Enter' && gameOver) {
    resetGame();
    requestAnimationFrame(loop);
  }
  if (e.key === 'ArrowUp') {
    rightPaddle.dy = -paddleSpeed;
  } else if (e.key === 'ArrowDown') {
    rightPaddle.dy = paddleSpeed;
  }

  if (e.key === 'w' || e.key === 'W') {
    leftPaddle.dy = -paddleSpeed;
  } else if (e.key === 's' || e.key === 'S') {
    leftPaddle.dy = paddleSpeed;
  }
});

document.addEventListener('keyup', function(e) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    rightPaddle.dy = 0;
  }

  if (e.key === 'w' || e.key === 'W' || e.key === 's' || e.key === 'S') {
    leftPaddle.dy = 0;
  }
});

window.addEventListener('resize', () => {
    // Sync canvas drawing size with CSS size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Recalculate positions and sizes
    leftPaddle.x = grid * 2;
    leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
    rightPaddle.x = canvas.width - grid * 3;
    rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    maxPaddleY = canvas.height - grid - paddleHeight;
});

requestAnimationFrame(loop);
