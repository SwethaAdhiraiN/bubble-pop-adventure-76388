import React from 'react';

// PUBLIC_INTERFACE
function LivesIndicator({ lives }) {
  /**
   * LivesIndicator displays the number of remaining lives.
   * Uses emojis for now, can be replaced with sprite in future.
   */
  return (
    <div className="lives-indicator ui-overlay-box">
      <span>
        {Array.from({ length: lives }).map((_, i) => (
          <span role="img" aria-label="life" key={i}>❤️</span>
        ))}
      </span>
    </div>
  );
}

export default LivesIndicator;
