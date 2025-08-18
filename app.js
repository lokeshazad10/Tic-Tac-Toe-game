// ====== State ======
const combos = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const els = {};
const state = {
  board: Array(9).fill(null),
  current: "X",
  vsAI: true,
  ai: "O",
  difficulty: "normal",
  scores: { X: 0, O: 0, T: 0 },
  winners: [],
  busy: false,
  gameOver: false,
  history: [],
  focusIndex: 0,
};

// ====== Init DOM ======
function q(id) {
  return document.getElementById(id);
}
function makeBoard() {
  const board = q("board");
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.setAttribute("role", "gridcell");
    btn.setAttribute("aria-label", `Cell ${i + 1}`);
    btn.dataset.index = i;
    btn.addEventListener("click", onCellClick);
    btn.addEventListener("keydown", onCellKey);
    board.appendChild(btn);
  }
  els.cells = Array.from(board.children);
}

function cacheEls() {
  els.turnPill = q("turnPill");
  els.scoreX = q("scoreX");
  els.scoreO = q("scoreO");
  els.scoreT = q("scoreT");
  els.statusText = q("statusText");
  els.ariaStatus = q("ariaStatus");

  els.undoBtn = q("undoBtn");
  els.newBtn = q("newBtn");
  els.resetBtn = q("resetBtn");

  els.modePvp = q("modePvp");
  els.modeAi = q("modeAi");
  els.aiBlock = q("aiBlock");
  els.aiX = q("aiX");
  els.aiO = q("aiO");
  els.difficulty = q("difficulty");

  els.resultOverlay = q("resultOverlay");
  els.resultTitle = q("resultTitle");
  els.resultSub = q("resultSub");
  els.playAgainBtn = q("playAgainBtn");
  els.closeResultBtn = q("closeResultBtn");

  els.confetti = q("confettiCanvas");

  els.undoBtn.addEventListener("click", undo);
  els.newBtn.addEventListener("click", newRound);
  els.resetBtn.addEventListener("click", resetScores);

  els.modePvp.addEventListener("change", onModeChange);
  els.modeAi.addEventListener("change", onModeChange);
  [els.aiX, els.aiO].forEach((r) => r.addEventListener("change", onAiSide));
  els.difficulty.addEventListener("change", (e) =>
    setDifficulty(e.target.value)
  );

  // Result overlay listeners
  els.playAgainBtn.addEventListener("click", () => {
    hideResultModal();
    newRound(true);
  });
  els.closeResultBtn.addEventListener("click", hideResultModal);
  els.resultOverlay.addEventListener("click", (e) => {
    if (e.target === els.resultOverlay) hideResultModal();
  });
  document.addEventListener("keydown", (e) => {
    if (!els.resultOverlay.hidden && e.key === "Escape") hideResultModal();
  });
}

// ====== Persistence ======
const LS_SCORES = "ttt_scores_v1";
const LS_PREFS = "ttt_prefs_v1";

function loadPersist() {
  try {
    const s = JSON.parse(localStorage.getItem(LS_SCORES));
    if (s && typeof s === "object") {
      state.scores = { X: s.X | 0, O: s.O | 0, T: s.T | 0 };
    }
  } catch {}
  try {
    const p = JSON.parse(localStorage.getItem(LS_PREFS));
    if (p) {
      state.vsAI = !!p.vsAI;
      state.ai = p.ai === "X" ? "X" : "O";
      state.difficulty = p.difficulty || "normal";
    }
  } catch {}
}
function saveScores() {
  try {
    localStorage.setItem(LS_SCORES, JSON.stringify(state.scores));
  } catch {}
}
function savePrefs() {
  try {
    localStorage.setItem(
      LS_PREFS,
      JSON.stringify({
        vsAI: state.vsAI,
        ai: state.ai,
        difficulty: state.difficulty,
      })
    );
  } catch {}
}

