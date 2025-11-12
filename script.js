// Elements & state
const startScreen     = document.getElementById('startScreen');
const gameScreen      = document.getElementById('gameScreen');
const gameOverScreen  = document.getElementById('gameOverScreen');
const startBtn        = document.getElementById('startBtn');
const restartBtn      = document.getElementById('restartBtn');
const scoreEl         = document.getElementById('score');
const highScoreEl     = document.getElementById('highScore');
const finalScoreEl    = document.getElementById('finalScore');
const basket          = document.getElementById('basket');
const gameArea        = document.getElementById('gameArea');
const muteBtn         = document.getElementById('muteBtn');
const pauseBtn        = document.getElementById('pauseBtn');
const leftBtn         = document.getElementById('leftBtn');
const rightBtn        = document.getElementById('rightBtn');

const bgMusic    = document.getElementById('bgMusic');
const fruitSound = document.getElementById('fruitSound');
const bombSound  = document.getElementById('bombSound');

let score       = 0;
let highScore   = localStorage.getItem('highScore') || 0;
highScoreEl.textContent = highScore;

let gameInterval, spawnInterval;
let speed       = 2;
let isMuted     = false;
let isPaused    = false;
let moveLeft    = false;
let moveRight   = false;

// Event listeners
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', restartGame);
muteBtn.addEventListener('click', toggleMute);
pauseBtn.addEventListener('click', togglePause);

// On-screen buttons
leftBtn.addEventListener('touchstart', () => moveLeft = true);
leftBtn.addEventListener('touchend',   () => moveLeft = false);
rightBtn.addEventListener('touchstart',() => moveRight= true);
rightBtn.addEventListener('touchend',  () => moveRight= false);
leftBtn.addEventListener('mousedown',  () => moveLeft = true);
leftBtn.addEventListener('mouseup',    () => moveLeft = false);
rightBtn.addEventListener('mousedown', () => moveRight= true);
rightBtn.addEventListener('mouseup',   () => moveRight= false);

// Drag / mouse / keyboard
gameArea.addEventListener('mousemove', basketMove);
gameArea.addEventListener('touchmove', basketMoveTouch, {passive:false});
document.addEventListener('keydown', arrowMove);

// --- Game functions ---
function startGame() {
  startScreen.classList.add('hidden');
  gameOverScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');

  score = 0;
  speed = 2;
  scoreEl.textContent = score;
  highScore = localStorage.getItem('highScore') || 0;
  highScoreEl.textContent = highScore;

  if (!isMuted) {
    bgMusic.currentTime = 0;
    bgMusic.play().catch(e => {}); // handle autoplay restrictions
  }

  basket.style.left = (gameArea.offsetWidth/2 - basket.offsetWidth/2) + 'px';

  spawnInterval = setInterval(spawnFalling, 1000);
  gameInterval = requestAnimationFrame(gameLoop);
}

function gameLoop() {
  if (isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const items = document.querySelectorAll('.falling');
  items.forEach(item => {
    let topPos = parseFloat(item.style.top);
    topPos += speed;
    item.style.top = topPos + 'px';

    const basketRect = basket.getBoundingClientRect();
    const itemRect   = item.getBoundingClientRect();

    // Collision
    if (
      itemRect.bottom >= basketRect.top &&
      itemRect.right > basketRect.left &&
      itemRect.left < basketRect.right
    ) {
      if (item.classList.contains('fruit')) {
        score++;
        scoreEl.textContent = score;
        if (!isMuted) { fruitSound.currentTime = 0; fruitSound.play(); }
        item.remove();
        speed = 2 + Math.floor(score/5); // Increase difficulty
      } else if (item.classList.contains('bomb')) {
        if (!isMuted) { bombSound.currentTime = 0; bombSound.play(); }
        endGame();
      }
    }

    if (topPos > gameArea.offsetHeight) {
      item.remove();
    }
  });

  // Left/Right buttons
  if (moveLeft) moveBasketBy(-8);
  if (moveRight) moveBasketBy(8);

  requestAnimationFrame(gameLoop);
}

function spawnFalling() {
  const item = document.createElement('div');
  const isBomb = Math.random() < 0.2; // 20% bombs
  item.classList.add('falling', isBomb ? 'bomb' : 'fruit');
  item.style.left = Math.random() * (gameArea.offsetWidth - 30) + 'px';
  item.style.top  = '-30px';
  item.textContent = isBomb ? '💣' : ['🍎','🍓','🍊','🍌'][Math.floor(Math.random()*4)];
  gameArea.appendChild(item);
}

function endGame() {
  clearInterval(spawnInterval);
  gameScreen.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
  finalScoreEl.textContent = score;

  if (score > highScore) {
    highScore = score;
    localStorage.setItem('highScore', highScore);
  }
}

function restartGame() {
  startScreen.classList.remove('hidden');
}

function basketMove(e) {
  const rect = gameArea.getBoundingClientRect();
  let x = e.clientX - rect.left - basket.offsetWidth/2;
  x = Math.max(0, Math.min(x, gameArea.offsetWidth - basket.offsetWidth));
  basket.style.left = x + 'px';
}

function basketMoveTouch(e) {
  e.preventDefault();
  const rect = gameArea.getBoundingClientRect();
  let touch = e.touches[0];
  let x = touch.clientX - rect.left - basket.offsetWidth/2;
  x = Math.max(0, Math.min(x, gameArea.offsetWidth - basket.offsetWidth));
  basket.style.left = x + 'px';
}

function arrowMove(e) {
  let x = parseFloat(basket.style.left);
  if (e.key === 'ArrowLeft' || e.key === 'a') x -= 30;
  if (e.key === 'ArrowRight' || e.key === 'd') x += 30;
  x = Math.max(0, Math.min(x, gameArea.offsetWidth - basket.offsetWidth));
  basket.style.left = x + 'px';
}

function moveBasketBy(delta) {
  let x = parseFloat(basket.style.left) + delta;
  x = Math.max(0, Math.min(x, gameArea.offsetWidth - basket.offsetWidth));
  basket.style.left = x + 'px';
}

function toggleMute() {
  isMuted = !isMuted;
  if (isMuted) {
    bgMusic.pause();
    muteBtn.textContent = '🔇';
  } else {
    bgMusic.play().catch(e=>{});
    muteBtn.textContent = '🔊';
  }
}

function togglePause() {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? '▶️' : '⏸️';
}
