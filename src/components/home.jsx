import React from "react";
import { DecoderText } from "./decoder_text";
import { Github, Linkedin, Instagram } from "lucide-react";

export const HomePage = ({ animationsReady }) => (
  <main className="flex-1 flex flex-col items-center justify-center text-center m-4 p-4">
    <p className="font-body text-lg md:text-xl font-light text-gray-300 tracking-widest uppercase mb-4">
      I am
    </p>
    <div className="flex flex-col items-center justify-center -space-y-3 md:-space-y-5">
      <div
        className="layered-title font-display text-5xl md:text-7xl font-bold text-white h-20 md:h-28 flex items-center justify-center"
        data-text="Sreeraj Ramachandran"
      >
        <DecoderText text="Sreeraj Ramachandran" start={animationsReady} />
      </div>
    </div>
    <p className="font-body text-lg md:text-xl font-light text-gray-300 tracking-wider h-10 flex items-center justify-center mt-6 overflow-hidden">
      <DecoderText text="PhD" start={animationsReady} delay={1500} />
    </p>
    <div className="flex gap-6 mt-8">
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <Github size={24} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <Linkedin size={24} />
      </a>
      <a href="#" className="text-gray-400 hover:text-white transition-colors">
        <Instagram size={24} />
      </a>
    </div>
  </main>
);