// ====== Rendering ======
function renderBoard() {
  state.board.forEach((v, i) => {
    const c = els.cells[i];
    c.textContent = v || "";
    c.classList.toggle("filled", !!v);
    c.classList.toggle("X", v === "X");
    c.classList.toggle("O", v === "O");
    c.classList.toggle("win", state.winners.includes(i));
    c.tabIndex = i === state.focusIndex ? 0 : -1;
  });
  updateInteractivity();
}
function updateInteractivity() {
  const lock = state.gameOver || state.busy;
  els.cells.forEach((c, i) => {
    const occupied = !!state.board[i];
    c.disabled = lock || occupied || (state.vsAI && state.current === state.ai);
  });
}
function renderHud() {
  els.turnPill.textContent = state.current;
  els.turnPill.style.color = state.current === "X" ? "var(--x)" : "var(--o)";
  els.scoreX.textContent = state.scores.X;
  els.scoreO.textContent = state.scores.O;
  els.scoreT.textContent = state.scores.T;

  if (state.gameOver) {
    if (state.winners.length) {
      const winner = state.board[state.winners[0]];
      setStatus(`${winner} wins!`);
    } else {
      setStatus(`It's a tie.`);
    }
  } else {
    setStatus(
      `${state.current}'s turn${
        state.vsAI && state.current === state.ai ? " (computer)" : ""
      }.`
    );
  }

  els.aiBlock.style.display = state.vsAI ? "block" : "none";
  els.modeAi.checked = state.vsAI;
  els.modePvp.checked = !state.vsAI;
  els.aiX.checked = state.ai === "X";
  els.aiO.checked = state.ai === "O";
  els.difficulty.value = state.difficulty;
}
function setStatus(text) {
  els.statusText.textContent = text;
  els.ariaStatus.textContent = text;
}

// ====== Result Modal Helpers ======
function showResultModal({ title, sub, tone }) {
  els.resultTitle.textContent = title;
  els.resultSub.textContent = sub || "";
  els.resultTitle.style.color =
    tone === "X" ? "var(--x)" : tone === "O" ? "var(--o)" : "var(--win)";

  els.prevFocus = document.activeElement;
  els.resultOverlay.hidden = false;
  requestAnimationFrame(() => els.playAgainBtn.focus());

  // FX
  startConfetti(tone);
  playSfx(tone);
}

function hideResultModal() {
  if (!els.resultOverlay) return;
  els.resultOverlay.hidden = true;
  els.resultTitle.style.color = "var(--text)";
  stopConfetti();
  els.prevFocus?.focus?.();
}

// ====== Game Flow ======
function newRound(autoStartAI = true) {
  hideResultModal();
  state.board.fill(null);
  state.current = "X";
  state.winners = [];
  state.gameOver = false;
  state.history = [];
  state.busy = false;
  state.focusIndex = 0;
  renderBoard();
  renderHud();

  // If AI goes first and vsAI, let it move
  if (state.vsAI && state.ai === "X" && autoStartAI) {
    thinkThenAIMove();
  }
}
function endRound(winners) {
  state.gameOver = true;
  state.winners = winners || [];
  if (winners && winners.length) {
    const sym = state.board[winners[0]];
    state.scores[sym] += 1;
  } else {
    state.scores.T += 1;
  }
  saveScores();
  renderBoard();
  renderHud();

  const isWin = state.winners.length > 0;
  const sym = isWin ? state.board[state.winners[0]] : "T";
  const title = isWin ? `${sym} wins!` : `It's a tie`;
  const sub = `Score — X: ${state.scores.X} • O: ${state.scores.O} • Ties: ${state.scores.T}`;
  showResultModal({ title, sub, tone: sym });
}

function onCellClick(e) {
  const idx = Number(e.currentTarget.dataset.index);
  playAt(idx);
}

