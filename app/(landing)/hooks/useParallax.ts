"use client";

import { useState, useEffect } from "react";

export function useParallax(factor = 0.5) {
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const handle = () => {
      setOffsetY(window.scrollY * factor);
    };
    window.addEventListener("scroll", handle, { passive: true });
    handle();
    return () => window.removeEventListener("scroll", handle);
  }, [factor]);

  return offsetY;
}
