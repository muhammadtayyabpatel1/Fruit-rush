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
const pauseBtn = document.getElementById('pause-btn');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

const bgMusic = document.getElementById('bg-music');
const fruitSound = document.getElementById('fruit-sound');
const bombSound = document.getElementById('bomb-sound');

let score = 0;
let highScore = localStorage.getItem('fruitHighScore') || 0;
let speed = 3;
let gameRunning = false;
let isMuted = false;
let isPaused = false;
let moveLeft = false;
let moveRight = false;
let spawnInterval;

highScoreDisplay.textContent = highScore;

// Start Game
document.getElementById('start-btn').onclick = startGame;
document.getElementById('restart-btn').onclick = restartGame;
muteBtn.onclick = toggleMute;
pauseBtn.onclick = togglePause;

// On-screen buttons
leftBtn.addEventListener('touchstart',()=>moveLeft=true);
leftBtn.addEventListener('touchend',()=>moveLeft=false);
rightBtn.addEventListener('touchstart',()=>moveRight=true);
rightBtn.addEventListener('touchend',()=>moveRight=false);
leftBtn.addEventListener('mousedown',()=>moveLeft=true);
leftBtn.addEventListener('mouseup',()=>moveLeft=false);
rightBtn.addEventListener('mousedown',()=>moveRight=true);
rightBtn.addEventListener('mouseup',()=>moveRight=false);

// Keyboard
document.addEventListener('keydown', e=>{
  const rect = basket.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();
  if(e.key==='ArrowLeft' && rect.left>areaRect.left) basket.style.left = rect.left - areaRect.left - 30 + 'px';
  if(e.key==='ArrowRight' && rect.right<areaRect.right) basket.style.left = rect.left - areaRect.left + 30 + 'px';
});

// Drag/Touch
gameArea.addEventListener('mousemove', e=>{
  const rect = gameArea.getBoundingClientRect();
  let x = e.clientX - rect.left - basket.offsetWidth/2;
  x = Math.max(0, Math.min(rect.width - basket.offsetWidth, x));
  basket.style.left = x + 'px';
});
gameArea.addEventListener('touchmove', e=>{
  e.preventDefault();
  const touch = e.touches[0];
  const rect = gameArea.getBoundingClientRect();
  let x = touch.clientX - rect.left - basket.offsetWidth/2;
  x = Math.max(0, Math.min(rect.width - basket.offsetWidth, x));
  basket.style.left = x + 'px';
},{passive:false});

function startGame(){
  gameArea.innerHTML = '<div id="basket">🧺</div><div id="controls"><button id="left-btn">◀️</button><button id="right-btn">▶️</button></div>';
  Object.assign(basket,document.getElementById('basket'));
  score = 0;
  speed = 3;
  scoreDisplay.textContent = score;
  gameRunning = true;
  isPaused = false;
  if(!isMuted) bgMusic.play().catch(()=>{});
  spawnInterval = setInterval(spawnFalling, 1000/(speed/2));
  requestAnimationFrame(updateGame);
}

function restartGame(){
  gameOverScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  startGame();
}

function toggleMute(){
  isMuted = !isMuted;
  if(isMuted){ bgMusic.pause(); muteBtn.textContent='🔇'; }
  else{ bgMusic.play().catch(()=>{}); muteBtn.textContent='🔊'; }
}

function togglePause(){
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused?'▶️':'⏸️';
}

function spawnFalling(){
  const item = document.createElement('div');
  item.classList.add('falling');
  const isBomb = Math.random()<0.2;
  item.dataset.type = isBomb?'bomb':'fruit';
  item.textContent = isBomb?'💣':['🍎','🍓','🍌','🍉','🍒'][Math.floor(Math.random()*5)];
  item.style.left = Math.random()*(gameArea.offsetWidth-30)+'px';
  item.style.top = '-40px';
  gameArea.appendChild(item);
}

function updateGame(){
  if(!gameRunning){ return; }
  if(isPaused){ requestAnimationFrame(updateGame); return; }

  const items = document.querySelectorAll('.falling');
  const basketRect = basket.getBoundingClientRect();
  const areaRect = gameArea.getBoundingClientRect();

  items.forEach(item=>{
    item.style.top = parseFloat(item.style.top)+speed+'px';
    const itemRect = item.getBoundingClientRect();

    if(itemRect.bottom>=basketRect.top && itemRect.left<basketRect.right && itemRect.right>basketRect.left){
      if(item.dataset.type==='fruit'){
        score++; scoreDisplay.textContent=score;
        if(score%5===0) speed+=0.5;
        if(!isMuted){ fruitSound.currentTime=0; fruitSound.play(); }
      } else {
        if(!isMuted){ bombSound.currentTime=0; bombSound.play(); }
        endGame();
      }
      item.remove();
    }

    if(parseFloat(item.style.top)>areaRect.height) item.remove();
  });

  // Move basket with buttons
  const basketX = parseFloat(basket.style.left);
  if(moveLeft) basket.style.left = Math.max(0, basketX-8)+'px';
  if(moveRight) basket.style.left = Math.min(gameArea.offsetWidth-basket.offsetWidth, basketX+8)+'px';

  requestAnimationFrame(updateGame);
}

function endGame(){
  gameRunning=false;
  clearInterval(spawnInterval);
  bgMusic.pause();
  if(score>highScore){ highScore=score; localStorage.setItem('fruitHighScore',highScore);}
  finalScore.textContent=score;
  finalHigh.textContent=highScore;
  highScoreDisplay.textContent=highScore;
  gameScreen.classList.add('hidden');
  gameOverScreen.classList.remove('hidden');
}
