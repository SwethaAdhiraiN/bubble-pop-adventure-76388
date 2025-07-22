import React from 'react';

// PUBLIC_INTERFACE
function MainMenu({ onStart, onInstructions, onExit }) {
  /**
   * MainMenu displays the game's title and menu buttons.
   */
  return (
    <div className="main-menu">
      <h1 className="game-title-arcade">Bubble Trouble</h1>
      <p className="game-tagline">Pop the Bubbles, Save the Day!</p>
      <div className="menu-buttons">
        <button className="btn arcade-btn" onClick={onStart}>Start Game</button>
        <button className="btn arcade-btn" onClick={onInstructions}>Instructions</button>
        <button className="btn arcade-btn btn-exit" onClick={onExit}>Exit</button>
      </div>
    </div>
  );
}

export default MainMenu;
