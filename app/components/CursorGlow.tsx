"use client";

import { useEffect, useState } from "react";

type Position = {
  x: number;
  y: number;
};

export function CursorGlow() {
  const [enabled, setEnabled] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: none)");

    const updateEnabled = () => {
      setEnabled(!mediaQuery.matches);
    };

    const handleMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY });
    };

    updateEnabled();
    mediaQuery.addEventListener("change", updateEnabled);

    if (!mediaQuery.matches) {
      window.addEventListener("mousemove", handleMove);
    }

    return () => {
      mediaQuery.removeEventListener("change", updateEnabled);
      window.removeEventListener("mousemove", handleMove);
    };
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-10 h-[400px] w-[400px] rounded-full blur-3xl transition-transform duration-200 ease-out"
      style={{
        transform: `translate3d(${position.x - 200}px, ${position.y - 200}px, 0)`,
        background:
          "radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, rgba(167, 139, 250, 0.06) 35%, rgba(167, 139, 250, 0) 72%)",
      }}
    />
  );
}
