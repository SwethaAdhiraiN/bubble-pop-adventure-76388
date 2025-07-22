import React, { useEffect, useRef, useState } from 'react';

// PUBLIC_INTERFACE
function ScoreBar({ score }) {
  /**
   * ScoreBar displays the player's current score.
   * Adds a brief highlight effect when score increases.
   */
  const [flash, setFlash] = useState(false);
  const prevScore = useRef(score);

  useEffect(() => {
    if (score > prevScore.current) {
      setFlash(true);
      const to = setTimeout(() => setFlash(false), 340);
      return () => clearTimeout(to);
    }
    prevScore.current = score;
  }, [score]);

  return (
    <div className={`score-bar ui-overlay-box${flash ? ' score-flash' : ''}`}>
      <span>Score: <b>{score}</b></span>
    </div>
  );
}

export default ScoreBar;
