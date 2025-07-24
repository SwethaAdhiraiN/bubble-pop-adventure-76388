import React from 'react';

// PUBLIC_INTERFACE
/**
 * Powerup component: visually displays the shield powerup in the game canvas.
 * @param {Object} props - { x, y, visible, onCollect }
 */
function Powerup({ x, y, visible = false }) {
  if (!visible) return null;
  return (
    <div
      className="powerup-shield"
      style={{
        position: 'absolute',
        left: x - 18,
        top: y - 18,
        width: 36,
        height: 36,
        zIndex: 7,
        background: 'radial-gradient(circle 70% at 50% 50%, #fff8, #57cc995a)',
        border: '3px solid #fcc419',
        borderRadius: '50%',
        boxShadow: '0 0 12px #2d72d988, 0 0 18px #fcc41980',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'powerup-appear 0.35s cubic-bezier(.67,0,.61,1.16)',
        pointerEvents: 'none',
      }}
      aria-label="Shield Powerup"
    >
      <span
        style={{
          fontSize: 22,
          color: '#2d72d9',
          textShadow: '1px 2px 5px #fff, 1px 1px 0 #fcc419',
          filter: 'drop-shadow(0 0 7px #57cc99aa)',
          pointerEvents: 'none'
        }}
        role="img"
        aria-label="Shield"
      >
        🛡️
      </span>
    </div>
  );
}

export default Powerup;
