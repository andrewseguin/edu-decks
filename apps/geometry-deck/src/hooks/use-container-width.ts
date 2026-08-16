"use client";

import { useState, useEffect, useRef } from "react";

export function useContainerWidth(defaultWidth = 320) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(defaultWidth);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateWidth = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0) {
        setWidth(Math.round(rect.width));
      }
    };

    updateWidth();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setWidth(Math.round(entry.contentRect.width));
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { containerRef, width };
}
