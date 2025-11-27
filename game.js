// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game variables
let score = 0;
let lives = 3;
let gameRunning = false;
let gamePaused = false;
let animationId;

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height - 60,
    radius: 8,
    dx: 4,
    dy: -4,
    speed: 4
};

// Paddle properties
const paddle = {
    width: 100,
    height: 15,
    x: canvas.width / 2 - 50,
    speed: 8
};

// Brick properties
const brickRowCount = 5;
const brickColumnCount = 8;
const brickWidth = 90;
const brickHeight = 25;
const brickPadding = 10;
const brickOffsetTop = 50;
const brickOffsetLeft = 35;

// Create bricks array
const bricks = [];
const brickColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

function initBricks() {
    bricks.length = 0;
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = {
                x: c * (brickWidth + brickPadding) + brickOffsetLeft,
                y: r * (brickHeight + brickPadding) + brickOffsetTop,
                status: 1,
                color: brickColors[r]
            };
        }
    }
}

// Keyboard controls
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler);
document.addEventListener('keyup', keyUpHandler);
document.addEventListener('mousemove', mouseMoveHandler);

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddle.x = relativeX - paddle.width / 2;
    }
}

// Draw functions
function drawBall() {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.roundRect(paddle.x, canvas.height - paddle.height - 10, paddle.width, paddle.height, 5);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.strokeStyle = '#4ECDC4';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brick = bricks[c][r];
                ctx.beginPath();
                ctx.roundRect(brick.x, brick.y, brickWidth, brickHeight, 5);
                ctx.fillStyle = brick.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

// Collision detection
function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const brick = bricks[c][r];
            if (brick.status === 1) {
                if (ball.x > brick.x &&
                    ball.x < brick.x + brickWidth &&
                    ball.y > brick.y &&
                    ball.y < brick.y + brickHeight) {
                    ball.dy = -ball.dy;
                    brick.status = 0;
                    score += 10;
                    updateScore();

                    // Check for win
                    if (score === brickRowCount * brickColumnCount * 10) {
                        alert('축하합니다! 모든 벽돌을 깼습니다!');
                        resetGame();
                    }
                }
            }
        }
    }
}

// Update score and lives display
function updateScore() {
    document.getElementById('score').textContent = score;
}

function updateLives() {
    document.getElementById('lives').textContent = lives;
}

// Move paddle
function movePaddle() {
    if (rightPressed && paddle.x < canvas.width - paddle.width) {
        paddle.x += paddle.speed;
    } else if (leftPressed && paddle.x > 0) {
        paddle.x -= paddle.speed;
    }
}

// Move ball
function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Wall collision (left and right)
    if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
    }

    // Wall collision (top)
    if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
    }

    // Paddle collision
    if (ball.y + ball.radius > canvas.height - paddle.height - 10 &&
        ball.y - ball.radius < canvas.height - 10 &&
        ball.x > paddle.x &&
        ball.x < paddle.x + paddle.width) {

        // Calculate ball direction based on where it hits the paddle
        const hitPos = (ball.x - paddle.x) / paddle.width;
        const angle = (hitPos - 0.5) * Math.PI * 0.6;
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);

        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle));
    }

    // Ball falls below paddle
    if (ball.y + ball.radius > canvas.height) {
        lives--;
        updateLives();

        if (lives === 0) {
            alert('게임 오버! 최종 점수: ' + score);
            resetGame();
        } else {
            // Reset ball and paddle position
            ball.x = canvas.width / 2;
            ball.y = canvas.height - 60;
            ball.dx = 4 * (Math.random() > 0.5 ? 1 : -1);
            ball.dy = -4;
            paddle.x = canvas.width / 2 - paddle.width / 2;
        }
    }
}

// Main game loop
function draw() {
    if (!gameRunning || gamePaused) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw everything
    drawBricks();
    drawBall();
    drawPaddle();

    // Update game state
    collisionDetection();
    moveBall();
    movePaddle();

    animationId = requestAnimationFrame(draw);
}

// Game control functions
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        draw();
    }
}

function pauseGame() {
    if (gameRunning) {
        gamePaused = !gamePaused;
        document.getElementById('pauseBtn').textContent = gamePaused ? '계속하기' : '일시정지';
        if (!gamePaused) {
            draw();
        }
    }
}

function resetGame() {
    // Cancel animation
    if (animationId) {
        cancelAnimationFrame(animationId);
    }

    // Reset game state
    gameRunning = false;
    gamePaused = false;
    score = 0;
    lives = 3;

    // Reset ball
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 60;
    ball.dx = 4;
    ball.dy = -4;

    // Reset paddle
    paddle.x = canvas.width / 2 - paddle.width / 2;

    // Reset bricks
    initBricks();

    // Update UI
    updateScore();
    updateLives();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = '일시정지';

    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
}

// Button event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Initialize game
initBricks();
drawBricks();
drawBall();
drawPaddle();
document.getElementById('pauseBtn').disabled = true;
