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

// PUBLIC_INTERFACE
function App() {
  // Game's main UI states
  const [theme, setTheme] = useState('light');
  const [showMenu, setShowMenu] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [levelCleared, setLevelCleared] = useState(false);

  // Placeholder state for demo
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Menu/event handlers
  const handleStartGame = () => {
    setShowMenu(false);
    setIsGameOver(false);
    setLevelCleared(false);
    setInGame(true);
    // reset score/lives if restarting; logic to be implemented
    setScore(0);
    setLives(3);
    setLevel(1);
  };

  const handleShowInstructions = () => setShowInstructions(true);

  const handleExit = () => {
    // Web: Could reload or hide UI, here just show menu again
    setShowMenu(true);
    setIsGameOver(false);
    setInGame(false);
    setLevelCleared(false);
  };

  const handleCloseInstructions = () => setShowInstructions(false);

  const handleLevelComplete = () => {
    setLevelCleared(true);
    setInGame(false);
    setLevel(lvl => lvl + 1);
  };

  const handleGameOver = () => {
    setIsGameOver(true);
    setInGame(false);
  };

  const handleRetry = () => {
    setIsGameOver(false);
    setLevelCleared(false);
    setInGame(true);
    setScore(0); // Or resume
    setLives(3);
  };

  /* Main UI Rendering */
  return (
    <div className="App">
      <header className="App-header" style={{minHeight:'unset', background:'transparent', alignItems:'unset', justifyContent:'unset'}}>
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
            <div className="ui-topbar-left"><ScoreBar score={score} /></div>
            <div className="ui-topbar-center"><LivesIndicator lives={lives} /></div>
            <div className="ui-topbar-right"><LevelIndicator level={level} /></div>
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
          {inGame && (
            <>
              <GameCanvas
                // props for character, bubbles, etc. in future
              />
              <Controls
                onLeft={() => {}}
                onRight={() => {}}
                onShoot={() => {}}
              />
            </>
          )}
          {(isGameOver || levelCleared) && (
            <GameOverMenu
              gameOver={isGameOver}
              isWin={levelCleared}
              onRetry={levelCleared ? handleStartGame : handleRetry}
              onMainMenu={handleExit}
            />
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
