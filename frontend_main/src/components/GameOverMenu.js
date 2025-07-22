import React from 'react';

// PUBLIC_INTERFACE
function GameOverMenu({ gameOver, onRetry, onMainMenu, isWin }) {
  /**
   * Displays on win or loss, with options to retry or return.
   */
  return (
    <div className="gameover-menu">
      <h2>
        {isWin ? '🎉 Level Cleared!' : '💀 Game Over'}
      </h2>
      <div className="menu-buttons">
        <button className="btn arcade-btn" onClick={onRetry}>
          {isWin ? 'Next Level' : 'Retry'}
        </button>
        <button className="btn arcade-btn btn-exit" onClick={onMainMenu}>Main Menu</button>
      </div>
    </div>
  );
}

export default GameOverMenu;
