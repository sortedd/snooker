import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { Play, Trophy, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  number: number;
  glowIntensity: number;
}

export function InteractiveHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const ballsRef = useRef<Ball[]>([]);
  const animationRef = useRef<number>(0);
  const touchPosRef = useRef({ x: 0, y: 0 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const initBalls = useCallback((canvasWidth: number, canvasHeight: number) => {
    const balls: Ball[] = [];
    const isMobileView = canvasWidth < 768;
    
    // Responsive table positioning
    const tableCenterX = isMobileView ? canvasWidth * 0.5 : canvasWidth * 0.6;
    const tableCenterY = canvasHeight * 0.45;
    const ballRadius = isMobileView ? 6 : 9;
    const spacing = isMobileView ? 14 : 18;
    
    // Cue ball - positioned for visibility on both mobile and desktop
    const cueBallX = isMobileView ? canvasWidth * 0.2 : tableCenterX - 200;
    
    balls.push({
      x: cueBallX,
      y: tableCenterY,
      vx: 0,
      vy: 0,
      radius: ballRadius,
      color: '#FFFFFF',
      number: 0,
      glowIntensity: 0
    });

    // Triangle formation (15 reds) - smaller on mobile
    let row = 0;
    let col = 0;
    for (let i = 0; i < 15; i++) {
      if (col > row) {
        row++;
        col = 0;
      }
      balls.push({
        x: tableCenterX + col * spacing - row * (spacing / 2),
        y: tableCenterY + row * (spacing * 0.85) - (row * spacing * 0.85) / 2,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: ballRadius,
        color: '#DC2626',
        number: i + 1,
        glowIntensity: 0
      });
      col++;
    }

    // Color balls - positioned within visible area
    const offset = isMobileView ? 80 : 150;
    const colorPositions = [
      { x: tableCenterX - offset, y: tableCenterY - offset * 0.8, color: '#FFD700', num: 2 },
      { x: tableCenterX - offset, y: tableCenterY + offset * 0.8, color: '#228B22', num: 3 },
      { x: tableCenterX - offset * 0.6, y: tableCenterY, color: '#8B4513', num: 4 },
      { x: tableCenterX, y: tableCenterY, color: '#0000FF', num: 5 },
      { x: tableCenterX + offset * 0.6, y: tableCenterY, color: '#FF69B4', num: 6 },
      { x: tableCenterX + offset * 1.2, y: tableCenterY, color: '#000000', num: 7 },
    ];

    colorPositions.forEach(pos => {
      // Ensure balls stay within canvas
      const safeX = Math.max(ballRadius + 20, Math.min(canvasWidth - ballRadius - 20, pos.x));
      const safeY = Math.max(ballRadius + 20, Math.min(canvasHeight - ballRadius - 20, pos.y));
      
      balls.push({
        x: safeX,
        y: safeY,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: ballRadius,
        color: pos.color,
        number: pos.num,
        glowIntensity: 0
      });
    });

    return balls;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      
      // Reinitialize balls on resize to fit new dimensions
      ballsRef.current = initBalls(rect.width, rect.height);
    };
    
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    };

    // Touch tracking
    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const pos = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
      touchPosRef.current = pos;
      setMousePos(pos);
    };

    const handleTouchStart = (e: TouchEvent) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      touchPosRef.current = {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    };

    // Strike cue ball
    const strikeCueBall = (targetX: number, targetY: number) => {
      const balls = ballsRef.current;
      if (balls.length === 0) return;
      
      const cueBall = balls[0];
      const dx = targetX - cueBall.x;
      const dy = targetY - cueBall.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0) {
        const power = isMobile ? 6 : 8;
        cueBall.vx += (dx / dist) * power;
        cueBall.vy += (dy / dist) * power;
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      strikeCueBall(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      strikeCueBall(touchPosRef.current.x, touchPosRef.current.y);
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });

    // Animation loop
    const animate = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      const balls = ballsRef.current;
      if (balls.length === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      // Responsive table dimensions
      const isMobileView = width < 768;
      const tablePadding = isMobileView ? 10 : 40;
      const tableX = tablePadding;
      const tableY = height * 0.08;
      const tableW = width - tablePadding * 2;
      const tableH = height * 0.65;

      // Table shadow
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = isMobileView ? 20 : 40;
      ctx.shadowOffsetY = isMobileView ? 10 : 20;

      // Wood border
      const borderWidth = isMobileView ? 10 : 20;
      ctx.fillStyle = '#3d2314';
      ctx.fillRect(tableX - borderWidth, tableY - borderWidth, tableW + borderWidth * 2, tableH + borderWidth * 2);

      // Felt surface with gradient
      const feltGrad = ctx.createRadialGradient(
        tableX + tableW / 2, tableY + tableH / 2, 0,
        tableX + tableW / 2, tableY + tableH / 2, tableW / 2
      );
      feltGrad.addColorStop(0, '#1a5c3a');
      feltGrad.addColorStop(0.7, '#0d3d24');
      feltGrad.addColorStop(1, '#072a17');
      ctx.fillStyle = feltGrad;
      ctx.fillRect(tableX, tableY, tableW, tableH);

      ctx.shadowColor = 'transparent';

      // Pocket markers
      const pocketSize = isMobileView ? 14 : 22;
      const pockets = [
        { x: tableX, y: tableY },
        { x: tableX + tableW / 2, y: tableY },
        { x: tableX + tableW, y: tableY },
        { x: tableX, y: tableY + tableH },
        { x: tableX + tableW / 2, y: tableY + tableH },
        { x: tableX + tableW, y: tableY + tableH },
      ];

      pockets.forEach(pocket => {
        ctx.beginPath();
        ctx.arc(pocket.x, pocket.y, pocketSize, 0, Math.PI * 2);
        ctx.fillStyle = '#0a0a0a';
        ctx.fill();
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Update and draw balls
      balls.forEach((ball, i) => {
        // Physics
        ball.x += ball.vx;
        ball.y += ball.vy;

        // Friction
        ball.vx *= 0.995;
        ball.vy *= 0.995;

        // Stop if very slow
        if (Math.abs(ball.vx) < 0.01) ball.vx = 0;
        if (Math.abs(ball.vy) < 0.01) ball.vy = 0;

        // Table boundaries
        if (ball.x < tableX + ball.radius) {
          ball.x = tableX + ball.radius;
          ball.vx *= -0.8;
        }
        if (ball.x > tableX + tableW - ball.radius) {
          ball.x = tableX + tableW - ball.radius;
          ball.vx *= -0.8;
        }
        if (ball.y < tableY + ball.radius) {
          ball.y = tableY + ball.radius;
          ball.vy *= -0.8;
        }
        if (ball.y > tableY + tableH - ball.radius) {
          ball.y = tableY + tableH - ball.radius;
          ball.vy *= -0.8;
        }

        // Ball-to-ball collision
        for (let j = i + 1; j < balls.length; j++) {
          const other = balls[j];
          const dx = other.x - ball.x;
          const dy = other.y - ball.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = ball.radius + other.radius;

          if (dist < minDist && dist > 0) {
            const nx = dx / dist;
            const ny = dy / dist;
            const dvx = ball.vx - other.vx;
            const dvy = ball.vy - other.vy;
            const dvn = dvx * nx + dvy * ny;

            if (dvn > 0) {
              ball.vx -= dvn * nx;
              ball.vy -= dvn * ny;
              other.vx += dvn * nx;
              other.vy += dvn * ny;

              const overlap = minDist - dist;
              ball.x -= nx * overlap * 0.5;
              ball.y -= ny * overlap * 0.5;
              other.x += nx * overlap * 0.5;
              other.y += ny * overlap * 0.5;

              ball.glowIntensity = 1;
              other.glowIntensity = 1;
            }
          }
        }

        // Decay glow
        ball.glowIntensity *= 0.95;

        // Draw ball with 3D effect
        const ballGrad = ctx.createRadialGradient(
          ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, 0,
          ball.x, ball.y, ball.radius
        );
        ballGrad.addColorStop(0, lighten(ball.color, 40));
        ballGrad.addColorStop(0.3, ball.color);
        ballGrad.addColorStop(1, darken(ball.color, 30));

        if (ball.glowIntensity > 0.01) {
          ctx.shadowColor = ball.color;
          ctx.shadowBlur = 15 * ball.glowIntensity;
        }

        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ballGrad;
        ctx.fill();
        ctx.shadowColor = 'transparent';

        // Highlight
        ctx.beginPath();
        ctx.arc(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.35, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();

        // Number on colored balls
        if (ball.number > 0 && ball.color !== '#DC2626' && !isMobileView) {
          ctx.fillStyle = ball.color === '#000000' || ball.color === '#0000FF' ? '#fff' : '#000';
          ctx.font = `bold ${ball.radius}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(String(ball.number), ball.x, ball.y);
        }
      });

      // Draw cue stick (only on desktop or if touch is active)
      if (!isMobileView) {
        const cueBall = balls[0];
        const currentPos = mousePos.x !== 0 ? mousePos : { x: cueBall.x + 100, y: cueBall.y };
        const dx = currentPos.x - cueBall.x;
        const dy = currentPos.y - cueBall.y;
        const angle = Math.atan2(dy, dx);
        const cueLength = isMobileView ? 120 : 180;

        ctx.save();
        ctx.translate(cueBall.x, cueBall.y);
        ctx.rotate(angle);
        
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetY = 3;

        ctx.fillStyle = '#d4a574';
        ctx.fillRect(-cueLength - 30, -3, cueLength, 6);
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(-cueLength - 35, -2, 5, 4);
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(-cueLength - 25, -3, 12, 6);
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(-cueLength - 22, -3, 2, 6);

        ctx.restore();
        ctx.shadowColor = 'transparent';

        // Power indicator
        const power = Math.min(Math.sqrt(dx * dx + dy * dy) / 200, 1);
        ctx.beginPath();
        ctx.moveTo(cueBall.x, cueBall.y);
        ctx.lineTo(
          cueBall.x + Math.cos(angle) * power * 80,
          cueBall.y + Math.sin(angle) * power * 80
        );
        ctx.strokeStyle = `rgba(255, 255, 255, ${power * 0.4})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mousePos, initBalls, isMobile]);

  // Color helpers
  function lighten(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  function darken(color: string, percent: number): string {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.max(0, (num >> 16) - amt);
    const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
    const B = Math.max(0, (num & 0x0000FF) - amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  }

  return (
    <div ref={containerRef} className="relative w-full min-h-[100dvh] overflow-hidden bg-black">
      {/* Interactive Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{ touchAction: 'none' }}
      />

      {/* Atmospheric overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent" />
        
        {/* Animated particles - fewer on mobile */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(isMobile ? 10 : 20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -80, 0],
                x: [0, Math.random() * 30 - 15, 0],
                opacity: [0, 0.4, 0],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Content - Mobile optimized */}
      <motion.div 
        className="relative z-10 flex flex-col justify-end md:justify-center h-full px-4 sm:px-6 md:px-12 lg:px-20 pb-24 md:pb-0 max-w-7xl"
        style={{ y, opacity }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center gap-2 mb-4 md:mb-6"
        >
          <span className="px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full backdrop-blur-md flex items-center gap-1.5 md:gap-2">
            <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3" />
            Ace Snooker Family
          </span>
          <span className="px-3 py-1.5 md:px-4 md:py-2 text-[10px] md:text-xs font-bold uppercase tracking-widest bg-white/10 text-white/80 border border-white/20 rounded-full backdrop-blur-md flex items-center gap-1.5 md:gap-2">
            <Trophy className="w-2.5 h-2.5 md:w-3 md:h-3" />
            2026 Championship
          </span>
        </motion.div>

        {/* Main Title - Responsive sizes */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="space-y-0.5 md:space-y-1"
        >
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black italic uppercase tracking-tighter leading-[0.85]">
            <span className="block text-white">ACE</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-500">
              SNOOKER
            </span>
            <span className="block text-white">TOUR</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 font-light mt-4 md:mt-6 max-w-md md:max-w-lg"
        >
          Experience the most immersive snooker tournament. 
          <span className="text-white font-medium block mt-1 md:mt-0 md:inline">
            {isMobile ? 'Tap the table to take a shot!' : 'Click anywhere on the table to take a shot!'}
          </span>
        </motion.p>

        {/* CTA Buttons - Stack on mobile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-3 md:gap-4 mt-6 md:mt-10"
        >
          <Link
            to="/matches"
            className="group flex items-center justify-center gap-2 md:gap-3 bg-white text-black px-6 py-3 md:px-8 md:py-4 rounded-full font-bold uppercase tracking-wide text-sm md:text-base hover:bg-emerald-400 transition-all transform hover:scale-105 shadow-lg shadow-white/10"
          >
            <Play className="w-4 h-4 md:w-5 md:h-5 fill-current group-hover:scale-110 transition-transform" />
            Watch Matches
          </Link>
          <Link
            to="/bracket"
            className="flex items-center justify-center gap-2 md:gap-3 bg-white/10 backdrop-blur-md text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-bold uppercase tracking-wide text-sm md:text-base hover:bg-white/20 transition-all border border-white/20"
          >
            <Trophy className="w-4 h-4 md:w-5 md:h-5" />
            View Bracket
          </Link>
        </motion.div>

        {/* Interactive hint - Bottom on mobile */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="flex items-center gap-2 md:gap-3 text-xs md:text-sm text-gray-500 mt-4 md:mt-8 md:absolute md:bottom-10"
        >
          <motion.div
            animate={{ x: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </motion.div>
          <span>{isMobile ? 'Tap to aim & shoot' : 'Move mouse to aim • Click to shoot'}</span>
        </motion.div>
      </motion.div>

      {/* Score display - Hidden on small mobile, smaller on tablet */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="absolute top-16 right-3 md:top-10 md:right-8 lg:right-16 glass-panel p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-white/10 hidden sm:block"
      >
        <div className="text-[10px] md:text-xs text-gray-400 uppercase tracking-wider mb-1 md:mb-2">Live Tournament</div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-center">
            <div className="text-lg md:text-2xl font-black text-white">16</div>
            <div className="text-[8px] md:text-[10px] text-gray-500 uppercase">Players</div>
          </div>
          <div className="w-px h-5 md:h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-lg md:text-2xl font-black text-emerald-400">15</div>
            <div className="text-[8px] md:text-[10px] text-gray-500 uppercase">Matches</div>
          </div>
          <div className="w-px h-5 md:h-8 bg-white/20" />
          <div className="text-center">
            <div className="text-lg md:text-2xl font-black text-white">4</div>
            <div className="text-[8px] md:text-[10px] text-gray-500 uppercase">Rounds</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
