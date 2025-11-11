// Elements & state
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const finalScoreEl = document.getElementById('finalScore');
const basket = document.getElementById('basket');
const gameArea = document.getElementById('gameArea');
const muteBtn = document.getElementById('muteBtn');
const bgMusic = document.getElementById('bgMusic');
const fruitSound = document.getElementById('fruitSound');
const bombSound = document.getElementById('bombSound');

let score = 0;
let highScore = localStorage.getItem('highScore') || 0;
highScoreEl.textContent = highScore;

let gameInterval;
let spawnInterval;
let speed = 2;
let isMuted = false;

// Start game
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
muteBtn.addEventListener('click', toggleMute);

function startGame() {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  score = 0;
  speed = 2;
  scoreEl.textContent = score;
  loadHighScore();
  bgMusic.currentTime = 0;
  if (!isMuted) bgMusic.play();

  basket.style.left = (gameArea.offsetWidth / 2 - basket.offsetWidth/2) + 'px';

  gameArea.addEventListener('mousemove', basketMove);
  gameArea.addEventListener('touchmove', basketMoveTouch, {passive:false});
  document.addEventListener('keydown', arrowMove);

  spawnInterval = setInterval(spawnFalling, 1000);
  gameInterval = requestAnimationFrame(gameLoop);
}

function gameLoop() {
  // move falling items
  const fallItems = document.querySelectorAll('.falling');
  fallItems.forEach(item => {
    let top = parseFloat(item.style.top);
    top += speed;
    item.style.top = top + 'px';

    // if catches
    if (top + item.offsetHeight >= gameArea.offsetHeight - 20) {
      const basketLeft = basket.getBoundingClientRect().left;
      const basketRight = basketLeft + basket.offsetWidth;
      const itemLeft = item.getBoundingClientRect().left;
      const itemRight = itemLeft + item.offsetWidth;

      if (itemRight > basketLeft && itemLeft < basketRight) {
        if (item.classList.contains('fruit')) {
          score++;
          scoreEl.textContent = score;
          if (!isMuted) fruitSound.play();
          item.remove();
          speed = 2 + Math.floor(score/5);  // increase speed every 5 fruits
        } else if (item.classList.contains('bomb')) {
          if (!isMuted) bombSound.play();
          endGame();
        }
      } else if (top >= gameArea.offsetHeight) {
        // missed item goes off bottom
        item.remove();
      }
    }

    // Clean up beyond bottom
    if (top > gameArea.offsetHeight + 50) {
      item.remove();
    }
  });

  if (!gameScreen.classList.contains('hidden')) {
    requestAnimationFrame(gameLoop);
  }
}

function spawnFalling() {
  const item = document.createElement('div');
  const isBomb = Math.random() < 0.2;  // 20% chance bomb
  item.classList.add('falling');
  item.classList.add(isBomb ? 'bomb' : 'fruit');
  item.style.left = Math.random() * (gameArea.offsetWidth - 40) + 'px';
  item.style.top = '-40px';
  gameArea.appendChild(item);
}

function endGame() {
  cancelAnimationFrame(gameInterval);
  clearInterval(spawnInterval);
  bgMusic.pause();
  gameScreen.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
  finalScoreEl.textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
  highScoreEl.textContent = highScore;
}

function restartGame() {
  gameOverScreen.classList.add('hidden');
  startScreen.classList.remove('hidden');
}

function basketMove(e) {
  const rect = gameArea.getBoundingClientRect();
  let x = e.clientX - rect.left - basket.offsetWidth/2;
  if (x < 0) x = 0;
  if (x > gameArea.offsetWidth - basket.offsetWidth) {
    x = gameArea.offsetWidth - basket.offsetWidth;
  }
  basket.style.left = x + 'px';
}

function basketMoveTouch(e) {
  e.preventDefault();
  const rect = gameArea.getBoundingClientRect();
  let touch = e.touches[0];
  let x = touch.clientX - rect.left - basket.offsetWidth/2;
  if (x < 0) x = 0;
  if (x > gameArea.offsetWidth - basket.offsetWidth) {
    x = gameArea.offsetWidth - basket.offsetWidth;
  }
  basket.style.left = x + 'px';
}

function arrowMove(e) {
  const key = e.key;
  let x = parseFloat(basket.style.left);
  if (key === 'ArrowLeft' || key === 'a') {
    x -= 30;
  } else if (key === 'ArrowRight' || key === 'd') {
    x += 30;
  } else {
    return;
  }
  if (x < 0) x = 0;
  if (x > gameArea.offsetWidth - basket.offsetWidth) {
    x = gameArea.offsetWidth - basket.offsetWidth;
  }
  basket.style.left = x + 'px';
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    bgMusic.pause();
    muteBtn.textContent = '🔇';
  } else {
    bgMusic.play();
    muteBtn.textContent = '🔊';
  }
}

function loadHighScore() {
  highScore = localStorage.getItem('highScore') || 0;
  highScoreEl.textContent = highScore;
}
