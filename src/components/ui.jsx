import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React from "react";
import { galleryData } from "../gallery_data";
import { useNavigate } from "react-router-dom";

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