function onCellKey(e) {
  const idx = Number(e.currentTarget.dataset.index);
  const row = Math.floor(idx / 3);
  const col = idx % 3;
  switch (e.key) {
    case "ArrowLeft":
    case "a":
    case "A":
      e.preventDefault();
      moveFocus(row, (col + 2) % 3);
      break;
    case "ArrowRight":
    case "d":
    case "D":
      e.preventDefault();
      moveFocus(row, (col + 1) % 3);
      break;
    case "ArrowUp":
    case "w":
    case "W":
      e.preventDefault();
      moveFocus((row + 2) % 3, col);
      break;
    case "ArrowDown":
    case "s":
    case "S":
      e.preventDefault();
      moveFocus((row + 1) % 3, col);
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      playAt(idx);
      break;
  }
}
function moveFocus(r, c) {
  const idx = r * 3 + c;
  state.focusIndex = idx;
  renderBoard();
  els.cells[idx].focus();
}

function playAt(idx) {
  if (state.busy || state.gameOver) return;
  if (state.board[idx]) return;
  if (state.vsAI && state.current === state.ai) return;

  place(idx, state.current);
  const res = evaluate();
  renderBoard();
  renderHud();

  if (res.done) return endRound(res.winners);

  // AI move
  if (state.vsAI && state.current === state.ai) {
    thinkThenAIMove();
  }
}

function place(idx, sym) {
  state.board[idx] = sym;
  state.history.push(idx);
  state.current = sym === "X" ? "O" : "X";
  // animate
  els.cells[idx]?.classList.add("pop");
  setTimeout(() => els.cells[idx]?.classList.remove("pop"), 200);
}

function evaluate() {
  for (const line of combos) {
    const [a, b, c] = line;
    const v = state.board[a];
    if (v && v === state.board[b] && v === state.board[c]) {
      state.winners = line;
      return { done: true, winners: line };
    }
  }
  if (state.board.every(Boolean)) return { done: true, winners: [] };
  return { done: false };
}

function undo() {
  if (state.busy || state.gameOver) return; // keep simple: only during active round
  if (!state.history.length) return;

  if (!state.vsAI) {
    // PvP: undo one
    const idx = state.history.pop();
    state.board[idx] = null;
    state.current = state.current === "X" ? "O" : "X";
  } else {
    // Vs AI: undo back to player's turn
    do {
      const idx = state.history.pop();
      if (idx == null) break;
      const prevSym = state.current === "X" ? "O" : "X";
      state.board[idx] = null;
      state.current = prevSym;
    } while (state.current === state.ai && state.history.length);
  }
  state.winners = [];
  renderBoard();
  renderHud();
}

// ====== AI ======
function thinkThenAIMove() {
  state.busy = true;
  renderBoard();
  renderHud();
  setTimeout(() => {
    const idx = chooseAiMove(
      state.board.slice(),
      state.ai,
      state.ai === "X" ? "O" : "X",
      state.difficulty
    );
    if (idx != null) {
      place(idx, state.ai);
      const res = evaluate();
      if (res.done) {
        endRound(res.winners);
      } else {
        state.busy = false;
        renderBoard();
        renderHud();
      }
    } else {
      state.busy = false;
      renderBoard();
      renderHud();
    }
  }, 350 + Math.random() * 150);
}

function chooseAiMove(board, ai, human, difficulty) {
  const empty = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  if (!empty.length) return null;

  if (difficulty === "easy") {
    return randomMove(board);
  }
  if (difficulty === "normal") {
    // 65% optimal, 35% random to feel human
    if (Math.random() < 0.65) return bestMoveMinimax(board, ai, human).index;
    return randomMove(board);
  }
  // impossible
  return bestMoveMinimax(board, ai, human).index;
}

function randomMove(board) {
  const avail = board.map((v, i) => (v ? null : i)).filter((v) => v !== null);
  return avail[Math.floor(Math.random() * avail.length)];
}

