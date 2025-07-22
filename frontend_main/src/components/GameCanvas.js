import React, { useRef, useEffect, useCallback, useState } from 'react';
import Character from './Character';
import Harpoon from './Harpoon';
import Bubbles from './Bubbles';

/**
 * Game constants (gameplay area, entity sizes, physics)
 */
const CANVAS_WIDTH = 750; // px (match CSS)
const CANVAS_HEIGHT = 440;

const GROUND_Y = CANVAS_HEIGHT - 40; // Match .game-bg-arcade height

const CHARACTER_WIDTH = 42;
const CHARACTER_HEIGHT = 54;
const CHARACTER_SPEED = 6;

const HARPOON_WIDTH = 6;
const HARPOON_HEIGHT = CANVAS_HEIGHT;
const HARPOON_SPEED = 15;
const HARPOON_COOLDOWN = 300;

const BUBBLE_COLORS = ['#38e', '#fcc419', '#57cc99'];
const BUBBLE_SIZES = [
  { radius: 36, score: 50 },
  { radius: 22, score: 75 },
  { radius: 12, score: 100 },
];
const BUBBLE_GRAVITY = 0.52;
const BUBBLE_BOUNCE_VY = -11;

/**
 * Returns initial level setup for bubbles.
 */
function getInitialBubbles(level = 1) {
  // Start with 1-3 large/medium bubbles in random positions
  const basic = [
    {
      id: 1,
      x: CANVAS_WIDTH * 0.3,
      y: 70,
      vx: 2 + level * 0.35,
      vy: 0,
      size: 0, // index into BUBBLE_SIZES (0 = large)
      alive: true,
    },
    {
      id: 2,
      x: CANVAS_WIDTH * 0.7,
      y: 90,
      vx: -2.7 - level * 0.35,
      vy: 0,
      size: 0,
      alive: true,
    },
  ];
  // Optionally randomize or add difficulty as more levels introduced
  return basic;
}

