import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Feather, Github, Server } from "lucide-react";
import { Button } from "./button";
import { DecoderText } from "./decoder_text";
import { ToolkitItem } from "./ui";
import { ReactIcon, NodeIcon, ThreeJSIcon } from "./icons";

export const AboutPage = ({ animationsReady }) => (
  <main className="flex-1 flex flex-col items-center justify-center p-4 m-4 md:m-8 md:p-8">
    <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16 items-start">
      <div className="md:col-span-2 text-left">
        <motion.h2
          className="layered-title font-display text-4xl md:text-6xl text-white font-bold py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          data-text="About Me."
        >
          <DecoderText text="About Me." start={animationsReady} delay={0.2} />
        </motion.h2>
        <motion.p
          className="font-body text-gray-300 mt-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          A passionate PhD with a focus on cutting-edge research and
          development. My journey in academia and the tech industry is driven by
          relentless curiosity.
        </motion.p>
        <motion.div
          className="flex gap-4 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <Button secondary href="#" iconEnd={<ArrowRight />}>
            Resume
          </Button>
          <Button secondary href="#">
            Contact me
          </Button>
        </motion.div>
      </div>
      <div className="md:col-span-3 w-full">
        <motion.h3
          className="font-display text-3xl text-white font-bold mb-4 py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <DecoderText text="My Toolkit" start={animationsReady} delay={1} />
        </motion.h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <ToolkitItem icon={<ReactIcon />} name="React/Next.js" delay={1.2} />
          <ToolkitItem icon={<NodeIcon />} name="Node.js" delay={1.3} />
          <ToolkitItem icon={<ThreeJSIcon />} name="Three.js" delay={1.4} />
          <ToolkitItem icon={<Feather />} name="Framer Motion" delay={1.5} />
          <ToolkitItem icon={<Github />} name="Python" delay={1.6} />
          <ToolkitItem icon={<Server />} name="DevOps" delay={1.7} />
        </div>
      </div>
    </div>
  </main>
);
