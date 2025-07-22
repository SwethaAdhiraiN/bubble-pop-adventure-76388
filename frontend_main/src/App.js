import React, { useState, useEffect } from 'react';
import './App.css';

/* Component Imports */
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import ScoreBar from './components/ScoreBar';
import LivesIndicator from './components/LivesIndicator';
import LevelIndicator from './components/LevelIndicator';
import InstructionsModal from './components/InstructionsModal';
import Controls from './components/Controls';
import GameOverMenu from './components/GameOverMenu';
import LevelCompleteMenu from './components/LevelCompleteMenu';

// PUBLIC_INTERFACE
function App() {
  // Game's main UI states
  const [theme, setTheme] = useState('light');
  // Menu and modal states
  const [showMenu, setShowMenu] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  // Game progression and state machine
  const [inGame, setInGame] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);
  const [level, setLevel] = useState(1);

  // Player stats
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Start game from menu (fresh state)
  const handleStartGame = () => {
    setShowMenu(false);
    setShowInstructions(false);
    setIsGameOver(false);
    setLevelCleared(false);
    setInGame(true);
    setScore(0);
    setLives(3);
    setLevel(1);
  };

  // Called when pressed Next Level button (after clearing a level)
  const handleNextLevel = () => {
    setLevelCleared(false);
    setIsGameOver(false);
    setShowMenu(false);
    setInGame(true);
    setLives(3); // Or: optionally keep lives between levels? Classic mode resets
    setLevel((prevLvl) => prevLvl + 1);
    // Do not reset score; keep score accumulating over all levels
  };

  // Enter instructions modal
  const handleShowInstructions = () => {
    setShowInstructions(true);
  };

  // Exit to main menu - resets main state
  const handleExit = () => {
    setShowMenu(true);
    setShowInstructions(false);
    setIsGameOver(false);
    setLevelCleared(false);
    setInGame(false);
    setScore(0);
    setLives(3);
    setLevel(1);
  };

  const handleCloseInstructions = () => setShowInstructions(false);

  // Called by GameCanvas when all bubbles are cleared
  const handleLevelComplete = () => {
    setLevelCleared(true);
    setInGame(false);
  };

  // Called by GameCanvas when player loses all lives
  const handleGameOver = () => {
    setIsGameOver(true);
    setInGame(false);
  };

  // Retry current level after game over
  const handleRetry = () => {
    setIsGameOver(false);
    setLevelCleared(false);
    setInGame(true);
    setScore(0);
    setLives(3);
    setLevel(1);
  };

  /* Main UI Rendering */
  return (
    <div className="App">
      <header
        className="App-header"
        style={{
          minHeight: 'unset',
          background: 'transparent',
          alignItems: 'unset',
          justifyContent: 'unset',
        }}
      >
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        {/* UI Overlays (Score/Lives/Level) */}
        {inGame && (
          <div className="ui-top-overlay">
            <div className="ui-topbar-left">
              <ScoreBar score={score} />
            </div>
            <div className="ui-topbar-center">
              <LivesIndicator lives={lives} />
            </div>
            <div className="ui-topbar-right">
              <LevelIndicator level={level} />
            </div>
          </div>
        )}
        {/* MainContent Area */}
        <div className="main-content-arcade">
          {showMenu && (
            <MainMenu
              onStart={handleStartGame}
              onInstructions={handleShowInstructions}
              onExit={handleExit}
            />
          )}
          {showInstructions && (
            <InstructionsModal onClose={handleCloseInstructions} />
          )}
          {/* Main Game in progress */}
          {inGame && (
            <>
              <GameCanvas
                // Pass hooks for score, lives, and level events
                level={level}
                onScore={(pts) => setScore((s) => s + pts)}
                onLifeLost={() => {
                  setLives((life) => {
                    // If losing last life, trigger game over
                    if (life <= 1) {
                      setTimeout(() => handleGameOver(), 350); // Slight delay
                      return 0;
                    }
                    return life - 1;
                  });
                }}
                onAllBubblesCleared={handleLevelComplete}
              />
              <Controls
                onLeft={() => {
                  // Forward mobile/onscreen button to GameCanvas movement.
                  const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
                  window.dispatchEvent(event);
                }}
                onRight={() => {
                  const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
                  window.dispatchEvent(event);
                }}
                onShoot={() => {
                  const event = new KeyboardEvent('keydown', { code: 'Space' });
                  window.dispatchEvent(event);
                }}
              />
            </>
          )}

          {/* Level Cleared menu */}
          {levelCleared && !isGameOver && (
            <LevelCompleteMenu
              level={level}
              onNext={handleNextLevel}
              onMainMenu={handleExit}
            />
          )}
          {/* Game Over menu */}
          {isGameOver && !levelCleared && (
            <GameOverMenu
              gameOver={true}
              isWin={false}
              onRetry={handleRetry}
              onMainMenu={handleExit}
            />
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
