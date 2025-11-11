const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over');
const gameArea = document.getElementById('game-area');
const basket = document.getElementById('basket');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const finalScore = document.getElementById('final-score');
const finalHigh = document.getElementById('final-high');
const muteBtn = document.getElementById('mute-btn');

const bgMusic = document.getElementById('bg-music');
const fruitSound = document.getElementById('fruit-sound');
const bombSound = document.getElementById('bomb-sound');

let score = 0;
let highScore = localStorage.getItem('fruitHighScore') || 0;
let speed = 3;
let gameRunning = false;
let isMuted = false;
let spawnInterval;

highScoreDisplay.textContent = highScore;

// 🕹 Start Game
document.getElementById('start-btn').onclick = () => {
  startScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startGame();
};

// 🔁 Restart Game
document.getElementById('restart-btn').onclick = () => {
  gameOverScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startGame();
};

// 🔇 Mute/Unmute
muteBtn.onclick = () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? '🔇' : '🔊';
  if (isMuted) bgMusic.pause();
  else bgMusic.play();
};

// 🎮 Start Function
function startGame() {
  gameArea.innerHTML = '<div id="basket">🧺</div>';
  const newBasket = document.getElementById('basket');
  Object.assign(basket, newBasket);
  
  score = 0;
  speed = 3;
  scoreDisplay.textContent = score;
  gameRunning = true;
  bgMusic.currentTime = 0;
  if (!isMuted) bgMusic.play();

  spawnInterval = setInterval(spawnFalling, 1000 / (speed / 2));
  requestAnimationFrame(updateGame);
}

// 🍓 Spawn Fruits and Bombs
function spawnFalling() {
  const item = document.createElement('div');
  item.classList.add('falling');
  const isBomb = Math.random() < 0.2;
  item.textContent = isBomb ? '💣' : ['🍎','🍓','🍌','🍉','🍒'][Math.floor(Math.random()*5)];
  item.dataset.type = isBomb ? 'bomb' : 'fruit';
  item.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
  item.style.top = '-40px';
  gameArea.appendChild(item);
}

// ⚡ Update Game
function updateGame() {
  if (!gameRunning) return;
  const fallingItems = document.querySelectorAll('.falling');
  const basketRect = basket.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();

  fallingItems.forEach(item => {
    item.style.top = parseFloat(item.style.top) + speed + 'px';
    const itemRect = item.getBoundingClientRect();
    
    if (
      itemRect.bottom >= basketRect.top &&
      itemRect.left < basketRect.right &&
      itemRect.right > basketRect.left &&
      itemRect.bottom <= areaRect.bottom
    ) {
      if (item.dataset.type === 'fruit') {
        score++;
        scoreDisplay.textContent = score;
        if (score % 5 === 0) speed += 0.5;
        if (!isMuted) fruitSound.play();
      } else {
        if (!isMuted) bombSound.play();
        endGame();
      }
      item.remove();
    }

    if (parseFloat(item.style.top) > areaRect.height) item.remove();
  });

  requestAnimationFrame(updateGame);
}

// ❌ End Game
function endGame() {
  gameRunning = false;
  clearInterval(spawnInterval);
  bgMusic.pause();
  
  if (score > highScore) {
    highScore = score;
    localStorage.setItem('fruitHighScore', highScore);
  }

  finalScore.textContent = score;
  finalHigh.textContent = highScore;
  highScoreDisplay.textContent = highScore;

  gameScreen.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
}

// 🎮 Basket Controls (Keyboard + Touch)
let moveX = 0;

document.addEventListener('keydown', (e) => {
  const rect = basket.getBoundingClientRect();
  if (e.key === 'ArrowLeft' && rect.left > gameArea.getBoundingClientRect().left) {
    basket.style.left = rect.left - 30 - gameArea.getBoundingClientRect().left + 'px';
  }
  if (e.key === 'ArrowRight' && rect.right < gameArea.getBoundingClientRect().right) {
    basket.style.left = rect.left + 30 - gameArea.getBoundingClientRect().left + 'px';
  }
});

gameArea.addEventListener('touchmove', (e) => {
  e.preventDefault();
  const touch = e.touches[0];
  const rect = gameArea.getBoundingClientRect();
  let x = touch.clientX - rect.left - basket.offsetWidth / 2;
  x = Math.max(0, Math.min(rect.width - basket.offsetWidth, x));
  basket.style.left = x + 'px';
}, { passive: false });