function bestMoveMinimax(board, ai, human) {
  // Immediate win/block heuristics to speed up
  for (const i of empties(board)) {
    board[i] = ai;
    if (isWin(board, ai)) {
      board[i] = null;
      return { index: i, score: 10 };
    }
    board[i] = null;
  }
  for (const i of empties(board)) {
    board[i] = human;
    if (isWin(board, human)) {
      board[i] = null;
      return { index: i, score: 9 };
    }
    board[i] = null;
  }
  return minimax(board, ai, ai, human, 0);
}

function minimax(board, player, ai, human, depth) {
  const winner = terminal(board, ai, human);
  if (winner !== null) {
    if (winner === ai) return { score: 10 - depth };
    if (winner === human) return { score: depth - 10 };
    return { score: 0 };
  }
  const moves = [];
  for (const i of empties(board)) {
    board[i] = player;
    const next = minimax(
      board,
      player === ai ? human : ai,
      ai,
      human,
      depth + 1
    );
    moves.push({ index: i, score: next.score });
    board[i] = null;
  }
  if (player === ai) {
    let best = moves[0];
    for (const m of moves) if (m.score > best.score) best = m;
    return best;
  } else {
    let best = moves[0];
    for (const m of moves) if (m.score < best.score) best = m;
    return best;
  }
}

function empties(board) {
  const out = [];
  for (let i = 0; i < 9; i++) if (!board[i]) out.push(i);
  return out;
}
function terminal(board, ai, human) {
  if (isWin(board, ai)) return ai;
  if (isWin(board, human)) return human;
  if (board.every(Boolean)) return "T";
  return null;
}
function isWin(board, sym) {
  return combos.some(
    ([a, b, c]) => board[a] === sym && board[b] === sym && board[c] === sym
  );
}

// ====== Controls ======
function onModeChange() {
  state.vsAI = els.modeAi.checked;
  if (!state.vsAI) {
    // PvP always X first
    state.ai = "O";
  }
  savePrefs();
  newRound(false);
  renderHud();
}
function onAiSide() {
  state.ai = els.aiX.checked ? "X" : "O";
  savePrefs();
  // Start a new round and if AI is X, it moves first.
  newRound(true);
}
function setDifficulty(diff) {
  state.difficulty = diff;
  savePrefs();
}
function resetScores() {
  state.scores = { X: 0, O: 0, T: 0 };
  saveScores();
  renderHud();
}

// ====== FX: Confetti ======
const confetti = {
  ctx: null,
  particles: [],
  id: null,
  running: false,
  endTime: 0,
  W: 0,
  H: 0,
  colors: {},
};

