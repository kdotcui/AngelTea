'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { PlinkoPhysics } from '@/lib/plinko/physics';
import { PRIZES } from '@/lib/plinko/prizes';
import { Prize } from '@/types/plinko';
import { soundManager } from '@/lib/plinko/sounds';
import { trackEvent } from '@/lib/analytics';

interface PlinkoGameProps {
  onPrizeWon: (prize: Prize) => void;
  canPlay: boolean;
}

export function PlinkoGame({ onPrizeWon, canPlay }: PlinkoGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PlinkoPhysics | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isDropping, setIsDropping] = useState(false);

  const initializeGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Callback for peg hits
    const handlePegHit = () => {
      soundManager.playPegHit();
    };

    if (!engineRef.current) {
      engineRef.current = new PlinkoPhysics(canvas.width, canvas.height, handlePegHit);
    } else {
      engineRef.current.resize(canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    initializeGame();
    window.addEventListener('resize', initializeGame);
    return () => {
      window.removeEventListener('resize', initializeGame);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initializeGame]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // No drop zone needed - using button instead

    // Draw pegs with hit animation
    const pegs = engine.getPegs();
    const now = Date.now();
    
    pegs.forEach((peg) => {
      // Check if peg was recently hit
      const timeSinceHit = peg.hitTime ? now - peg.hitTime : Infinity;
      const isAnimating = timeSinceHit < 150; // Animate for 150ms
      
      // Calculate animation properties
      const animationProgress = isAnimating ? 1 - (timeSinceHit / 150) : 0;
      const scaleMultiplier = 1 + (animationProgress * 0.8); // Grow up to 80% larger
      const glowAlpha = animationProgress * 0.6;
      
      const animatedRadius = peg.radius * scaleMultiplier;
      
      // Glow effect when hit
      if (isAnimating) {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, animatedRadius + 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${glowAlpha})`;
        ctx.fill();
      }
      
      // Peg shadow
      ctx.beginPath();
      ctx.arc(peg.x + 1, peg.y + 1, animatedRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      
      // Peg with gradient
      const pegGradient = ctx.createRadialGradient(
        peg.x - 1,
        peg.y - 1,
        0,
        peg.x,
        peg.y,
        animatedRadius
      );
      
      if (isAnimating) {
        // Brighter colors when hit
        pegGradient.addColorStop(0, '#94a3b8');
        pegGradient.addColorStop(1, '#475569');
      } else {
        pegGradient.addColorStop(0, '#64748b');
        pegGradient.addColorStop(1, '#334155');
      }
      
      ctx.beginPath();
      ctx.arc(peg.x, peg.y, animatedRadius, 0, Math.PI * 2);
      ctx.fillStyle = pegGradient;
      ctx.fill();
      ctx.strokeStyle = isAnimating ? '#cbd5e1' : '#94a3b8';
      ctx.lineWidth = isAnimating ? 2 : 1;
      ctx.stroke();
      
      // Clear hit flag after animation
      if (timeSinceHit > 150 && peg.hit) {
        peg.hit = false;
      }
    });

    // Draw ball
    const ball = engine.getBall();
    if (ball) {
      // Ball shadow
      ctx.beginPath();
      ctx.arc(ball.x + 2, ball.y + 2, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();

      // Ball gradient
      const ballGradient = ctx.createRadialGradient(
        ball.x - 2,
        ball.y - 2,
        0,
        ball.x,
        ball.y,
        ball.radius
      );
      ballGradient.addColorStop(0, '#fef3c7');
      ballGradient.addColorStop(1, '#f59e0b');
      
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = ballGradient;
      ctx.fill();
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw prize buckets at bottom
    const bucketHeight = 50;
    const bucketY = canvas.height - bucketHeight;
    const bucketWidth = canvas.width / PRIZES.length; // Dynamic based on prize count

    PRIZES.forEach((prize, index) => {
      const x = index * bucketWidth;
      
      // Bucket background
      ctx.fillStyle = prize.color;
      ctx.fillRect(x, bucketY, bucketWidth, bucketHeight);

      // Bucket border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, bucketY, bucketWidth, bucketHeight);

      // Prize text
      ctx.fillStyle = prize.textColor;
      ctx.font = 'bold 10px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const lines = prize.label.split(' ');
      lines.forEach((line, lineIndex) => {
        const lineY = bucketY + bucketHeight / 2 + (lineIndex - (lines.length - 1) / 2) * 12;
        ctx.fillText(line, x + bucketWidth / 2, lineY);
      });
    });
  }, []);

  const animate = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const stillFalling = engine.update();
    drawGame();

    if (stillFalling) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      // Ball has landed
      const bucketIndex = engine.getBucketIndex(PRIZES.length);
      const prize = PRIZES[Math.min(Math.max(0, bucketIndex), PRIZES.length - 1)];
      
      // Track prize won
      trackEvent('prize_won', {
        prize_type: prize.type,
        prize_label: prize.label,
        bucket_index: bucketIndex,
        is_win: prize.type !== 'better_luck',
      });
      
      setTimeout(() => {
        setIsDropping(false);
        engine.reset();
        
        // Play win sound if not "better luck"
        if (prize.type !== 'better_luck') {
          soundManager.playWin();
        }
        
        onPrizeWon(prize);
      }, 500);
    }
  }, [drawGame, onPrizeWon]);

  const handleDropBall = useCallback(() => {
    if (!canPlay || isDropping) return;

    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    // Drop ball from center
    const centerX = canvas.width / 2;

    // Track ball drop
    trackEvent('ball_drop', {
      bucket_count: PRIZES.length,
    });

    // Play drop sound
    soundManager.playDrop();

    setIsDropping(true);
    engine.dropBall(centerX);
    animate();
  }, [canPlay, isDropping, animate]);

  useEffect(() => {
    drawGame();
  }, [drawGame]);

  return (
    <div className="relative w-full max-w-xl mx-auto space-y-4">
      {/* Drop Button */}
      <div className="flex justify-center">
        <button
          onClick={handleDropBall}
          disabled={!canPlay || isDropping}
          className={`px-8 py-4 text-xl font-bold rounded-full shadow-lg transition-all ${
            canPlay && !isDropping
              ? 'bg-amber-500 hover:bg-amber-600 text-white hover:scale-105 cursor-pointer'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }`}
        >
          {isDropping ? 'Dropping...' : 'Drop Ball'}
        </button>
      </div>

      {/* Game Board */}
      <canvas
        ref={canvasRef}
        className="w-full h-[700px] rounded-lg border-4 border-amber-600 shadow-2xl"
      />
      
      {!canPlay && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 rounded-b-lg flex items-center justify-center py-4">
          <p className="text-white text-xl font-bold">No plays remaining today</p>
        </div>
      )}
    </div>
  );
}

