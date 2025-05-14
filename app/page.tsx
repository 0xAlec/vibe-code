"use client";

import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  const [isBurgerBig, setIsBurgerBig] = useState(false);
  const [score, setScore] = useState(0);
  const [particles, setParticles] = useState<{ id: number; dx: number; dy: number; x: number; y: number }[]>([]);

  const handleBurgerClick = (e: React.MouseEvent) => {
    setIsBurgerBig(true);
    // Reset size after 200ms
    setTimeout(() => setIsBurgerBig(false), 200);

    // Emit image particle
    const id = Date.now();
    const { clientX: x, clientY: y } = e;
    const angle = Math.random() * Math.PI * 2;
    const distance = 80; // px
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    setParticles((prev) => [...prev, { id, dx, dy, x, y }]);

    // Increment score
    setScore((prev) => prev + 1);

    // Remove after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 600);
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

      <main className="flex-1 flex items-center justify-center">
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
    </div>
  );
}