function initConfettiCanvas() {
  confetti.ctx = els.confetti.getContext("2d");
  const cs = getComputedStyle(document.documentElement);
  confetti.colors = {
    X: cs.getPropertyValue("--x").trim() || "#60d394",
    O: cs.getPropertyValue("--o").trim() || "#ff6b6b",
    T: cs.getPropertyValue("--win").trim() || "#ffd166",
    A: cs.getPropertyValue("--accent").trim() || "#8a9eff",
  };
  resizeConfetti();
  window.addEventListener("resize", resizeConfetti);
}
function resizeConfetti() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  confetti.W = els.confetti.width = Math.floor(innerWidth * dpr);
  confetti.H = els.confetti.height = Math.floor(innerHeight * dpr);
  els.confetti.style.width = innerWidth + "px";
  els.confetti.style.height = innerHeight + "px";
  confetti.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function startConfetti(tone) {
  stopConfetti();
  confetti.running = true;
  confetti.endTime = performance.now() + 2500;
  confetti.particles = [];

  const count = 180;
  const centerX = innerWidth / 2;
  const centerY = innerHeight / 3;
  const palette =
    tone === "X"
      ? [confetti.colors.X, confetti.colors.A, "#ffffff"]
      : tone === "O"
      ? [confetti.colors.O, confetti.colors.A, "#ffffff"]
      : [confetti.colors.T, confetti.colors.A, "#ffffff"];

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 3 + Math.random() * 5;
    confetti.particles.push({
      x: centerX,
      y: centerY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 2,
      size: 6 + Math.random() * 8,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.2,
      color: palette[Math.floor(Math.random() * palette.length)],
      shape: Math.random() < 0.6 ? "rect" : "circle",
      life: 0,
      maxLife: 60 + Math.random() * 40,
    });
  }
  tickConfetti();
}
function tickConfetti() {
  const ctx = confetti.ctx;
  if (!ctx) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);

  const g = 0.12;
  const drag = 0.995;
  const spinDrag = 0.99;
  for (let i = confetti.particles.length - 1; i >= 0; i--) {
    const p = confetti.particles[i];
    p.vy += g;
    p.vx *= drag;
    p.vy *= drag;
    p.rot += p.vr;
    p.vr *= spinDrag;
    p.x += p.vx;
    p.y += p.vy;
    p.life++;

    // draw
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;
    if (p.shape === "rect") {
      const w = p.size,
        h = p.size * (0.6 + Math.random() * 0.4);
      ctx.fillRect(-w / 2, -h / 2, w, h);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // cull
    if (p.y > innerHeight + 40 || p.life > p.maxLife) {
      confetti.particles.splice(i, 1);
    }
  }

  if (
    (performance.now() < confetti.endTime || confetti.particles.length) &&
    confetti.running
  ) {
    confetti.id = requestAnimationFrame(tickConfetti);
  } else {
    stopConfetti();
  }
}
function stopConfetti() {
  confetti.running = false;
  if (confetti.id) {
    cancelAnimationFrame(confetti.id);
    confetti.id = null;
  }
  if (confetti.ctx) {
    confetti.ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  confetti.particles = [];
}

// ====== FX: Sound (WebAudio) ======
const sfx = { ctx: null, enabled: false };
function initAudio() {
  if (sfx.ctx) return;
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return; // browser unsupported
  sfx.ctx = new AudioCtx();
  sfx.enabled = true;
}
function ensureAudio() {
  initAudio();
  try {
    sfx.ctx?.resume();
  } catch {}
}
// Arm audio after first user gesture
window.addEventListener("pointerdown", ensureAudio, { once: true });

function note(freq, t, dur = 0.18, type = "triangle", vol = 0.06) {
  if (!sfx.ctx || sfx.ctx.state === "suspended") return;
  const ctx = sfx.ctx;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = 0;
  o.connect(g).connect(ctx.destination);

  // Envelope: quick attack, smooth decay
  const attack = 0.01,
    release = 0.12;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(dur, release));

  o.start(t);
  o.stop(t + Math.max(dur, release) + 0.02);
}

function playSfx(tone) {
  if (!sfx.ctx) return; // enabled after first click
  const ctx = sfx.ctx;
  const t0 = ctx.currentTime + 0.01;

  if (tone === "T") {
    // Neutral tie: two soft beeps
    note(440, t0, 0.14, "sine", 0.045);
    note(392, t0 + 0.14, 0.14, "sine", 0.04);
    return;
  }

  // Win: small celebratory arpeggio
  if (tone === "X") {
    // C major arpeggio: C5, E5, G5
    note(523.25, t0, 0.18, "triangle", 0.07);
    note(659.25, t0 + 0.12, 0.18, "triangle", 0.07);
    note(783.99, t0 + 0.24, 0.22, "triangle", 0.075);
  } else {
    // O: G major flavor: G4, B4, D5
    note(392.0, t0, 0.18, "triangle", 0.07);
    note(493.88, t0 + 0.12, 0.18, "triangle", 0.07);
    note(587.33, t0 + 0.24, 0.22, "triangle", 0.075);
  }
  // Little sparkle on top
  note(1046.5, t0 + 0.36, 0.1, "sine", 0.05);
}

// ====== Boot ======
function boot() {
  cacheEls();
  loadPersist();
  makeBoard();
  renderHud();
  newRound(true);
  initConfettiCanvas();
}
boot();
