import React from 'react';

// PUBLIC_INTERFACE
function ScoreBar({ score }) {
  /**
   * ScoreBar displays the player's current score.
   * Positioned at top left in the in-game overlay.
   */
  return (
    <div className="score-bar ui-overlay-box">
      <span>Score: <b>{score}</b></span>
    </div>
  );
}

export default ScoreBar;
