import React, { useRef, useEffect, useState } from 'react';

/**
 * Control types to check for modern touch devices.
 */
function isTouchDevice() {
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    (navigator.msMaxTouchPoints > 0)
  );
}

// PUBLIC_INTERFACE
/**
 * Controls
 * 
 * Renders left/right/shoot controls for mobile/touch, overlays keyboard hints for desktop/keyboard,
 * and minimizes input delay for both. Accessibility and responsiveness are core.
 * 
 * @param {Function} onLeft    Callback for left input (required)
 * @param {Function} onRight   Callback for right input (required)
 * @param {Function} onShoot   Callback for shoot input (required)
 */
function Controls({ onLeft, onRight, onShoot }) {
  // Responsive state for input mode
  const [showTouch, setShowTouch] = useState(isTouchDevice() || window.innerWidth < 850);

  // Accessibility: Focus first control button on mount for keyboard/narrator users
  const leftBtnRef = useRef();

  // Responsive: toggle touch controls for screen size or input
  useEffect(() => {
    function handleResize() {
      setShowTouch(isTouchDevice() || window.innerWidth < 850);
    }
    window.addEventListener('resize', handleResize);
    return () =>
      window.removeEventListener('resize', handleResize);
  }, []);

  // Touch event deduplication & fast tap (prevent ghost click)
  function handleTouch(e, cb) {
    e.preventDefault();
    e.stopPropagation();
    cb();
  }

  // Keyboard modifiers for accessibility
  function handleKeyDown(e, cb) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      cb();
    }
  }

  // Accessibility label for visual and screen reader
  const controlsLabel = "Game Controls: Move left (⬅️), Shoot (🎯), Move right (➡️)";

  return (
    <nav
      className="controls-bar"
      aria-label={controlsLabel}
      style={{
        marginTop: window.innerHeight < 650 ? '12px' : '24px',
        flexWrap: 'wrap',
        userSelect: 'none',
        justifyContent: showTouch ? 'center' : 'flex-start',
        gap: showTouch ? 18 : 14,
        width: '100%',
        maxWidth: 800,
        marginLeft: 'auto',
        marginRight: 'auto',
        zIndex: 200,
        pointerEvents: 'auto',
      }}
    >
      {/* MOBILE/TOUCH CONTROLS */}
      {showTouch && (
        <>
          <button
            ref={leftBtnRef}
            className="btn control-btn"
            aria-label="Move Left"
            tabIndex={0}
            style={touchButtonStyle()}
            onTouchStart={e => handleTouch(e, onLeft)}
            onMouseDown={e => handleTouch(e, onLeft)}
            onKeyDown={e => handleKeyDown(e, onLeft)}
            role="button"
          >⬅️</button>
          <button
            className="btn control-btn"
            aria-label="Shoot Harpoon"
            tabIndex={0}
            style={touchButtonStyle()}
            onTouchStart={e => handleTouch(e, onShoot)}
            onMouseDown={e => handleTouch(e, onShoot)}
            onKeyDown={e => handleKeyDown(e, onShoot)}
            role="button"
          >🎯</button>
          <button
            className="btn control-btn"
            aria-label="Move Right"
            tabIndex={0}
            style={touchButtonStyle()}
            onTouchStart={e => handleTouch(e, onRight)}
            onMouseDown={e => handleTouch(e, onRight)}
            onKeyDown={e => handleKeyDown(e, onRight)}
            role="button"
          >➡️</button>
        </>
      )}

      {/* DESKTOP KEYBOARD HINTS (responsive: hide on small/touch) */}
      {!showTouch && (
        <div className="desktop-hints" aria-hidden="false" style={{
          fontSize: '.98em',
          color: '#222',
          marginLeft: 16,
          opacity: 0.73,
          fontFamily: 'monospace, monospace'
        }}>
          <span>
            <b>Left/Right:</b>&nbsp;Arrow or A/D &nbsp;&nbsp;
            <b>Shoot:</b> Spacebar
          </span>
        </div>
      )}
    </nav>
  );
}

// Helper style function for touch button hit targets
function touchButtonStyle() {
  const isMobile = window.innerWidth < 550;
  return {
    minWidth: isMobile ? '56px' : '48px',
    minHeight: isMobile ? '56px' : '44px',
    fontSize: isMobile ? '2.2em' : '1.4em',
    borderRadius: '12px',
    margin: isMobile ? '1.5vw' : '6px',
    touchAction: 'none',
    WebkitTapHighlightColor: 'rgba(0,0,0,0.07)',
    outline: 'none',
    boxShadow: '0 1.5px 9px #2d72d94a',
    background: 'linear-gradient(90deg,#57cc99 70%,#2d72d9 130%)',
    border: '2.2px solid #fcc419',
    color: '#fff',
    fontWeight: 'bold',
    transition: 'background .12s,transform .09s'
  };
}

export default Controls;
