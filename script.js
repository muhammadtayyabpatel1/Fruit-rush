document.addEventListener('DOMContentLoaded', () => {
    // Get elements
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

    let score = 0;
    let topScore = localStorage.getItem('topScore') || 0;
    topScoreElement.textContent = topScore;
    let gameInterval;
    let fruitInterval;
    let gamePaused = false;

    // Basket movement variables
    let basketPos = window.innerWidth / 2;
    let moveLeft = false;
    let moveRight = false;

    // Game objects
    const fruits = ["🍎", "🍌", "🍓", "🍇", "🍊"];
    const bombs = ["💣"];
    let fallingItems = [];

    // Start Game
    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        startGame();
    });

    // Restart Game
    restartButton.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        startGame();
    });

    // Pause Button
    pauseButton.addEventListener('click', () => {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? "▶️ Resume" : "⏸️ Pause";
    });

    // Arrow Buttons
    leftBtn.addEventListener('mousedown', () => moveLeft = true);
    leftBtn.addEventListener('mouseup', () => moveLeft = false);
    rightBtn.addEventListener('mousedown', () => moveRight = true);
    rightBtn.addEventListener('mouseup', () => moveRight = false);

    // Keyboard arrows
    document.addEventListener('keydown', (e) => {
        if (e.key === "ArrowLeft") moveLeft = true;
        if (e.key === "ArrowRight") moveRight = true;
    });
    document.addEventListener('keyup', (e) => {
        if (e.key === "ArrowLeft") moveLeft = false;
        if (e.key === "ArrowRight") moveRight = false;
    });

    // Drag basket
    let isDragging = false;
    basket.addEventListener('mousedown', () => isDragging = true);
    basket.addEventListener('mouseup', () => isDragging = false);
    basket.addEventListener('mousemove', (e) => {
        if (isDragging) {
            basketPos = e.clientX - basket.offsetWidth/2;
            moveBasket();
        }
    });
    basket.addEventListener('touchstart', () => isDragging = true);
    basket.addEventListener('touchend', () => isDragging = false);
    basket.addEventListener('touchmove', (e) => {
        if (isDragging) {
            basketPos = e.touches[0].clientX - basket.offsetWidth/2;
            moveBasket();
        }
    });

    // Start the game
    function startGame() {
        score = 0;
        scoreElement.textContent = score;
        gamePaused = false;
        pauseButton.textContent = "⏸️ Pause";
        fallingItems.forEach(item => item.element.remove());
        fallingItems = [];

        // Spawn fruits and bombs
        fruitInterval = setInterval(spawnItem, 1000);

        // Game loop
        gameInterval = requestAnimationFrame(updateGame);
    }

    // Move basket
    function moveBasket() {
        if (basketPos < 0) basketPos = 0;
        if (basketPos > gameContainer.offsetWidth - basket.offsetWidth) basketPos = gameContainer.offsetWidth - basket.offsetWidth;
        basket.style.left = basketPos + "px";
    }

    // Spawn fruits/bombs
    function spawnItem() {
        const isBomb = Math.random() < 0.2; // 20% chance bomb
        const emoji = isBomb ? bombs[Math.floor(Math.random()*bombs.length)] : fruits[Math.floor(Math.random()*fruits.length)];
        const item = document.createElement('div');
        item.classList.add(isBomb ? 'bomb' : 'fruit');
        item.textContent = emoji;
        item.style.left = Math.random() * (gameContainer.offsetWidth - 30) + "px";
        gameContainer.appendChild(item);

        fallingItems.push({element: item, isBomb: isBomb, y: 0, speed: 2 + score*0.1}); // increase speed as score increases
    }

    // Update Game Loop
    function updateGame() {
        if (!gamePaused) {
            // Move basket with arrow keys
            if (moveLeft) basketPos -= 10;
            if (moveRight) basketPos += 10;
            moveBasket();

            // Move fruits/bombs
            fallingItems.forEach((itemObj, index) => {
                itemObj.y += itemObj.speed;
                itemObj.element.style.top = itemObj.y + "px";

                // Check collision with basket
                const basketRect = basket.getBoundingClientRect();
                const itemRect = itemObj.element.getBoundingClientRect();
                if (!(basketRect.right < itemRect.left || basketRect.left > itemRect.right || basketRect.bottom < itemRect.top || basketRect.top > itemRect.bottom)) {
                    if (itemObj.isBomb) {
                        endGame();
                    } else {
                        score++;
                        scoreElement.textContent = score;
                        // Remove fruit
                        itemObj.element.remove();
                        fallingItems.splice(index,1);
                    }
                }

                // Remove items if off-screen
                if (itemObj.y > gameContainer.offsetHeight) {
                    itemObj.element.remove();
                    fallingItems.splice(index,1);
                }
            });
        }
        requestAnimationFrame(updateGame);
    }

    // End Game
    function endGame() {
        cancelAnimationFrame(gameInterval);
        clearInterval(fruitInterval);
        finalScore.textContent = score;

        if (score > topScore) {
            topScore = score;
            localStorage.setItem('topScore', topScore);
        }
        finalTopScore.textContent = topScore;

        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
    }
});
