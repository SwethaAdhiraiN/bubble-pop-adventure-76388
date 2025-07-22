import React from 'react';

// PUBLIC_INTERFACE
function Bubbles() {
  /**
   * Placeholder for the set of bubbles present in the game.
   * This will eventually hold bubble state/positions.
   */
  return (
    <div className="bubbles-placeholder">
      <span className="bubble bubble-large" role="img" aria-label="Large Bubble">🟢</span>
      <span className="bubble bubble-medium" role="img" aria-label="Medium Bubble">🔵</span>
      <span className="bubble bubble-small" role="img" aria-label="Small Bubble">🟣</span>
    </div>
  );
}

export default Bubbles;
