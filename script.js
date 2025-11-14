// ----------------------------
// FRUIT RUSH GAME SCRIPT
// ----------------------------

// Screens
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const gameOverScreen = document.getElementById("game-over-screen");

// Buttons
const startBtn = document.getElementById("start-button");
const pauseBtn = document.getElementById("pause-button");
const restartBtn = document.getElementById("restart-button");
const leftBtn = document.getElementById("left-btn");
const rightBtn = document.getElementById("right-btn");

// Game Elements
const basket = document.getElementById("basket");
const gameContainer = document.getElementById("game-container");

const scoreText = document.getElementById("score");
const topScoreText = document.getElementById("top-score");
const finalScore = document.getElementById("final-score");
const finalTopScore = document.getElementById("final-top-score");

// Variables
let basketX = window.innerWidth / 2;
let score = 0;
let topScore = 0;
let dropSpeed = 3;            // 🔥 NORMAL SPEED
let speedIncreaseInterval = 15;  
let speedBoostAmount = 0.7;
let fruitInterval;
let gameLoop;
let isPaused = false;

// Fruit & bomb options
const fruits = ["🍎", "🍉", "🍌", "🍇", "🍊", "🍒"];
const bombs = ["💣"];

// ----------------------------
// START GAME
// ----------------------------
startBtn.onclick = () => {
    startScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    resetGame();
};

// ----------------------------
// RESET GAME
// ----------------------------
function resetGame() {
    score = 0;
    dropSpeed = 3;   // 🔥 Reset to normal speed
    scoreText.textContent = score;

    isPaused = false;

    clearInterval(fruitInterval);
    clearInterval(gameLoop);

    startFruitSpawner();
    startGameLoop();
}

// ----------------------------
// FRUIT / BOMB SPAWNER
// ----------------------------
function startFruitSpawner() {
    fruitInterval = setInterval(() => {
        if (isPaused) return;

        const item = document.createElement("div");

        // 1 out of 8 chance for bomb
        const isBomb = Math.random() < 0.12;
        item.textContent = isBomb ? bombs[0] : fruits[Math.floor(Math.random() * fruits.length)];
        item.classList.add(isBomb ? "bomb" : "fruit");

        item.style.left = Math.random() * (window.innerWidth - 50) + "px";
        item.style.top = "-40px";

        gameContainer.appendChild(item);
    }, 800);
}

// ----------------------------
// GAME LOOP (movement + collision)
// ----------------------------
function startGameLoop() {
    gameLoop = setInterval(() => {
        if (isPaused) return;

        const items = document.querySelectorAll(".fruit, .bomb");

        items.forEach(item => {
            let top = parseFloat(item.style.top);
            top += dropSpeed;
            item.style.top = top + "px";

            const itemRect = item.getBoundingClientRect();
            const basketRect = basket.getBoundingClientRect();

            // Catch fruit or bomb
            if (
                itemRect.bottom >= basketRect.top &&
                itemRect.left >= basketRect.left &&
                itemRect.right <= basketRect.right &&
                itemRect.top < basketRect.bottom
            ) {
                if (item.classList.contains("bomb")) {
                    gameOver();
                } else {
                    score++;
                    scoreText.textContent = score;

                    // 🔥 Speed increases every 15 points
                    if (score % speedIncreaseInterval === 0) {
                        dropSpeed += speedBoostAmount;
                    }
                }

                item.remove();
            }

            // Delete items falling off screen
            if (top > window.innerHeight) {
                item.remove();
            }
        });
    }, 20);
}

// ----------------------------
// PAUSE GAME
// ----------------------------
pauseBtn.onclick = () => {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? "▶️ Resume" : "⏸️ Pause";
};

// ----------------------------
// GAME OVER
// ----------------------------
function gameOver() {
    clearInterval(fruitInterval);
    clearInterval(gameLoop);

    gameScreen.classList.add("hidden");
    gameOverScreen.classList.remove("hidden");

    finalScore.textContent = score;

    if (score > topScore) {
        topScore = score;
    }

    topScoreText.textContent = topScore;
    finalTopScore.textContent = topScore;
}

// ----------------------------
// RESTART GAME
// ----------------------------
restartBtn.onclick = () => {
    gameOverScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");
    resetGame();
};

// ----------------------------
// BASKET MOVEMENT — TOUCH + ARROWS
// ----------------------------
document.addEventListener("touchmove", (e) => {
    const touchX = e.touches[0].clientX;
    moveBasket(touchX);
});

leftBtn.onmousedown = () => moveBasketContinuous(-8);
rightBtn.onmousedown = () => moveBasketContinuous(8);
leftBtn.onmouseup = rightBtn.onmouseup = stopBasket;

let moveInterval;
function moveBasketContinuous(speed) {
    moveInterval = setInterval(() => moveBasket(basketX + speed), 20);
}
function stopBasket() {
    clearInterval(moveInterval);
}

function moveBasket(x) {
    basketX = Math.max(20, Math.min(window.innerWidth - 70, x));
    basket.style.left = basketX + "px";
}