/**
 * Playground boundary check helper
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// PUBLIC_INTERFACE
function GameCanvas({
  // Future: onScore, onLifeLost, level, etc.
}) {
  /**
   * Renders and runs main game logic, including:
   * - Character movement (left/right), boundary check
   * - Harpoon shooting, cooldown, and state
   * - Bubbles: gravity, bounce, and wall reflection
   * - Collision detection scaffolding (with TODOs)
   * 
   * Uses div-based rendering for universal layout matching. 
   */
  const [characterX, setCharacterX] = useState(CANVAS_WIDTH / 2 - CHARACTER_WIDTH / 2);
  const [characterDir, setCharacterDir] = useState(0); // -1: left, 1: right, 0: idle
  const [harpoon, setHarpoon] = useState(null); // {x, y, active}
  const [harpoonCooldown, setHarpoonCooldown] = useState(false);
  const [bubbles, setBubbles] = useState(getInitialBubbles(1)); // Array of bubble objects

  // For efficient game loop
  const requestRef = useRef();
  const keyState = useRef({});

  // Handlers for keyboard/movement/shoot
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        keyState.current.left = true;
      }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        keyState.current.right = true;
      }
      if (e.code === 'Space') {
        keyState.current.shoot = true;
      }
    };
    const handleKeyUp = (e) => {
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        keyState.current.left = false;
      }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        keyState.current.right = false;
      }
      if (e.code === 'Space') {
        keyState.current.shoot = false;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Movement + shoot triggers
  useEffect(() => {
    let shootLock = false;
    let lastTimestamp = performance.now();

    function gameLoop(now) {
      // dt in ms
      const dt = now - lastTimestamp;
      lastTimestamp = now;

      // --- Character Movement Logic ---
      let dir = (keyState.current.right ? 1 : 0) - (keyState.current.left ? 1 : 0);
      setCharacterDir(dir);

      setCharacterX((prevX) => {
        let newX = prevX + dir * CHARACTER_SPEED;
        newX = clamp(newX, 0, CANVAS_WIDTH - CHARACTER_WIDTH);
        return newX;
      });

      // --- Harpoon Shooting ---
      if (keyState.current.shoot && !harpoonCooldown && !harpoon && !shootLock) {
        // Launch harpoon from character center top
        setHarpoon({
          x: characterX + CHARACTER_WIDTH / 2 - HARPOON_WIDTH / 2,
          y: GROUND_Y - CHARACTER_HEIGHT,
          active: true,
        });
        setHarpoonCooldown(true);
        shootLock = true;
        setTimeout(() => setHarpoonCooldown(false), HARPOON_COOLDOWN);
      } else if (!keyState.current.shoot) {
        shootLock = false; // reset lock when button released
      }

      // --- Harpoon ascending logic ---
      setHarpoon((prev) => {
        if (!prev || !prev.active) return null;
        let newY = prev.y - HARPOON_SPEED;
        if (newY < 0) return null; // Remove harpoon if off screen
        return { ...prev, y: newY, active: true };
      });

      // --- Bubbles physics update ---
      setBubbles((prevBubbles) =>
        prevBubbles.map((b) => {
          if (!b.alive) return b;
          let newVy = b.vy + BUBBLE_GRAVITY; // gravity
          let newY = b.y + newVy;
          let newX = b.x + b.vx;
          let newVx = b.vx;

          // Bounce off ground
          if (newY + BUBBLE_SIZES[b.size].radius > GROUND_Y) {
            newY = GROUND_Y - BUBBLE_SIZES[b.size].radius;
            newVy = BUBBLE_BOUNCE_VY;
          }

          // Bounce off side walls
          if (
            newX - BUBBLE_SIZES[b.size].radius < 0 ||
            newX + BUBBLE_SIZES[b.size].radius > CANVAS_WIDTH
          ) {
            newVx *= -1;
            if (newX - BUBBLE_SIZES[b.size].radius < 0)
              newX = BUBBLE_SIZES[b.size].radius;
            else
              newX = CANVAS_WIDTH - BUBBLE_SIZES[b.size].radius;
          }

          return { ...b, x: newX, y: newY, vx: newVx, vy: newVy };
        })
      );

      // --- Collision Detection (Scaffolding) ---
      // TODO: Add scoring, life lost, bubble splitting & game state hooks

      // 1. Active harpoon vs any bubble
      if (harpoon && harpoon.active) {
        bubbles.forEach((b, idx) => {
          if (!b.alive) return;
          const bx = b.x;
          const by = b.y;
          const br = BUBBLE_SIZES[b.size].radius;

          // Harpoon is a line along the harpoon x, from harpoon.y up to top
          const hx = harpoon.x + HARPOON_WIDTH / 2;
          const hy = harpoon.y;
          const isInRange =
            hx > bx - br &&
            hx < bx + br &&
            hy < by + br &&
            GROUND_Y - CHARACTER_HEIGHT > by - br;

          if (isInRange) {
            // --- Handle collision ---
            // TODO:  - Pop or split bubble (add new bubbles if not smallest)
            //        - Increase score
            //        - Remove (reset) harpoon
            //        - Play pop animation/sound in future
            //        - Call scoring/game state hooks if provided

            // Scaffolding: Mark bubble as dead, remove harpoon
            setBubbles((prev) => {
              const next = [...prev];
              next[idx] = { ...next[idx], alive: false }; // Mark as dead
              // In future: replace with split or remove for smallest
              return next;
            });
            setHarpoon(null);
          }
        });
      }

      // 2. Player collision with bubble
      bubbles.forEach((b) => {
        if (!b.alive) return;
        const bx = b.x,
          by = b.y,
          br = BUBBLE_SIZES[b.size].radius;
        const cx = characterX + CHARACTER_WIDTH / 2,
          cy = GROUND_Y - CHARACTER_HEIGHT / 2;
        const dist = Math.hypot(bx - cx, by - cy);
        if (dist < br + Math.max(CHARACTER_WIDTH, CHARACTER_HEIGHT) / 2.2) {
          // TODO: Lose a life, death animation/game over logic
          // (Currently just logs, no UI hook yet)
          // Optionally: set player hit state here
          // console.log('Player hit by bubble!');
        }
      });

      requestRef.current = requestAnimationFrame(gameLoop);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(requestRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [characterX, harpoon, harpoonCooldown, bubbles]);

  // Event handlers for mobile/UI controls so Controls.js can trigger logic
  const handleLeft = useCallback(
    () => setCharacterX((prev) => clamp(prev - CHARACTER_SPEED, 0, CANVAS_WIDTH - CHARACTER_WIDTH)),
    []
  );
  const handleRight = useCallback(
    () => setCharacterX((prev) => clamp(prev + CHARACTER_SPEED, 0, CANVAS_WIDTH - CHARACTER_WIDTH)),
    []
  );
  const handleShoot = useCallback(() => {
    if (!harpoon && !harpoonCooldown) {
      setHarpoon({
        x: characterX + CHARACTER_WIDTH / 2 - HARPOON_WIDTH / 2,
        y: GROUND_Y - CHARACTER_HEIGHT,
        active: true,
      });
      setHarpoonCooldown(true);
      setTimeout(() => setHarpoonCooldown(false), HARPOON_COOLDOWN);
    }
  }, [characterX, harpoon, harpoonCooldown]);

  // Render all entities using absolutely positioned divs for UI
  return (
    <div
      className="game-canvas"
      style={{
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        position: 'relative',
        background: 'linear-gradient(135deg, #2d72d9 85%, #fcc419 97%)',
        overflow: 'hidden',
      }}
      tabIndex={0}
    >
      {/* Game Background */}
      <div className="game-bg-arcade" />

      {/* Render All Bubbles */}
      {bubbles.map(
        (b, i) =>
          b.alive && (
            <div
              key={b.id}
              style={{
                position: 'absolute',
                left: `${b.x - BUBBLE_SIZES[b.size].radius}px`,
                top: `${b.y - BUBBLE_SIZES[b.size].radius}px`,
                width: `${BUBBLE_SIZES[b.size].radius * 2}px`,
                height: `${BUBBLE_SIZES[b.size].radius * 2}px`,
                borderRadius: '50%',
                background: BUBBLE_COLORS[b.size % BUBBLE_COLORS.length],
                border: '3px solid #fff',
                zIndex: 2,
                boxShadow: '0 2px 12px #2d72d988',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                transition: 'background 0.2s',
                opacity: 1,
              }}
            />
          )
      )}

      {/* Render Character */}
      <div
        style={{
          position: 'absolute',
          left: characterX,
          bottom: GROUND_Y - (CANVAS_HEIGHT - CHARACTER_HEIGHT),
          width: CHARACTER_WIDTH,
          height: CHARACTER_HEIGHT,
          zIndex: 3,
          pointerEvents: 'none',
        }}
      >
        <Character />
      </div>

      {/* Render Harpoon (if active) */}
      {harpoon && harpoon.active && (
        <div
          style={{
            position: 'absolute',
            left: harpoon.x,
            top: harpoon.y,
            width: HARPOON_WIDTH,
            height: GROUND_Y - harpoon.y,
            background:
              'linear-gradient(180deg, #fcc419 75%, #fff500 100%, #fcc419 130%)',
            borderRadius: '4px',
            boxShadow: '0 0 7px #fcc419af',
            zIndex: 2,
          }}
        />
      )}

      {/* Optional: Bubble emojis for reference
         <Bubbles /> 
      */}

      {/* Display no placeholder message: implemented */}
    </div>
  );
}

export default GameCanvas;
