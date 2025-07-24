import React from 'react';

// PUBLIC_INTERFACE
/**
 * ShieldIndicator - shows if player shield is active in UI overlay.
 * @param {boolean} active - Whether the shield is currently granted.
 */
function ShieldIndicator({ active }) {
  return (
    <div
      className={`shield-indicator ui-overlay-box${active ? '' : ' shield-inactive'}`}
      style={{
        minWidth: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active
          ? 'linear-gradient(120deg,#57cc99 65%,#fcc419 110%)'
          : 'rgba(80,80,80,0.14)',
        opacity: active ? 1 : 0.48,
        border: `2.5px solid ${active ? '#57cc99' : '#bbb'}`,
        color: active ? '#2d72d9' : '#666',
        fontWeight: 'bold',
        padding: '2px 18px'
      }}
      aria-label={active ? 'Shield Active' : 'Shield Inactive'}
    >
      <span style={{
        marginRight: 6,
        fontSize: 21,
        filter: active
          ? 'drop-shadow(0 0 8px #fff) drop-shadow(0 0 2px #57cc99)'
          : 'grayscale(1) contrast(0.8)'
      }}>🛡️</span>
      <span>{active ? <b>SHIELD!</b> : 'Shield'}</span>
    </div>
  );
}
export default ShieldIndicator;
