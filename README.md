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
