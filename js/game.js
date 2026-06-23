/**
 * 貪吃蛇 Snake — game.js
 * ─────────────────────────────────────────────────────────────
 * Features:
 *  • 25×25 wrap-around grid
 *  • Four speed modes (slow / normal / fast / turbo)
 *  • Level-up every 5 segments eaten → speed increases
 *  • Bonus food (gold) spawns every 7 segments, 5-second timer
 *  • Best score persisted to localStorage
 *  • Keyboard (arrows / WASD), D-pad buttons, swipe gestures
 *  • Pause (P key), Quit (Esc)
 */

(() => {
  'use strict';

  // ── Constants ────────────────────────────────────────────
  const COLS = 25;
  const ROWS = 25;

  /** Compute cell size to fit viewport */
  function calcCell() {
    const maxPx = Math.min(window.innerWidth - 32, 620);
    return Math.max(14, Math.min(24, Math.floor(maxPx / COLS)));
  }

  const SPEEDS = {
    slow:   200,
    normal: 130,
    fast:   80,
    turbo:  45,
  };

  const SCORE_FOOD  = 10;   // multiplied by level
  const SCORE_BONUS = 50;   // multiplied by level
  const BONUS_DURATION = 5000; // ms

  // ── Canvas setup ─────────────────────────────────────────
  const canvas = document.getElementById('game');
  const ctx    = canvas.getContext('2d');

  let CELL = calcCell();
  function resizeCanvas() {
    CELL = calcCell();
    canvas.width  = COLS * CELL;
    canvas.height = ROWS * CELL;
    if (!running) drawIdleScreen();
    else draw();
  }
  resizeCanvas();

  // ── DOM refs ──────────────────────────────────────────────
  const scoreEl    = document.getElementById('score');
  const bestEl     = document.getElementById('best');
  const lengthEl   = document.getElementById('length');
  const levelEl    = document.getElementById('level');
  const finalScore = document.getElementById('finalScore');
  const goMessage  = document.getElementById('goMessage');

  const startOverlay    = document.getElementById('startOverlay');
  const gameoverOverlay = document.getElementById('gameoverOverlay');
  const pauseOverlay    = document.getElementById('pauseOverlay');

  // ── Game state ────────────────────────────────────────────
  let snake, dir, nextDir;
  let food, bonus;
  let score, bestScore, level;
  let bonusActive, bonusTimerId;
  let frameSpeed;
  let running, paused;
  let loopId;
  let eatenCount; // tracks segments eaten for level/bonus triggers

  let chosenSpeed = 'normal';

  bestScore = parseInt(localStorage.getItem('snakeBest') || '0', 10);
  bestEl.textContent = bestScore;

  // ── Helpers ───────────────────────────────────────────────
  const rnd  = n => Math.floor(Math.random() * n);
  const same = (a, b) => a.x === b.x && a.y === b.y;
  const onSnake = pos => snake.some(s => same(s, pos));

  function placeFood() {
    let p;
    do { p = { x: rnd(COLS), y: rnd(ROWS) }; }
    while (onSnake(p) || (bonusActive && bonus && same(p, bonus)));
    food = p;
  }

  function placeBonus() {
    if (bonusActive) return;
    let p;
    do { p = { x: rnd(COLS), y: rnd(ROWS) }; }
    while (onSnake(p) || same(p, food));
    bonus = p;
    bonusActive = true;
    clearTimeout(bonusTimerId);
    bonusTimerId = setTimeout(() => { bonusActive = false; bonus = null; }, BONUS_DURATION);
  }

  // ── Init ──────────────────────────────────────────────────
  function init() {
    const cx = Math.floor(COLS / 2);
    const cy = Math.floor(ROWS / 2);
    snake   = [{ x: cx, y: cy }, { x: cx - 1, y: cy }, { x: cx - 2, y: cy }];
    dir     = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    score   = 0;
    level   = 1;
    eatenCount = 0;
    bonusActive = false;
    bonus = null;
    clearTimeout(bonusTimerId);
    frameSpeed = SPEEDS[chosenSpeed];
    placeFood();
    updateHUD();
  }

  // ── Game tick ─────────────────────────────────────────────
  function tick() {
    dir = { ...nextDir };

    const head = {
      x: (snake[0].x + dir.x + COLS) % COLS,
      y: (snake[0].y + dir.y + ROWS) % ROWS,
    };

    // Self-collision check (skip index 0 = current head)
    if (snake.some((s, i) => i > 0 && same(s, head))) {
      endGame();
      return;
    }

    snake.unshift(head);

    let grew = false;

    if (same(head, food)) {
      score += SCORE_FOOD * level;
      eatenCount++;
      grew = true;

      // Level up every 5 segments
      if (eatenCount % 5 === 0) {
        level++;
        frameSpeed = Math.max(38, frameSpeed - 10);
      }
      // Bonus every 7 segments
      if (eatenCount % 7 === 0) placeBonus();

      placeFood();
      flashHUD('score');

    } else if (bonusActive && bonus && same(head, bonus)) {
      score += SCORE_BONUS * level;
      bonusActive = false;
      bonus = null;
      clearTimeout(bonusTimerId);
      grew = true; // eating bonus also grows
      flashHUD('score');
    }

    if (!grew) snake.pop();

    // Update best
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem('snakeBest', bestScore);
    }

    updateHUD();
    draw();

    loopId = setTimeout(tick, frameSpeed);
  }

  // ── HUD ───────────────────────────────────────────────────
  function updateHUD() {
    scoreEl.textContent  = score;
    bestEl.textContent   = bestScore;
    lengthEl.textContent = snake.length;
    levelEl.textContent  = level;
  }

  function flashHUD(id) {
    const el = document.getElementById(id);
    el.classList.add('flash');
    setTimeout(() => el.classList.remove('flash'), 320);
  }

  // ── Draw ──────────────────────────────────────────────────
  function draw() {
    const C = CELL;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid dots
    ctx.fillStyle = '#111a24';
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x * C + C / 2 - 0.5, y * C + C / 2 - 0.5, 1, 1);

    // Food
    drawCell(food.x, food.y, '#ff2d55', '#ff2d5580', true);

    // Bonus (pulsing)
    if (bonusActive && bonus) {
      const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 140);
      drawCell(bonus.x, bonus.y, '#ffd60a', `rgba(255,214,10,${(pulse * 0.55).toFixed(2)})`, true, pulse);
    }

    // Snake body (fade tail)
    for (let i = snake.length - 1; i >= 1; i--) {
      const alpha = 0.35 + 0.65 * (1 - i / snake.length);
      ctx.globalAlpha = alpha;
      drawCell(snake[i].x, snake[i].y, '#1aab00', '#1aab0050', false);
    }
    ctx.globalAlpha = 1;

    // Snake head
    drawCell(snake[0].x, snake[0].y, '#39ff14', '#39ff1460', false, 1, true);
  }

  /**
   * @param {number}  gx, gy  — grid coordinates
   * @param {string}  fill    — fill color
   * @param {string}  glow    — shadow color
   * @param {boolean} round   — pill shape
   * @param {number}  scale   — 0–1 size scale (for pulse)
   * @param {boolean} isHead  — tighter padding
   */
  function drawCell(gx, gy, fill, glow, round = false, scale = 1, isHead = false) {
    const C   = CELL;
    const pad = isHead ? 1 : 2;
    const sz  = (C - pad * 2) * scale;
    const x   = gx * C + pad + (C - pad * 2 - sz) / 2;
    const y   = gy * C + pad + (C - pad * 2 - sz) / 2;
    const r   = round ? sz / 2 : 3;

    ctx.shadowColor = glow;
    ctx.shadowBlur  = isHead ? 14 : 7;
    ctx.fillStyle   = fill;
    ctx.beginPath();
    ctx.roundRect(x, y, sz, sz, r);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function drawIdleScreen() {
    const C = CELL;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111a24';
    for (let x = 0; x < COLS; x++)
      for (let y = 0; y < ROWS; y++)
        ctx.fillRect(x * C + C / 2 - 0.5, y * C + C / 2 - 0.5, 1, 1);
  }

  // ── Game flow ─────────────────────────────────────────────
  function startGame() {
    hide(startOverlay);
    hide(gameoverOverlay);
    hide(pauseOverlay);
    init();
    running = true;
    paused  = false;
    loopId  = setTimeout(tick, frameSpeed);
    draw();
  }

  function endGame() {
    clearTimeout(loopId);
    running = false;
    bonusActive = false;
    clearTimeout(bonusTimerId);

    finalScore.textContent = score;
    if (score > 0 && score >= bestScore) {
      goMessage.textContent = '🎉 新紀錄！恭喜！';
    } else if (score >= 300) {
      goMessage.textContent = '表現優秀，繼續挑戰！';
    } else if (score >= 100) {
      goMessage.textContent = '不錯喔，再接再厲！';
    } else {
      goMessage.textContent = '繼續加油！';
    }
    show(gameoverOverlay);
  }

  function togglePause() {
    if (!running) return;
    paused = !paused;
    if (paused) {
      clearTimeout(loopId);
      show(pauseOverlay);
    } else {
      hide(pauseOverlay);
      loopId = setTimeout(tick, frameSpeed);
    }
  }

  const show = el => el.classList.remove('hidden');
  const hide = el => el.classList.add('hidden');

  // ── Direction ─────────────────────────────────────────────
  const DIR_MAP = {
    ArrowUp:    { x:  0, y: -1 },
    ArrowDown:  { x:  0, y:  1 },
    ArrowLeft:  { x: -1, y:  0 },
    ArrowRight: { x:  1, y:  0 },
    w:          { x:  0, y: -1 },
    s:          { x:  0, y:  1 },
    a:          { x: -1, y:  0 },
    d:          { x:  1, y:  0 },
  };

  function trySetDir(d) {
    if (!d || !running || paused) return;
    // Prevent 180° reversal
    if (d.x !== -dir.x || d.y !== -dir.y) nextDir = d;
  }

  // ── Keyboard ──────────────────────────────────────────────
  document.addEventListener('keydown', e => {
    if (e.key === 'p' || e.key === 'P') { togglePause(); return; }
    if (e.key === 'Escape') { if (running) endGame(); return; }

    const d = DIR_MAP[e.key] ?? DIR_MAP[e.key.toLowerCase()];
    if (d) {
      e.preventDefault();
      trySetDir(d);
    }
  });

  // ── Buttons ───────────────────────────────────────────────
  document.getElementById('startBtn')  .addEventListener('click', startGame);
  document.getElementById('restartBtn').addEventListener('click', startGame);
  document.getElementById('resumeBtn') .addEventListener('click', togglePause);

  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      chosenSpeed = btn.dataset.speed;
    });
  });

  // D-pad
  document.getElementById('dUp')   .addEventListener('click', () => trySetDir({ x:  0, y: -1 }));
  document.getElementById('dDown') .addEventListener('click', () => trySetDir({ x:  0, y:  1 }));
  document.getElementById('dLeft') .addEventListener('click', () => trySetDir({ x: -1, y:  0 }));
  document.getElementById('dRight').addEventListener('click', () => trySetDir({ x:  1, y:  0 }));
  document.getElementById('dPause').addEventListener('click', togglePause);

  // ── Touch / Swipe ─────────────────────────────────────────
  let touchX, touchY;
  canvas.addEventListener('touchstart', e => {
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });

  canvas.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // tap, not swipe
    if (Math.abs(dx) > Math.abs(dy))
      trySetDir(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    else
      trySetDir(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
  }, { passive: true });

  // ── Responsive resize ─────────────────────────────────────
  window.addEventListener('resize', resizeCanvas);

  // ── Initial idle screen ───────────────────────────────────
  drawIdleScreen();

})();
