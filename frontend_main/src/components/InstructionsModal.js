import React from 'react';

// PUBLIC_INTERFACE
function InstructionsModal({ onClose }) {
  /**
   * Overlay modal to show game instructions.
   */
  return (
    <div className="instructions-modal">
      <div className="modal-content arcade-modal" tabIndex={-1} style={{
        animation: 'menu-fade-in 0.32s cubic-bezier(.38,-0.02,.68,1.1)'
      }}>
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
