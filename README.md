# Tic Tac Toe — Modern (Web)

A sleek, responsive, and accessible Tic Tac Toe game with a smart AI, full-screen result popup, confetti, and victory sounds — all in a single HTML file.

![Preview](./preview.png) <!-- Optional: Add a screenshot or GIF -->

## ✨ Features
- Modern glassy UI with smooth animations
- Play vs Computer (AI) or 2 Players (PvP)
- Difficulty levels: Easy, Normal, Impossible (minimax)
- AI can play as X or O
- Full-screen result popup (X wins / O wins / Tie)
- Confetti celebration + Victory sound
- Undo, New Round, Reset Scores
- Keyboard accessible (arrow keys + Enter/Space)
- Scores and preferences persisted via localStorage
- Auto fit-to-screen (no scrollbars)

## 🚀 Quick Start
1. Download or copy `index.html`.
2. Double-click to open in your browser.
3. Optional: Use a local server (e.g., VS Code Live Server) for best results.

No build step. No dependencies.

## 🕹️ Controls
- Mouse/Touch: Tap a cell to place X/O.
- Keyboard:
  - Arrow Keys or W/A/S/D: Move focus
  - Enter or Space: Place mark
  - Escape: Close result popup

## 🎛️ Modes & Settings
- Mode: 2 Players or Vs Computer
- AI plays as: X or O
- Difficulty: Easy / Normal / Impossible
- Buttons: Undo, New Round, Reset Scores

Preferences and scores are saved automatically.

## 🔊 Effects
- Confetti: Canvas-based burst on round end
- Sound: Small victory chime using WebAudio (enables after first click due to browser autoplay policies)

To disable FX quickly:
- Comment out these lines inside `showResultModal(...)`:
```js
startConfetti(tone);
playSfx(tone);
♿ Accessibility
Semantic roles: grid, gridcell, live status region
Keyboard-first playable
Focus management & visible focus ring
ARIA live updates for turn/result
🧠 AI
Easy: Random moves
Normal: 65% optimal (minimax) + 35% random (more human-like)
Impossible: Perfect play (minimax with quick win/block heuristics)
📱 Responsive & Fit-to-Screen
Uses 100dvh/100dvw and a fit-to-screen scale so the UI always fits without scrollbars.
If you want to disable scaling, remove fitToScreen() calls and the transform logic on #appCard.
💾 Persistence
localStorage keys:
Scores: ttt_scores_v1
Preferences: ttt_prefs_v1
To reset: Use the "Reset scores" button or clear site storage.
🧩 File Structure
Everything is inside a single file:

text

index.html
🛠️ Customize
Colors: Edit CSS variables in :root (e.g., --x, --o, --accent, --win)
Confetti density: Change const count = 180; inside startConfetti(...)
Audio volume: Adjust the vol argument in note(...) calls
Start side: By default, X starts. Change in newRound() if you prefer alternation.
🐞 Troubleshooting
No sound? Click once on the page to allow audio (browser autoplay policy).
Scrollbar on some devices? This build uses overflow: hidden, 100dvh, and dynamic scaling. If any device still shows scroll, reduce paddings or lower the scale pad in fitToScreen().
Performance on low-end devices? Reduce confetti count or comment out confetti.
🧪 Browser Support
Modern browsers (Chromium, Firefox, Safari). Uses:

CSS dvh/dvw
visualViewport (optional, with fallbacks)
WebAudio (optional)
📄 License
MIT — or use your preferred license.

🙌 Credits
Built with vanilla HTML, CSS, and JavaScript.

text


Chaho to main ek preview.png bhi bana ke add karne ke liye guide kar sakta hoon. Koi section customize karwana ho to batao!