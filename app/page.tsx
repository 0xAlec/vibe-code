"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState, useRef } from "react";

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  const [isBurgerBig, setIsBurgerBig] = useState(false);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<{ id: number; dx: number; dy: number; x: number; y: number }[]>([]);
  const [gameOver, setGameOver] = useState(false);

  // Stock chart candles
  type Candle = { height: number; green: boolean };
  const [candles, setCandles] = useState<Candle[]>([]);

  // Reference to track last candle height for trending logic
  const lastHeightRef = useRef(140);
  const lastClickRef = useRef(Date.now());

  // initialize red candles trending downward
  useEffect(() => {
    const h = lastHeightRef.current; // 140
    const initial: Candle[] = [{ height: h, green: true }];
    lastHeightRef.current = h;
    setCandles(initial);
  }, []);

  // Live ticker that keeps adding red candles over time (negative trend)
  useEffect(() => {
    if (gameOver) return;

    const interval = setInterval(() => {
      setCandles((prev) => {
        // If user clicked within last 400ms, skip red candle
        if (Date.now() - lastClickRef.current < 400) {
          return prev;
        }

        let h = lastHeightRef.current;
        const delta = 4 + Math.random() * 6; // 4-10 px drop
        h = Math.max(0, h - delta); // price going down

        // Check for game over threshold (below 25)
        if (h <= 25) {
          setGameOver(true);
        }

        lastHeightRef.current = h;
        const next = [...prev, { height: h, green: false }];
        return next.slice(-60);
      });
    }, 300); // faster fall

    return () => clearInterval(interval);
  }, [gameOver]);

  const handleBurgerClick = (e: React.MouseEvent) => {
    setIsBurgerBig(true);
    // Reset size after 200ms
    setTimeout(() => setIsBurgerBig(false), 200);

    // Emit image particle
    if (gameOver) return;

    const id = Date.now();
    const { clientX: x, clientY: y } = e;
    const angle = Math.random() * Math.PI * 2;
    const distance = 80; // px
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    setParticles((prev) => [...prev, { id, dx, dy, x, y }]);

    // Increment score
    setScore((prev) => prev + 1);

    // Add a green candle (price pump)
    setCandles((prev) => {
      let h = lastHeightRef.current;
      const delta = 5 + Math.random() * 10; // 5-15 px rise
      h = Math.min(140, h + delta); // gradual pump up
      lastHeightRef.current = h;
      const next = [...prev, { height: h, green: true }];
      return next.slice(-60);
    });

    // Remove after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 600);

    // mark last click time to suppress next red candle
    lastClickRef.current = Date.now();
  };

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="relative flex flex-col min-h-screen items-center font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      {/* Score */}
      <div className="absolute top-4 right-4 text-xl font-bold select-none">
        Score: {score}
      </div>

      {/* Header */}
      <div className="mt-6 flex items-center space-x-3 select-none">
        <span className="text-3xl font-extrabold">Welcome to</span>
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/McDonald%27s_logo.svg/2560px-McDonald%27s_logo.svg.png"
          alt="McDonald's logo"
          className="w-36 h-auto"
          draggable={false}
        />
      </div>

      {/* Subheader */}
      <p className="mt-2 text-center text-sm max-w-md px-4 select-none">
        Flip the burger to pump the price of Ethereum! Don&apos;t let it fall below the threshold or it&apos;s game over!
      </p>

      {/* Stock chart background */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
        viewBox={`0 0 ${Math.max(60, candles.length || 1) * 10} 160`}
        preserveAspectRatio="none"
      >
        {candles.map((c, i) => {
          const x = i * 10 + 2;
          const y = 160 - c.height;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={6}
              height={c.height}
              fill={c.green ? "#22c55e" : "#ef4444"}
              opacity={0.4}
            />
          );
        })}

        {/* Game over threshold line */}
        <line
          x1={0}
          y1={160 - 25}
          x2={Math.max(60, candles.length || 1) * 10}
          y2={160 - 25}
          stroke="#ef4444"
          strokeDasharray="4 4"
          strokeWidth={2}
        />
      </svg>

      <main className="flex-1 flex items-center justify-center z-10 relative">
        <div className="relative flex items-center justify-center">
          {/* Burger SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 64 64"
            className={`w-48 h-48 cursor-pointer transition-transform duration-200 select-none ${isBurgerBig ? 'scale-110' : 'scale-100'}`}
            onClick={handleBurgerClick}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Top bun */}
            <path d="M8 24h48c0-8-12-12-24-12S8 16 8 24z" fill="#FCD34D" />
            {/* Sesame seeds */}
            <ellipse cx="18" cy="18" rx="2" ry="3" fill="#FFF7D6" />
            <ellipse cx="26" cy="14" rx="2" ry="3" fill="#FFF7D6" transform="rotate(-10 26 14)" />
            <ellipse cx="34" cy="17" rx="2" ry="3" fill="#FFF7D6" transform="rotate(12 34 17)" />
            <ellipse cx="42" cy="15" rx="2" ry="3" fill="#FFF7D6" transform="rotate(-8 42 15)" />
            <ellipse cx="50" cy="19" rx="2" ry="3" fill="#FFF7D6" transform="rotate(6 50 19)" />
            {/* Patty */}
            <rect x="8" y="24" width="48" height="8" fill="#9C4221" />
            {/* Lettuce */}
            <rect x="8" y="32" width="48" height="8" fill="#34D399" />
            {/* Bottom bun */}
            <rect x="8" y="40" width="48" height="8" fill="#FCD34D" />
            {/* Plate/shadow */}
            <rect x="8" y="48" width="48" height="4" fill="#9C4221" />
          </svg>

          {/* Particles handled in overlay */}
          <div className="fixed inset-0 pointer-events-none select-none z-50">
            {particles.map(({ id, dx, dy, x, y }) => (
              <img
                key={id}
                src="https://www.svgheart.com/wp-content/uploads/2020/09/-60.png"
                alt="Burger accessory"
                className="absolute w-24 h-24 object-contain animate-particle"
                style={{
                  left: x,
                  top: y,
                  "--dx": `${dx}px`,
                  "--dy": `${dy}px`,
                } as React.CSSProperties}
                draggable={false}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Particle animation keyframes */}
      <style jsx global>{`
        @keyframes particleFly {
          0% {
            opacity: 1;
            transform: translate(0, 0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(var(--dx), var(--dy)) scale(0.6);
          }
        }
        .animate-particle {
          animation: particleFly 0.6s ease-out forwards;
        }
      `}</style>

      {/* Game Over overlay */}
      {gameOver && (
        <div className="fixed inset-0 flex items-center justify-center z-40 bg-black bg-opacity-60 select-none">
          <span className="text-5xl font-extrabold text-red-500">Game Over</span>
        </div>
      )}
    </div>
  );
}
