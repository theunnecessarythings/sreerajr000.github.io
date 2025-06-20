import React from "react";
import { motion } from "framer-motion";
import { DecoderText } from "./decoder_text";
import { Github, Linkedin, Youtube, ArrowRight } from "lucide-react";
import { Button } from "./button";

const animations = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

export const HomePage = ({ animationsReady }) => (
  <main className="flex-1 flex flex-col items-center justify-center text-center m-4 p-4">
    <motion.div
      initial={animations.initial}
      animate={animations.animate}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="flex flex-col items-center"
    >
      <h1
        className="layered-title shadow-md font-display text-5xl md:text-8xl font-bold text-white mb-4"
        data-text="Sreeraj Ramachandran"
        style={{ textShadow: "0 0 10px rgba(255,255,255,0.1)" }}
      >
        <motion.span
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Sreeraj Ramachandran
        </motion.span>
      </h1>
      <motion.p
        initial={animations.initial}
        animate={animations.animate}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="font-serif text-lg md:text-xl text-gray-200 max-w-2xl mt-8 leading-relaxed"
      >
        I build wonderfully{" "}
        <span className="text-gray-800 p-1 bg-white shadow-lg font-medium tracking-wide">
          <strong>unnecessary things.</strong>
        </span>
      </motion.p>
    </motion.div>

    <motion.div
      initial={animations.initial}
      animate={animations.animate}
      transition={{ duration: 0.6, delay: 1.2 }}
      className="flex gap-6 mt-8"
    >
      <a
        href="https://github.com/theunnecessarythings"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-amber-400 transition-colors"
      >
        <Github size={24} />
      </a>
      <a
        href="https://www.linkedin.com/in/sreeraj-r-1b9b4542/"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-amber-400 transition-colors"
      >
        <Linkedin size={24} />
      </a>
      <a
        href="https://www.youtube.com/@TheUnnecessaryThings"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-amber-400 transition-colors"
      >
        <Youtube size={24} />
      </a>
    </motion.div>

    <motion.div
      initial={animations.initial}
      animate={animations.animate}
      transition={{ duration: 0.6, delay: 1.4 }}
      className="flex flex-wrap gap-4 mt-12"
    >
      <Button to="/projects" iconEnd={<ArrowRight />}>
        View my work
      </Button>
      <Button to="/about" secondary>
        More about me
      </Button>
    </motion.div>
  </main>
);
