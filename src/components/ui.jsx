import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useEffect } from "react";
import { galleryData } from "../gallery_data";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

const MotionDiv = motion.div;
const MotionImg = motion.img;

export const CustomLogo = () => (
  <div className="grid h-9 w-[3.35rem] place-items-center rounded-[var(--radius)] border border-[rgba(var(--accent-rgb),0.35)] bg-[rgba(var(--accent-rgb),0.08)] font-mono text-[0.68rem] font-black tracking-[0.12em] text-[var(--accent)]">
    SR/00
  </div>
);

export const ToolkitItem = ({ icon, name, delay }) => (
  <MotionDiv
    className="card flex flex-col items-center justify-center gap-2 p-4"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ y: -2 }}
  >
    <div className="h-10 w-10 text-[var(--accent)]">{icon}</div>
    <span className="text-sm font-bold text-[var(--text-muted)]">{name}</span>
  </MotionDiv>
);

export const FullscreenImage = ({ src, onClose, onNavigate }) => {
  const currentIndex = src;

  useEffect(() => {
    if (currentIndex === null) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        onNavigate("prev");
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        onNavigate("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, onClose, onNavigate]);

  if (currentIndex === null) return null;

  const image = galleryData[currentIndex];

  const variants = {
    enter: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
    }),
  };

  const direction = 1;

  return (
    <MotionDiv
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        className="absolute right-6 top-6 z-50 rounded-md border border-white/10 bg-white/5 p-2 text-white/70 transition-colors hover:text-white"
        onClick={onClose}
        aria-label="Close image"
      >
        <X size={32} />
      </button>

      {/* Prev Button */}
      <button
        className="absolute left-4 z-50 rounded-md border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:text-white sm:left-8"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate("prev");
        }}
      >
        <ChevronLeft size={48} />
      </button>

      {/* Next Button */}
      <button
        className="absolute right-4 z-50 rounded-md border border-white/10 bg-white/5 p-3 text-white/60 transition-colors hover:text-white sm:right-8"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate("next");
        }}
      >
        <ChevronRight size={48} />
      </button>

      <AnimatePresence initial={false} custom={direction}>
        <MotionImg
          key={currentIndex}
          src={image.src}
          alt={image.alt}
          className="max-h-[90vh] max-w-[90vw] rounded-[var(--radius)] object-contain shadow-2xl"
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          custom={direction}
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
        />
      </AnimatePresence>
    </MotionDiv>
  );
};

// AnimateOnScroll Helper Component
export const AnimateOnScroll = ({ children, delay = 0 }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("opacity-100", "translate-y-0");
            entry.target.classList.remove("opacity-0", "translate-y-5");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-5 transition-all duration-700"
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const Card = ({ children, className = "" }) => {
  return (
    <div className={`content-card ${className}`}>
      {children}
    </div>
  );
};

// CodeWindow Component
export const CodeWindow = ({ className = "", code, language, title }) => {
  return (
    <div
      className={"code-window " + className}
    >
      <div className="code-window-header">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[var(--danger)]"></div>
          <div className="h-2 w-2 rounded-full bg-[var(--accent-strong)]"></div>
          <div className="h-2 w-2 rounded-full bg-[var(--accent)]"></div>
        </div>
        {title && <p>{title}</p>}
      </div>
      <div className="code-window-body">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{ background: "transparent", margin: 0, padding: 14 }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

import { useLocation } from "react-router-dom";

export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// BarChart Component
export const BarChart = ({ data, options }) => {
  const chartRef = React.useRef(null);
  const chartInstance = React.useRef(null);

  React.useEffect(() => {
    const ChartJS = window.Chart;
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }
    if (chartRef.current && ChartJS) {
      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new ChartJS(ctx, {
        type: "bar",
        data: data,
        options: options,
      });
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, options]);

  return (
    <div className="chart-container relative mx-auto h-[350px] w-full max-w-xl">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

import { CheckSquare, Square } from "lucide-react";

export const ChecklistItem = ({ text, checked }) => (
  <li className={`flex items-center ${!checked ? "text-[var(--text-muted)]" : ""}`}>
    {checked ? (
      <CheckSquare className="h-5 w-5 flex-shrink-0 text-[var(--accent)]" />
    ) : (
      <Square className="h-5 w-5 flex-shrink-0 text-[var(--text-subtle)]" />
    )}
    <span
      className={`ml-3 font-medium ${!checked ? "text-[var(--text-muted)]" : ""}`}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  </li>
);
