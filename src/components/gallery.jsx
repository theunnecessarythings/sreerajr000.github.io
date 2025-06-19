import React from "react";
import { motion } from "framer-motion";
import { DecoderText } from "./decoder_text";
import { galleryData } from "../gallery_data";

export const GalleryPage = ({ animationsReady, onSelectImage }) => (
  <main className="flex-1 m-4 p-4 sm:m-6 sm:p-6 md:m-12 md:p-12">
    <div className="max-w-7xl mx-auto">
      <motion.h2
        className="layered-title font-display text-4xl md:text-5xl font-bold text-white my-8 py-4"
        data-text="Gallery"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <DecoderText text="Gallery" start={animationsReady} delay={300} />
      </motion.h2>
      <div className="columns-1 sm:columns-2 md:columns-3 gap-4">
        {galleryData.map((item, index) => (
          <motion.div
            key={item.id}
            className="mb-4 break-inside-avoid cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 + 0.1 * index }}
            onClick={() => onSelectImage(item.src)}
          >
            <img src={item.src} alt={item.alt} className="w-full h-auto" />
          </motion.div>
        ))}
      </div>
    </div>
  </main>
);
