import React from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Download,
  BrainCircuit,
  Cpu,
  Paintbrush,
  GraduationCap,
} from "lucide-react";
import { Button } from "./button";
import { DecoderText } from "./decoder_text";

const SkillCategory = ({ icon, title, skills, delay }) => (
  <motion.div
    className="border border-gray-800 p-6 rounded-lg bg-gray-900/30"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="flex items-center gap-4 mb-4">
      {React.cloneElement(icon, { className: "text-amber-400" })}
      <h4 className="font-display text-xl text-white font-bold">{title}</h4>
    </div>
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill}
          className="bg-gray-800 text-gray-300 px-3 py-1 text-sm rounded-full"
        >
          {skill}
        </span>
      ))}
    </div>
  </motion.div>
);

const EducationEntry = ({ degree, university, year, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="flex justify-between items-start">
      <div>
        <h4 className="font-display text-xl text-white font-bold">{degree}</h4>
        <p className="font-serif text-gray-400">{university}</p>
      </div>
      <p className="font-mono text-gray-500 text-sm">{year}</p>
    </div>
  </motion.div>
);

export const AboutPage = ({ animationsReady }) => (
  <main className="flex-1 flex flex-col items-center justify-center p-4 m-4 md:m-8 md:p-8">
    <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-16 items-center">
      {/* Left Column */}
      <div className="md:col-span-3 text-left">
        <motion.h2
          className="layered-title font-display text-4xl md:text-6xl text-white font-bold py-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          data-text="About Me."
        >
          <DecoderText text="About Me." start={animationsReady} delay={0.2} />
        </motion.h2>
        <motion.div
          className="font-serif text-gray-200 mt-4 mb-6 space-y-6 text-lg leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <p>
            My work lives at the intersection of machine learning, systems
            programming, and creative technology. I recently completed my PhD,
            where my research focused on making generative AI models more fair
            and robust.
          </p>
          <p>
            Beyond academic research, I have a deep passion for understanding
            how software works at a fundamental level. This curiosity leads me
            down rabbit holes of building compilers, exploring low-level GPU
            programming, and crafting tools that bridge the gap between
            performance and creativity.
          </p>
          <p>
            <span className="bg-amber-400 text-black p-2 rounded-md">
              Or making up cringe-worthy 'About' pages like this one using AI.
            </span>
          </p>
        </motion.div>
        <motion.div
          className="flex flex-wrap gap-4 mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <Button
            href="mailto:sreerajr000@gmail.com"
            secondary
            iconEnd={<Mail />}
          >
            Contact me
          </Button>
        </motion.div>
      </div>

      {/* Right Column */}
      <div className="md:col-span-2 w-full space-y-12">
        {/* --- EDUCATION SECTION --- */}
        <div className="w-full">
          <motion.h3
            className="font-display text-3xl text-white font-bold mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <DecoderText text="Education" start={animationsReady} delay={0.4} />
          </motion.h3>
          <div className="space-y-6 border-l-2 border-gray-800 pl-6">
            <EducationEntry
              degree="Ph.D. in EECS"
              university="Wichita State University, KS, USA"
              year="2025"
              delay={0.6}
            />
            <EducationEntry
              degree="B.Tech + M.Tech in Computer Eng."
              university="IIIT D&M, Kancheepuram, India"
              year="2019"
              delay={0.7}
            />
          </div>
        </div>

        {/* --- MY TOOLKIT SECTION --- */}
        <div className="w-full">
          <motion.h3
            className="font-display text-3xl text-white font-bold mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <DecoderText
              text="My Toolkit"
              start={animationsReady}
              delay={0.8}
            />
          </motion.h3>
          <div className="space-y-6">
            <SkillCategory
              icon={<BrainCircuit size={24} />}
              title="AI & Machine Learning"
              skills={[
                "Python",
                "PyTorch",
                "JAX",
                "Transformers",
                "AI Fairness",
              ]}
              delay={1.0}
            />
            <SkillCategory
              icon={<Cpu size={24} />}
              title="Systems & Compilers"
              skills={["C++", "CUDA", "Zig", "Rust", "MLIR", "LLVM"]}
              delay={1.1}
            />
            <SkillCategory
              icon={<Paintbrush size={24} />}
              title="Creative Technology"
              skills={["Blender API", "Python Scripting", "Graphics"]}
              delay={1.2}
            />
          </div>
        </div>
      </div>
    </div>
  </main>
);
