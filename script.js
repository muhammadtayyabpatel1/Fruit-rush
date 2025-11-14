document.addEventListener('DOMContentLoaded', () => {

    // ------------------ ELEMENTS ------------------
    const startScreen = document.getElementById('start-screen');
    const startButton = document.getElementById('start-button');
    const gameScreen = document.getElementById('game-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartButton = document.getElementById('restart-button');
    const basket = document.getElementById('basket');
    const gameContainer = document.getElementById('game-container');
    const scoreElement = document.getElementById('score');
    const topScoreElement = document.getElementById('top-score');
    const finalScore = document.getElementById('final-score');
    const finalTopScore = document.getElementById('final-top-score');
    const pauseButton = document.getElementById('pause-button');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');

    // ------------------ AUDIO ------------------
    const bgMusic = new Audio("audio/bg-loop.mp3");
    bgMusic.loop = true;

    const catchSound = new Audio("audio/fruit-catch.mp3");
    const bombSound = new Audio("audio/bomb-explosion.mp3");

    // ------------------ VARIABLES ------------------
    let score = 0;
    let topScore = localStorage.getItem('topScore') || 0;
    topScoreElement.textContent = topScore;

    let gameInterval;
    let fruitInterval;

    let gamePaused = false;
    let baseSpeed = 2;        
    let currentSpeed = 2;

    let basketPos = 0;
    let moveLeft = false;
    let moveRight = false;

    const fruits = ["🍎", "🍌", "🍓", "🍇", "🍊"];
    const bombs = ["💣"];
    let fallingItems = [];

    gameContainer.setAttribute("tabindex", "0");

    // -----------------------------------------------------
    //                    START GAME
    // -----------------------------------------------------
    startButton.addEventListener("click", () => {
        startScreen.classList.add("hidden");
        gameScreen.classList.remove("hidden");
        startGame();
    });

    restartButton.addEventListener("click", () => {
        gameOverScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        startGame();
    });

    // -----------------------------------------------------
    //                    PAUSE BUTTON
    // -----------------------------------------------------
    pauseButton.addEventListener("click", () => {
        gamePaused = !gamePaused;

        if (gamePaused) {
            pauseButton.textContent = "▶️ Resume";
            bgMusic.pause();
        } else {
            pauseButton.textContent = "⏸️ Pause";
            bgMusic.play();
        }
    });

    // -----------------------------------------------------
    //            MOVEMENT BUTTON EVENTS
    // -----------------------------------------------------
    function setupBtn(btn, direction) {
        btn.addEventListener("touchstart", () => {
            direction === "left" ? moveLeft = true : moveRight = true;
        });
        btn.addEventListener("touchend", () => {
            moveLeft = false;
            moveRight = false;
        });
    }

    setupBtn(leftBtn, "left");
    setupBtn(rightBtn, "right");

    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowLeft") moveLeft = true;
        if (e.key === "ArrowRight") moveRight = true;
    });

    document.addEventListener('keyup', () => {
        moveLeft = false;
        moveRight = false;
    });

    // -----------------------------------------------------
    //                    DRAG BASKET
    // -----------------------------------------------------
    let dragging = false;

    basket.addEventListener("touchstart", () => dragging = true);
    basket.addEventListener("touchend", () => dragging = false);
    basket.addEventListener("touchmove", (e) => {
        e.preventDefault();
        if (dragging) moveBasket(e.touches[0].clientX);
    });

    basket.addEventListener("mousedown", () => dragging = true);
    basket.addEventListener("mouseup", () => dragging = false);
    basket.addEventListener("mousemove", (e) => {
        if (dragging) moveBasket(e.clientX);
    });

    function moveBasket(x) {
        basketPos = x - basket.offsetWidth / 2;

        if (basketPos < 0) basketPos = 0;
        if (basketPos > gameContainer.offsetWidth - basket.offsetWidth)
            basketPos = gameContainer.offsetWidth - basket.offsetWidth;

        basket.style.left = basketPos + "px";
    }

    // -----------------------------------------------------
    //                    START GAME FUNCTION
    // -----------------------------------------------------
    function startGame() {
        score = 0;
        currentSpeed = baseSpeed;
        scoreElement.textContent = score;

        basket.style.bottom = "14%"; // keep above arrows

        bgMusic.currentTime = 0;
        bgMusic.play();

        fallingItems.forEach(item => item.element.remove());
        fallingItems = [];

        fruitInterval = setInterval(spawnItem, 1000);
        gameInterval = requestAnimationFrame(updateGame);
    }

    // -----------------------------------------------------
    //                       SPAWN
    // -----------------------------------------------------
    function spawnItem() {
        if (gamePaused) return;

        const isBomb = Math.random() < 0.2;
        const emoji = isBomb ? "💣" : fruits[Math.floor(Math.random() * fruits.length)];

        const item = document.createElement("div");
        item.classList.add(isBomb ? "bomb" : "fruit");
        item.textContent = emoji;

        item.style.left = Math.random() * (gameContainer.offsetWidth - 40) + "px";

        gameContainer.appendChild(item);
        fallingItems.push({
            element: item,
            isBomb,
            y: 0,
            speed: currentSpeed
        });
    }

    // -----------------------------------------------------
    //                      UPDATE GAME
    // -----------------------------------------------------
    function updateGame() {

        if (!gamePaused) {

            if (moveLeft) moveBasket(basketPos - 10);
            if (moveRight) moveBasket(basketPos + 10);

            fallingItems.forEach((obj, index) => {
                obj.y += obj.speed;
                obj.element.style.top = obj.y + "px";

                const bRect = basket.getBoundingClientRect();
                const iRect = obj.element.getBoundingClientRect();

                if (
                    !(bRect.right < iRect.left ||
                      bRect.left > iRect.right ||
                      bRect.bottom < iRect.top ||
                      bRect.top > iRect.bottom)
                ) {
                    if (obj.isBomb) {
                        bombSound.play();
                        endGame();
                        return;
                    } else {
                        catchSound.play();
                        score++;
                        scoreElement.textContent = score;

                        if (score % 15 === 0) {
                            currentSpeed = baseSpeed + (score / 15);
                        }

                        obj.element.remove();
                        fallingItems.splice(index, 1);
                    }
                }

                if (obj.y > gameContainer.offsetHeight) {
                    obj.element.remove();
                    fallingItems.splice(index, 1);
                }
            });
        }

        requestAnimationFrame(updateGame);
    }

    // -----------------------------------------------------
    //                     END GAME
    // -----------------------------------------------------
    function endGame() {
        cancelAnimationFrame(gameInterval);
        clearInterval(fruitInterval);

        bgMusic.pause();
        bgMusic.currentTime = 0;

        finalScore.textContent = score;

        if (score > topScore) {
            topScore = score;
            localStorage.setItem("topScore", topScore);
        }

        finalTopScore.textContent = topScore;

        gameScreen.classList.add("hidden");
        gameOverScreen.classList.remove("hidden");
    }

});
