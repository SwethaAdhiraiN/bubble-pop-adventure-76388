import React, { useRef, useEffect, useCallback, useState } from 'react';
import Character from './Character';
import Harpoon from './Harpoon';
import Powerup from './Powerup';
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
  // Increase bubbles and difficulty each level.
  // Up to 3 base bubbles, spawn more at higher levels, increase speed and size distribution.
  const bubbles = [];
  const numBase = Math.min(2 + Math.floor(level/2), 5);
  for (let i = 0; i < numBase; ++i) {
    // Bubble size: more variety as levels increase
    const sizeIdx =
      i < 2
        ? 0
        : Math.random() < 0.33 + level * 0.07
        ? 1
        : 0;
    // Speed up a bit per level
    let baseVx = 2.0 + 0.33 * (level + i);
    if (level > 2)
      baseVx += Math.random() * (0.19 + 0.081 * level);
    bubbles.push({
      id: Date.now() + Math.random() + "_" + i,
      x:
        (CANVAS_WIDTH / (numBase + 1)) *
          (1 + i) +
        ((Math.random() - 0.5) * 45 * (sizeIdx + 1)),
      y: 65 + Math.random() * 45,
      vx: (i % 2 === 0 ? 1 : -1) * baseVx,
      vy: 0,
      size: sizeIdx,
      alive: true,
    });
  }
  return bubbles;
}

/**
 * Playground boundary check helper
 */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// PUBLIC_INTERFACE
/**
 * GameCanvas now supports shield powerup logic. Receives new props:
 *   - onGrantShield: function to activate shield ability
 *   - shieldActive: boolean, whether shield is on
 *   - onShieldUsed: callback fired when shield absorbs hit
 */
