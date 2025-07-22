import React, { useEffect, useRef, useState } from 'react';

// PUBLIC_INTERFACE
function LivesIndicator({ lives }) {
  /**
   * LivesIndicator displays the number of remaining lives and flashes when a life is lost.
   */
  const [flash, setFlash] = useState(false);
  const prevLives = useRef(lives);

  useEffect(() => {
    if (lives < prevLives.current) {
      setFlash(true);
      const to = setTimeout(() => setFlash(false), 420);
      return () => clearTimeout(to);
    }
    prevLives.current = lives;
  }, [lives]);

  return (
    <div className={`lives-indicator ui-overlay-box${flash ? ' lives-flash' : ''}`}>
      <span>
        {Array.from({ length: lives }).map((_, i) => (
          <span
            role="img"
            aria-label="life"
            key={i}
            style={flash && i === lives ? { filter: 'brightness(1.5) drop-shadow(0 0 6px #e84545)' } : {}}
          >
            ❤️
          </span>
        ))}
      </span>
    </div>
  );
}

export default LivesIndicator;
