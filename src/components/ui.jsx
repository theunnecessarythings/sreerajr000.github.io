import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useRef, useEffect } from "react";
import { galleryData } from "../gallery_data";
import { useNavigate } from "react-router-dom";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

export const CustomLogo = () => (
  <div className="flex items-center gap-1.5">
    <div className="w-6 h-6 bg-gray-300"></div>
    <div className="flex flex-col gap-1.5">
      <div className="w-6 h-1 bg-gray-300"></div>
      <div className="w-4 h-1 bg-gray-300"></div>
    </div>
  </div>
);

export const ToolkitItem = ({ icon, name, delay }) => (
  <motion.div
    className="flex flex-col items-center justify-center gap-2 p-4 bg-gray-800/50 border border-gray-700/50"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
    whileHover={{ scale: 1.05, backgroundColor: "rgba(55, 65, 81, 0.7)" }}
  >
    <div className="w-10 h-10 text-yellow-400">{icon}</div>
    <span className="font-body font-bold text-sm text-gray-300">{name}</span>
  </motion.div>
);

export const FullscreenImage = ({ src, onClose, onNavigate }) => {
  const currentIndex = src;
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
    <motion.div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors z-50"
        onClick={onClose}
      >
        <X size={32} />
      </button>

      {/* Prev Button */}
      <button
        className="absolute left-4 sm:left-8 text-white/50 hover:text-white transition-colors z-50 p-4"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate("prev");
        }}
      >
        <ChevronLeft size={48} />
      </button>

      {/* Next Button */}
      <button
        className="absolute right-4 sm:right-8 text-white/50 hover:text-white transition-colors z-50 p-4"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate("next");
        }}
      >
        <ChevronRight size={48} />
      </button>

      <AnimatePresence initial={false} custom={direction}>
        <motion.img
          key={currentIndex}
          src={image.src}
          alt={image.alt}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
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
    </motion.div>
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
    <div
      className={`border border-gray-600 p-6 rounded-lg bg-black/20 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};

// CodeWindow Component
export const CodeWindow = ({ className = "", code, language, title }) => {
  return (
    <div
      className={
        "bg-gray-900/70 border border-gray-700 rounded-lg shadow-lg my-6 " +
        className
      }
    >
      <div className="flex items-center justify-between px-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
        </div>
        {title && (
          <p
            className="text-sm text-white"
            style={{ fontFamily: "monospace", margin: "4px" }}
          >
            {title}
          </p>
        )}
        <div></div>
      </div>
      <div className="text-sm grid">
        <SyntaxHighlighter
          language={language}
          style={atomDark}
          customStyle={{ background: "transparent", margin: 0, padding: 12 }}
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
    <div className="chart-container relative w-full h-[350px] max-w-xl mx-auto">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

import { CheckSquare, Square } from "lucide-react";

export const ChecklistItem = ({ text, checked }) => (
  <li className={`flex items-center ${!checked ? "text-gray-400" : ""}`}>
    {checked ? (
      <CheckSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
    ) : (
      <Square className="w-5 h-5 text-gray-400 flex-shrink-0" />
    )}
    <span
      className={`ml-3 font-medium ${!checked ? "text-gray-400" : ""}`}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  </li>
);
