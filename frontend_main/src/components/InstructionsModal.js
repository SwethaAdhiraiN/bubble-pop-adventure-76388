import React from 'react';

// PUBLIC_INTERFACE
function InstructionsModal({ onClose }) {
  /**
   * Overlay modal to show game instructions.
   */
  return (
    <div className="instructions-modal">
      <div className="modal-content arcade-modal">
        <h2>How to Play</h2>
        <ul>
          <li>Move Left/Right: <b>Arrow Keys</b> or <b>A/D</b></li>
          <li>Shoot Harpoon: <b>Spacebar</b></li>
          <li>Pop all bubbles to win, avoid getting touched!</li>
        </ul>
        <button className="btn arcade-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default InstructionsModal;
