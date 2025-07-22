import React from 'react';

// PUBLIC_INTERFACE
function Controls({ onLeft, onRight, onShoot }) {
  /**
   * Renders left/right/shoot controls for mobile or overlays keyboard hints on desktop.
   * (Functionality to be integrated in future.)
   */
  return (
    <div className="controls-bar">
      <button className="btn control-btn" onClick={onLeft} aria-label="Left">⬅️</button>
      <button className="btn control-btn" onClick={onShoot} aria-label="Shoot">🎯</button>
      <button className="btn control-btn" onClick={onRight} aria-label="Right">➡️</button>
      <div className="desktop-hints">
        <span><b>Left/Right:</b> Arrow/A/D &nbsp;&nbsp;</span>
        <span><b>Shoot:</b> Space</span>
      </div>
    </div>
  );
}

export default Controls;
