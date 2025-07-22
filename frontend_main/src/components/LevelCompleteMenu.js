import React from 'react';

// PUBLIC_INTERFACE
function LevelCompleteMenu({ level, onNext, onMainMenu }) {
  /**
   * LevelCompleteMenu displays when a level is cleared,
   * offering to proceed to the next level or return to main menu.
   */
  return (
    <div className="gameover-menu" tabIndex={-1} style={{
      animation: 'menu-fade-in 0.36s cubic-bezier(.38,-0.02,.68,1.1)'
    }}>
      <h2>
        🎉 Level {level} Complete!
      </h2>
      <div className="menu-buttons">
        <button className="btn arcade-btn" onClick={onNext}>Next Level</button>
        <button className="btn arcade-btn btn-exit" onClick={onMainMenu}>Main Menu</button>
      </div>
    </div>
  );
}

export default LevelCompleteMenu;
