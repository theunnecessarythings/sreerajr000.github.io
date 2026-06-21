import React from "react";
import { motion } from "framer-motion";
import { galleryData } from "../gallery_data";

const MotionButton = motion.button;
const MotionDiv = motion.div;

const fade = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

export const GalleryPage = ({ onSelectImage }) => (
  <main className="page-shell">
    <MotionDiv
      {...fade}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="gallery-hero"
    >
      <div>
        <p className="eyebrow mb-4">Gallery</p>
        <h1 className="page-title">Visual archive</h1>
        <p className="muted mt-5 max-w-2xl leading-7">
          A small collection of renders, photos, and visual experiments.
        </p>
      </div>
      <div className="gallery-hero-count">
        <strong>{galleryData.length}</strong>
        <span>images</span>
      </div>
    </MotionDiv>

    <div className="gallery-grid">
      {galleryData.map((item, index) => (
        <MotionButton
          key={item.id}
          {...fade}
          transition={{ duration: 0.5, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => onSelectImage(index)}
          className="gallery-tile"
          aria-label={`Open ${item.alt}`}
        >
          <img src={item.src} alt={item.alt} />
        </MotionButton>
      ))}
    </div>
  </main>
);
