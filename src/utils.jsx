// --- UTILITY & MOCK HELPERS ---
import React, { useState, useEffect } from "react";
export const classes = (...args) => args.filter(Boolean).join(" ");
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const useMockReducedMotion = () => false;
export const VisuallyHidden = ({ children, className, ...rest }) => (
  <span
    className={classes(
      "absolute border-0 w-px h-px p-0 -m-px overflow-hidden clip-rect-0 whitespace-nowrap",
      className,
    )}
    {...rest}
  >
    {children}
  </span>
);
export const Icon = ({ icon, ...rest }) => React.cloneElement(icon, rest);
export const useInViewport = (ref, once) => {
  const [inViewport, setInViewport] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInViewport(true);
          if (once) observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, once]);
  return inViewport;
};
