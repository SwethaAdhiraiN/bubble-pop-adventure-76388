import React from 'react';

// PUBLIC_INTERFACE
function LevelIndicator({ level }) {
  /**
   * LevelIndicator displays the current game level.
   */
  return (
    <div className="level-indicator ui-overlay-box">
      <span>Level: <b>{level}</b></span>
    </div>
  );
}

export default LevelIndicator;
