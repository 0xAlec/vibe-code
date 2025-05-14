"use client";

import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect, useState } from "react";

export default function App() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  const [isBurgerBig, setIsBurgerBig] = useState(false);
  const [particles, setParticles] = useState<{ id: number; dx: number; dy: number }[]>([]);

  const handleBurgerClick = () => {
    setIsBurgerBig(true);
    // Reset size after 200ms
    setTimeout(() => setIsBurgerBig(false), 200);

    // Emit image particle
    const id = Date.now();
    const angle = Math.random() * Math.PI * 2;
    const distance = 80; // px
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    setParticles((prev) => [...prev, { id, dx, dy }]);

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
    <div className="flex flex-col min-h-screen items-center font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <header className="w-full max-w-md px-4 py-3 flex justify-center h-11">
        <Wallet>
          <ConnectWallet>
            <Name className="text-inherit" />
          </ConnectWallet>
          <WalletDropdown>
            <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
              <Avatar />
              <Name />
              <Address />
              <EthBalance />
            </Identity>
            <WalletDropdownDisconnect />
          </WalletDropdown>
        </Wallet>
      </header>

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
            {/* Patty */}
            <rect x="8" y="24" width="48" height="8" fill="#9C4221" />
            {/* Lettuce */}
            <rect x="8" y="32" width="48" height="8" fill="#34D399" />
            {/* Bottom bun */}
            <rect x="8" y="40" width="48" height="8" fill="#FCD34D" />
            {/* Plate/shadow */}
            <rect x="8" y="48" width="48" height="4" fill="#9C4221" />
          </svg>

          {/* Emitted images */}
          {particles.map(({ id, dx, dy }) => (
            <img
              key={id}
              src="https://www.svgheart.com/wp-content/uploads/2020/09/-60.png"
              alt="Burger accessory"
              className="absolute w-12 h-12 object-contain animate-particle pointer-events-none select-none"
              style={{
                // CSS custom properties for the keyframes
                "--dx": `${dx}px`,
                "--dy": `${dy}px`,
              } as React.CSSProperties}
              draggable={false}
            />
          ))}
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
