document.addEventListener('DOMContentLoaded', () => {
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

    const bgMusic = document.getElementById('bg-music');
    const soundFruit = document.getElementById('sound-fruit');
    const soundBomb = document.getElementById('sound-bomb');

    let score = 0;
    let topScore = localStorage.getItem('topScore') || 0;
    topScoreElement.textContent = topScore;
    let gameInterval;
    let fruitInterval;
    let gamePaused = false;

    let basketPos = 0;
    let moveLeft = false;
    let moveRight = false;

    const fruits = ["🍎", "🍌", "🍓", "🍇", "🍊"];
    const bombs = ["💣"];
    let fallingItems = [];

    // Make game container focusable for arrow keys
    gameContainer.setAttribute('tabindex', '0');

    // Start game
    startButton.addEventListener('click', () => {
        startScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameContainer.focus();
        bgMusic.currentTime = 0;
        bgMusic.play().catch(err => console.log("Autoplay blocked:", err));
        startGame();
    });

    // Restart game
    restartButton.addEventListener('click', () => {
        gameOverScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        gameContainer.focus();
        startGame();
    });

    // Pause Button: stops movement but not music
    pauseButton.addEventListener('click', () => {
        gamePaused = !gamePaused;
        pauseButton.textContent = gamePaused ? "▶️ Resume" : "⏸️ Pause";
    });

    // Arrow Buttons
    function addButtonListeners(btn, dir) {
        btn.addEventListener('mousedown', () => dir === 'left' ? moveLeft = true : moveRight = true);
        btn.addEventListener('mouseup', () => moveLeft = moveRight = false);
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); dir === 'left' ? moveLeft = true : moveRight = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); moveLeft = moveRight = false; });
    }
    addButtonListeners(leftBtn, 'left');
    addButtonListeners(rightBtn, 'right');

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
    function startDrag() { isDragging = true; }
    function stopDrag() { isDragging = false; }
    function dragMove(x) {
        basketPos = x - basket.offsetWidth / 2;
        if (basketPos < 0) basketPos = 0;
        if (basketPos > gameContainer.offsetWidth - basket.offsetWidth) basketPos = gameContainer.offsetWidth - basket.offsetWidth;
        basket.style.left = basketPos + "px";
    }

    basket.addEventListener('mousedown', startDrag);
    basket.addEventListener('mouseup', stopDrag);
    basket.addEventListener('mouseleave', stopDrag);
    basket.addEventListener('mousemove', (e) => { if(isDragging) dragMove(e.clientX); });
    basket.addEventListener('touchstart', startDrag);
    basket.addEventListener('touchend', stopDrag);
    basket.addEventListener('touchmove', (e) => { e.preventDefault(); if(isDragging) dragMove(e.touches[0].clientX); });

    function startGame() {
        score = 0;
        scoreElement.textContent = score;
        gamePaused = false;
        pauseButton.textContent = "⏸️ Pause";
        basketPos = gameContainer.offsetWidth / 2;
        dragMove(basketPos + basket.offsetWidth/2);

        fallingItems.forEach(item => item.element.remove());
        fallingItems = [];

        fruitInterval = setInterval(spawnItem, 1000);
        gameInterval = requestAnimationFrame(updateGame);
    }

    function spawnItem() {
        const isBomb = Math.random() < 0.2;
        const emoji = isBomb ? bombs[Math.floor(Math.random()*bombs.length)] : fruits[Math.floor(Math.random()*fruits.length)];
        const item = document.createElement('div');
        item.classList.add(isBomb ? 'bomb' : 'fruit');
        item.textContent = emoji;
        item.style.left = Math.random() * (gameContainer.offsetWidth - 30) + "px";
        gameContainer.appendChild(item);
        fallingItems.push({element: item, isBomb: isBomb, y: 0, speed: 2 + score*0.1});
    }

    function updateGame() {
        if(!gamePaused){
            // Move basket
            if(moveLeft) basketPos -= 10;
            if(moveRight) basketPos += 10;
            dragMove(basketPos + basket.offsetWidth/2);

            fallingItems.forEach((itemObj, index) => {
                itemObj.y += itemObj.speed;
                itemObj.element.style.top = itemObj.y + "px";

                const basketRect = basket.getBoundingClientRect();
                const itemRect = itemObj.element.getBoundingClientRect();
                if(!(basketRect.right < itemRect.left || basketRect.left > itemRect.right || basketRect.bottom < itemRect.top || basketRect.top > itemRect.bottom)){
                    if(itemObj.isBomb){
                        soundBomb.currentTime = 0;
                        soundBomb.play();
                        endGame();
                    }
                    else {
                        score++;
                        scoreElement.textContent = score;
                        soundFruit.currentTime = 0;
                        soundFruit.play();
                        itemObj.element.remove();
                        fallingItems.splice(index,1);
                    }
                }

                if(itemObj.y > gameContainer.offsetHeight){
                    itemObj.element.remove();
                    fallingItems.splice(index,1);
                }
            });
        }
        requestAnimationFrame(updateGame);
    }

    function endGame(){
        cancelAnimationFrame(gameInterval);
        clearInterval(fruitInterval);
        finalScore.textContent = score;

        if(score > topScore){
            topScore = score;
            localStorage.setItem('topScore', topScore);
        }
        finalTopScore.textContent = topScore;

        gameScreen.classList.add('hidden');
        gameOverScreen.classList.remove('hidden');
    }

    // Stop bg music when tab is closed or navigated away
    window.addEventListener('beforeunload', () => {
        bgMusic.pause();
    });
});
