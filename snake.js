const game = document.querySelector("#game");
const ctx = game.getContext("2d");
const bestScoreTxt = document.querySelector("#bestScore");
const scoreTxt = document.querySelector("#scoreText");
const resetBtn = document.querySelector("#resetBtn");

const gameWidth = game.width;
const gameHeight = game.height;

const snakeCol = "lightgreen";
const snakeOutline = "black";
const appleImage = new Image();
appleImage.src = 'apple.png';

const unit = 25;
const spacing = 3;
let running = false;
let xVelocity = unit;
let yVelocity = 0;
let appleX;
let appleY;
let score = 0;

let highScore = localStorage.getItem("highScore") || 0;
document.querySelector("#bestScore").textContent = highScore;

const speed = 100; 
let gameTick;

let snake = [
    { x: unit * 4, y: 0 },
    { x: unit * 3, y: 0 },
    { x: unit * 2, y: 0 },
    { x: unit, y: 0 },
    { x: 0, y: 0 }
];

window.addEventListener("keydown", changeWay);
resetBtn.addEventListener("click", reset);

startGame();

function startGame() {
    running = true;
    scoreTxt.textContent = score;
    createApple();
    drawApple();
    nextTick();
}

function clear() {
    drawCheckeredBackground();
}

function drawCheckeredBackground() {
    for (let x = 0; x < gameWidth; x += unit) {
        for (let y = 0; y < gameHeight; y += unit) {
            ctx.fillStyle = (x / unit + y / unit) % 2 === 0 ? "#d3f9d8" : "#b2e1b1";
            ctx.fillRect(x, y, unit, unit);
        }
    }
}

function nextTick() {
    if (running) {
        gameTick = setTimeout(() => {
            clear();
            drawApple();
            moveSnake();
            drawSnake();
            isGameOver();
            nextTick();
        }, speed);
    } else {
        displayGameOver();
    }
}

function createApple() {
    let appleIsOnSnake = true;

    function randApple(min, max) {
        return Math.round(Math.random() * ((max - min) + min) / unit) * unit;
    }

    while (appleIsOnSnake) {
        appleX = randApple(0, gameWidth - unit);
        appleY = randApple(0, gameHeight - unit);

        appleIsOnSnake = snake.some(snakePart => {
            return snakePart.x === appleX && snakePart.y === appleY;
        });
    }
}

function drawApple() {
    ctx.drawImage(appleImage, appleX, appleY, unit, unit); 
}

function drawSnake() {
    const head = snake[0];
    ctx.fillStyle = snakeCol;
    ctx.strokeStyle = snakeOutline;
    
    const headSize = unit * 0.8; 
    ctx.fillRect(head.x + (unit - headSize) / 2, head.y + (unit - headSize) / 2, headSize, headSize);
    ctx.strokeRect(head.x + (unit - headSize) / 2, head.y + (unit - headSize) / 2, headSize, headSize);

    ctx.fillStyle = "pink";
    const tongueLength = unit / 2;
    const tongueWidth = unit / 4;

    if (xVelocity === unit) { 
        ctx.fillRect(head.x + headSize, head.y + (headSize - tongueWidth) / 2, tongueLength, tongueWidth);
    } else if (xVelocity === -unit) { 
        ctx.fillRect(head.x - tongueLength, head.y + (headSize - tongueWidth) / 2, tongueLength, tongueWidth);
    } else if (yVelocity === unit) { 
        ctx.fillRect(head.x + (headSize - tongueWidth) / 2, head.y + headSize, tongueWidth, tongueLength);
    } else if (yVelocity === -unit) { 
        ctx.fillRect(head.x + (headSize - tongueWidth) / 2, head.y - tongueLength, tongueWidth, tongueLength);
    }

    for (let i = 1; i < snake.length; i++) {
        const snakeSquare = snake[i];
        
        ctx.fillStyle = snakeCol;
        ctx.strokeStyle = snakeOutline;

        ctx.fillRect(snakeSquare.x + (unit - unit * 0.8) / 2, snakeSquare.y + (unit - unit * 0.8) / 2, unit * 0.8, unit * 0.8);
        ctx.strokeRect(snakeSquare.x + (unit - unit * 0.8) / 2, snakeSquare.y + (unit - unit * 0.8) / 2, unit * 0.8, unit * 0.8);
    }
}


function moveSnake() {
    const head = { x: snake[0].x + xVelocity, y: snake[0].y + yVelocity };
    snake.unshift(head);
    
    if (snake[0].x === appleX && snake[0].y === appleY) {
        score++;
        scoreTxt.textContent = score;
        createApple();
    } else {
        snake.pop(); 
    }
}

function changeWay(event) {
    const keyPressed = event.keyCode;
    const LEFT = 37;
    const UP = 38;
    const RIGHT = 39;
    const DOWN = 40;

    const goUp = (yVelocity === -unit);
    const goDown = (yVelocity === unit);
    const goRight = (xVelocity === unit);
    const goLeft = (xVelocity === -unit);

    switch (true) {
        case (keyPressed === LEFT && !goRight):
            xVelocity = -unit;
            yVelocity = 0;
            break;
        case (keyPressed === UP && !goDown):
            xVelocity = 0;
            yVelocity = -unit;
            break;
        case (keyPressed === RIGHT && !goLeft):
            xVelocity = unit;
            yVelocity = 0;
            break;
        case (keyPressed === DOWN && !goUp):
            xVelocity = 0;
            yVelocity = unit;
            break;
    }
}

function isGameOver() {
    switch (true) {
        case (snake[0].x < 0):
            running = false;
            break;
        case (snake[0].x >= gameWidth):
            running = false;
            break;
        case (snake[0].y < 0):
            running = false;
            break;
        case (snake[0].y >= gameHeight):
            running = false;
            break;
    }

    for (let i = 1; i < snake.length; i += 1) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y)
            running = false;
    }
}

function displayGameOver() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
        bestScoreTxt.textContent = `${highScore}`;
    }
    ctx.font = "50px MV Boli";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER!", gameWidth / 2, gameHeight / 2);
    running = false;
}

function reset() {
    clearTimeout(gameTick); 

    score = 0;
    xVelocity = unit;
    yVelocity = 0;
    snake = [
        { x: unit * 4, y: 0 },
        { x: unit * 3, y: 0 },
        { x: unit * 2, y: 0 },
        { x: unit, y: 0 },
        { x: 0, y: 0 }
    ];
    startGame();
}
