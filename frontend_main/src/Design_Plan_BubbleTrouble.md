# Bubble Trouble React Game – UI and Game Logic Plan

This document integrates the requirements from the game design doc into a React/modern web UX plan, with a focus on universal visual appeal.

## 1. Gameplay Mechanics Overview

- **Player controls:**  
  - Move left/right: Arrow keys or A/D keys  
  - Shoot harpoon: Spacebar or mobile button

- **Game Entities:**  
  - **Player Character:** 2D sprite, animates while moving, death animation  
  - **Harpoon:** Shoots vertically from character position, simple sprite or animated line  
  - **Bubbles:** Multiple sizes (large, medium, small), bounce off ground/platforms/walls and split/pop as described  
  - **Platforms:** Visible ground for bubbles to bounce on; animated or visually appealing surface

- **Game Flow:**  
  - Player has 3 lives (display UI)  
  - Getting hit = lose a life + animation  
  - Win = all bubbles cleared  
  - Lose = all lives lost

## 2. Levels & Difficulty

- **Levels:**  
  - Increase bubble speed, number, and initial size variety per level  
  - Display current level visually at the top of the game screen  
  - Progression or restart menus after win/lose

- **(Optional) Timer/Scoring:**  
  - Points: Popping bubbles, finishing level quickly  
  - Timer displays for score challenge (optional, configurable)

## 3. UI / UX Layout

- **Main Menu:**
  - Title, playful graphics (matching color palette)
  - Buttons: Start Game, Instructions, Exit (Exit may hide/return to launcher on web)
  - Responsive: Layout centered, easy on mobile/desktop

- **In-Game UI (top overlay bar):**
  - Score (left)
  - Lives (heart/character icon x count, center)
  - Level indicator (right)

- **Central Game Canvas:**
  - Area where bubbles/player/harpoon animate and interact
  - Responsive scale for mobile/desktop
  - Visually rich, but not cluttered

- **Controls (bottom on mobile/keyboard overlay):**
  - On-screen left/right/shoot for mobile  
  - Keyboard hints for desktop

- **Instructions Modal:**
  - Overlay with concise how-to-play and graphic legend

## 4. Graphics & Animations

- **Visual Style:**  
  - Palette: Primary #2d72d9, Secondary #57cc99, Accent #fcc419  
  - Arcade/retro atmosphere with modern polish: gradients, colorful, lively
  - Rounded corners, smooth transitions/animations
  - Cute sprites for player, satisfying bubble split/pop FX
  - Animated backgrounds (gradient or simple parallax layer)

- **Animation cues:**  
  - Bubble bounce/split/pop  
  - Harpoon firing and collision
  - Player death/loss (fade out/falling, etc.)

## 5. Sound & Music (to be implemented in future steps)

- **Background music loop** (arcade/retro feel, toggleable)
- **Sound FX:** Shooting, bubble pop, player hit (configurable mute)

## 6. Technology Approach (for React/Web)

- **Game Loop:** Use React state for menu/gameover, but use canvas or performant div-based animation (e.g. requestAnimationFrame + refs or lightweight game loop hook) for live gameplay.
- **Componentization:**
  - App.js: Route/menu control, theme toggle, manages global state
  - GameCanvas.js: Handles game rendering, logic, keyboard/mouse/touch input
  - UI Components: ScoreBar.js, LivesIndicator.js, InstructionsModal.js, Menu.js, Controls.js

- **Responsiveness:**  
  - CSS grid/flex for overlays  
  - Canvas or central div resizes based on device  

## 7. Notes for Universal Visual Appeal

- Playful and engaging for all ages: No violent graphics, bright and fun, simple to grasp in the first seconds of viewing
- Accessible controls and text (clear contrast, readable fonts, large hit targets)
- Animations and colors that delight a casual as well as a retro/arcade audience
- Theme switcher (already present) will remain available

---

## Next Implementation Steps

1. Scaffold and connect the following components:
    - MainMenu, GameCanvas, ScoreBar, LivesIndicator, InstructionsModal, GameOverMenu
2. Develop visual assets or placeholder graphics (SVGs, CSS, public asset links)
3. Build base game loop and bubble/player/harpoon logic within GameCanvas component
4. Integrate score/lives/level logic with topbar UI
5. Style all overlays and menus in line with arcade/modern color palette
6. Add basic sound hooks and placeholders

Task completed: Bubble Trouble game requirements are now analyzed and mapped to a UI/game plan specific to React, guiding all further development.