function GameCanvas({
  onScore,
  onLifeLost,
  onAllBubblesCleared,
  level = 1,
  onGrantShield,
  shieldActive,
  onShieldUsed,
}) {
  /**
   * Renders and runs main game logic, including:
   * - Character movement (left/right), boundary check
   * - Harpoon shooting, cooldown, and state
   * - Bubbles: gravity, bounce, and wall reflection
   * - Collision detection for harpoon/bubble, player/bubble
   * - Bubble popping/splitting and scoring
   * - Hooks for parent score/life/level
   */
  const [characterX, setCharacterX] = useState(CANVAS_WIDTH / 2 - CHARACTER_WIDTH / 2);
  const [characterDir, setCharacterDir] = useState(0);
  const [harpoon, setHarpoon] = useState(null); // {x, y, active}
  const [harpoonCooldown, setHarpoonCooldown] = useState(false);
  const [bubbles, setBubbles] = useState(getInitialBubbles(level));
  const [scorePending, setScorePending] = useState(null); // {pts, x, y, size}
  const [popFx, setPopFx] = useState(null); // {x, y, triggerTime}
  const [audioPopKey, setAudioPopKey] = useState(0);
  const [charHit, setCharHit] = useState(false); // For character "death" animation

  // Powerup logic
  const [powerup, setPowerup] = useState(null); // {x, y, visible: bool, id: stamp}
  const powerupTimeout = useRef(null);

  // Reset bubbles/character/powerup state on new level
  useEffect(() => {
    setBubbles(getInitialBubbles(level));
    setHarpoon(null);
    setScorePending(null);
    setCharacterX(CANVAS_WIDTH / 2 - CHARACTER_WIDTH / 2);
    setCharHit(false);
    setPowerup(null);
    if (powerupTimeout.current) {
      clearTimeout(powerupTimeout.current);
      powerupTimeout.current = null;
    }
    // Schedule next random powerup
    spawnPowerupRandom();
    // eslint-disable-next-line
  }, [level]);

  // Schedule the next powerup to appear after a random delay (3-10 sec); will respawn after collect/use quickly
  const spawnPowerupRandom = useCallback(() => {
    if (powerupTimeout.current) clearTimeout(powerupTimeout.current);
    const delay = 3000 + Math.random() * 7000; // Between 3s and 10s
    powerupTimeout.current = setTimeout(() => {
      setPowerup({
        visible: true,
        id: Date.now(),
        // Appear randomly around the center area, but not exactly same location each time
        x: CANVAS_WIDTH / 2 + Math.floor((Math.random() - 0.5) * 22),
        y: CANVAS_HEIGHT / 2 + Math.floor((Math.random() - 0.5) * 40),
      });
    }, delay);
  }, []);

  // After collection/use, remove and schedule next after a short delay.
  const removeAndReschedulePowerup = useCallback(() => {
    setPowerup(null);
    if (powerupTimeout.current) clearTimeout(powerupTimeout.current);
    // Next appear after 6-12s if not at end of level
    powerupTimeout.current = setTimeout(() => {
      spawnPowerupRandom();
    }, 6000 + Math.random() * 6000);
  }, [spawnPowerupRandom]);

  // For efficient game loop (stores mutable, non-reactive refs)
  const requestRef = useRef();
  const keyState = useRef({});

  // Keyboard handlers
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

  // Main loop: movement, collisions, pops, scoring, etc.
  useEffect(() => {
    let shootLock = false;
    let lastTimestamp = performance.now();

    function gameLoop(now) {
      lastTimestamp = now;

      // --- Character Movement Logic ---
      let dir = (keyState.current.right ? 1 : 0) - (keyState.current.left ? 1 : 0);
      setCharacterDir(dir);

      setCharacterX((prevX) => {
        let newX = prevX + dir * CHARACTER_SPEED;
        newX = clamp(newX, 0, CANVAS_WIDTH - CHARACTER_WIDTH);
        return newX;
      });

      // --- Harpoon Shooting Logic ---
      if (keyState.current.shoot && !harpoonCooldown && !harpoon && !shootLock) {
        setHarpoon({
          x: characterX + CHARACTER_WIDTH / 2 - HARPOON_WIDTH / 2,
          y: GROUND_Y - CHARACTER_HEIGHT,
          active: true,
        });
        setHarpoonCooldown(true);
        shootLock = true;
        setTimeout(() => setHarpoonCooldown(false), HARPOON_COOLDOWN);
      } else if (!keyState.current.shoot) {
        shootLock = false;
      }

      // --- Harpoon Ascend ---
      setHarpoon((prev) => {
        if (!prev || !prev.active) return null;
        let newY = prev.y - HARPOON_SPEED;
        if (newY < 0) return null;
        return { ...prev, y: newY, active: true };
      });

      // --- Bubbles Physics Update ---
      setBubbles((prevBubbles) =>
        prevBubbles.map((b) => {
          if (!b.alive) return b;
          let newVy = b.vy + BUBBLE_GRAVITY;
          let newY = b.y + newVy;
          let newX = b.x + b.vx;
          let newVx = b.vx;

          if (newY + BUBBLE_SIZES[b.size].radius > GROUND_Y) {
            newY = GROUND_Y - BUBBLE_SIZES[b.size].radius;
            newVy = BUBBLE_BOUNCE_VY;
          }

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

      // --- Powerup Collect Logic: Character collision with powerup
      if (powerup && powerup.visible) {
        // Check AABB circle with center (characterX + w/2, GROUND_Y - CHARACTER_HEIGHT/2)
        // radius: 26
        const px = powerup.x, py = powerup.y, pr = 22;
        const cx = characterX + CHARACTER_WIDTH / 2, cy = GROUND_Y - CHARACTER_HEIGHT / 2;
        const distPower = Math.hypot(px - cx, py - cy);
        if (distPower < pr + Math.max(CHARACTER_WIDTH, CHARACTER_HEIGHT) / 2.1) {
          // Collect and grant shield
          if (typeof onGrantShield === 'function') onGrantShield();
          removeAndReschedulePowerup();
        }
      }

      // --- Collision Detection: Harpoon <-> Bubble ---
      if (harpoon && harpoon.active) {
        let harpoonUsed = false;
        bubbles.forEach((b, idx) => {
          if (!b.alive) return;
          const bx = b.x;
          const by = b.y;
          const br = BUBBLE_SIZES[b.size].radius;
          const hx = harpoon.x + HARPOON_WIDTH / 2;
          const hy = harpoon.y;
          // Bubble's circle intersects with vertical harpoon line (hx)
          const atXSweep = hx > bx - br && hx < bx + br;
          const bubbleTop = by - br, bubbleBot = by + br;
          const crossesBubble = hy < bubbleBot && (GROUND_Y - CHARACTER_HEIGHT) > bubbleTop;
          if (atXSweep && crossesBubble && !harpoonUsed) {
            // Handle pop/split
            setBubbles((prev) => {
              const next = [...prev];
              const hit = next[idx];
              if (!hit.alive) return next;
              // Not smallest: split, else remove
              if (hit.size < BUBBLE_SIZES.length - 1) {
                const newsz = hit.size + 1;
                const speed = 3.2 + Math.random() * 1.9;
                const left = {
                  ...hit,
                  id: Date.now() + Math.random(),
                  x: hit.x - BUBBLE_SIZES[newsz].radius * 0.7,
                  y: hit.y,
                  size: newsz,
                  vx: -Math.abs(speed),
                  vy: BUBBLE_BOUNCE_VY * (0.95 + Math.random() * 0.14),
                  alive: true,
                };
                const right = {
                  ...hit,
                  id: Date.now() + Math.random(),
                  x: hit.x + BUBBLE_SIZES[newsz].radius * 0.7,
                  y: hit.y,
                  size: newsz,
                  vx: +Math.abs(speed),
                  vy: BUBBLE_BOUNCE_VY * (0.95 + Math.random() * 0.14),
                  alive: true,
                };
                next[idx] = { ...hit, alive: false };
                next.push(left, right);
              } else {
                next[idx] = { ...hit, alive: false };
              }
              return next;
            });
            // Award score
            const score = BUBBLE_SIZES[b.size].score;
            setScorePending({ pts: score, x: bx, y: by, size: b.size });
            if (typeof onScore === "function") {
              onScore(score, { bubbleSize: b.size, position: { x: bx, y: by } });
            }
            // Visual + audio feedback
            setPopFx({ x: bx, y: by, triggerTime: now });
            setAudioPopKey(k => k + 1);
            setHarpoon(null);
            harpoonUsed = true;
          }
        });
      }

      // --- Player <-> Bubble collision (with shield logic)
      let playerLose = false;
      let bubbleHitIdx = -1;
      bubbles.forEach((b, i) => {
        if (!b.alive) return;
        const bx = b.x,
          by = b.y,
          br = BUBBLE_SIZES[b.size].radius;
        const cx = characterX + CHARACTER_WIDTH / 2,
          cy = GROUND_Y - CHARACTER_HEIGHT / 2;
        const dist = Math.hypot(bx - cx, by - cy);
        if (dist < br + Math.max(CHARACTER_WIDTH, CHARACTER_HEIGHT) / 2.1 && !playerLose) {
          playerLose = true;
          bubbleHitIdx = i;
        }
      });

      if (playerLose) {
        if (shieldActive) {
          // Absorb hit, remove bubble, clear shield, FX
          setCharHit(true); // visual effect for character hit
          setTimeout(() => setCharHit(false), 590);
          if (bubbleHitIdx >= 0) {
            setBubbles((prev) => {
              const next = [...prev];
              if (next[bubbleHitIdx]) next[bubbleHitIdx].alive = false;
              return next;
            });
          }
          if (typeof onShieldUsed === "function") onShieldUsed();
          removeAndReschedulePowerup();
        } else {
          // Standard lose logic
          setCharHit(true); // visual effect for character hit
          setTimeout(() => setCharHit(false), 590);
          if (typeof onLifeLost === "function") onLifeLost();
        }
      }

      // --- Level Clear: trigger win if no bubbles alive
      if (bubbles.every(b => !b.alive)) {
        if (typeof onAllBubblesCleared === "function") {
          onAllBubblesCleared();
        }
      }

      requestRef.current = requestAnimationFrame(gameLoop);
    }

    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      cancelAnimationFrame(requestRef.current);
      if (powerupTimeout.current) clearTimeout(powerupTimeout.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    characterX,
    harpoon,
    harpoonCooldown,
    bubbles,
    onScore,
    onLifeLost,
    onAllBubblesCleared,
    level,
    shieldActive,
    onGrantShield,
    onShieldUsed,
    removeAndReschedulePowerup,
    powerup
  ]);

  // Score visual pop/fade
  useEffect(() => {
    let timer;
    if (scorePending) {
      timer = setTimeout(() => setScorePending(null), 650);
    }
    return () => clearTimeout(timer);
  }, [scorePending]);

  // Scaffold: pop sound trigger for effect
  useEffect(() => {
    if (popFx) {
      const t = setTimeout(() => setPopFx(null), 200);
      return () => clearTimeout(t);
    }
  }, [popFx]);

  // Render game canvas, bubbles, character, harpoon, floating feedback, etc.
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

      {/* Powerup visual */}
      {powerup && powerup.visible && (
        <Powerup x={powerup.x} y={powerup.y} visible={powerup.visible} />
      )}

      {/* Render Bubbles */}
      {bubbles.map(
        (b, i) =>
          b.alive && (
            <div
              key={b.id}
              className={popFx && popFx.x === b.x && popFx.y === b.y ? "bubble-popper-fx" : ""}
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
                boxShadow: '0 2px 9px #2d72d980',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                filter: popFx && popFx.x === b.x && popFx.y === b.y ? 'brightness(1.8) drop-shadow(0 0 14px #fff)' : undefined,
                opacity: 1,
                transition: 'background 0.2s, filter 0.24s',
              }}
            >
              {/* Bubble visual core */}
              <span
                style={{
                  width: '80%',
                  height: '80%',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 33% 26%, #fff8, #fff2 60%, transparent)',
                  display: 'block',
                }}
              />
            </div>
          )
      )}

      {/* Bubble Pop FX: animated circle & audio hook */}
      {popFx && (
        <div
          key={'popfx-' + popFx.triggerTime}
          style={{
            position: 'absolute',
            left: popFx.x - 14,
            top: popFx.y - 14,
            width: 28,
            height: 28,
            borderRadius: '50%',
            zIndex: 9,
            border: '2.5px dashed #fcc419',
            background: 'rgba(252,196,25,0.2)',
            pointerEvents: 'none',
            opacity: 1,
            animation: 'bubble-pop-fx .27s cubic-bezier(0.35,1.78,0.45,0.95) forwards',
          }}
        />
      )}
      {/* Scaffold: For pop sound fx, this may trigger a useEffect in future with a SFX library */}
      {/* {audioPopKey && <audio autoPlay src='bubble-pop.wav' />} */}

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
        <span className={charHit ? "character-hit-fx" : ""} style={{ display: "block", width: "100%", height: "100%" }}>
          <Character />
        </span>
      </div>

      {/* Render Harpoon (if active) */}
      {harpoon && harpoon.active && (
        <div
          className="harpoon-fx"
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
            transition: 'opacity 0.1s',
          }}
        />
      )}

      {/* Score pop-up effect */}
      {scorePending && (
        <div
          style={{
            position: 'absolute',
            left: scorePending.x - 8,
            top: scorePending.y - 22,
            padding: '1px 9px',
            background: 'rgba(50,200,255,0.89)',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 18 + scorePending.size * 2,
            zIndex: 99,
            pointerEvents: 'none',
            border: '1.5px solid #fcc419',
            opacity: 0.92,
            boxShadow: '0 0 11px #2d72d955',
            animation: 'score-popup-fade 0.6s linear',
          }}
        >
          +{scorePending.pts}
        </div>
      )}

      {/* Bubble emojis for debugging/reference */}
      {/* <Bubbles /> */}

      {/* Note: Add keyframes for 'bubble-pop-fx' and 'score-popup-fade' in App.css for visual effect */}
    </div>
  );
}

export default GameCanvas;
