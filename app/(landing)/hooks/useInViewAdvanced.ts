"use client";

import { useRef, useState, useEffect } from "react";

interface Options {
  threshold?: number;
  rootMargin?: string;
  oneTime?: boolean;
}

export function useInViewAdvanced(options: Options = {}) {
  const { threshold = 0.1, rootMargin = "0px", oneTime = true } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [ratio, setRatio] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setRatio(entry.intersectionRatio);
        if (entry.isIntersecting) {
          setInView(true);
          if (oneTime) observer.unobserve(el);
        } else if (!oneTime) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, oneTime]);

  return { ref, inView, ratio };
}
