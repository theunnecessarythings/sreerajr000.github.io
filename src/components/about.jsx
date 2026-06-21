import React from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  Cpu,
  Github,
  Linkedin,
  Mail,
  Paintbrush,
  Youtube,
} from "lucide-react";
import { Button } from "./button";

const MotionArticle = motion.article;
const MotionDiv = motion.div;
const MotionSection = motion.section;

const fade = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

const operatingModes = [
  {
    code: "AI",
    title: "Fair and robust AI",
    text: "Researching generative and self-supervised methods for models that behave better across demographic shifts.",
  },
  {
    code: "SYSTEMS",
    title: "Systems and compilers",
    text: "Digging below framework abstractions into CUDA, PTX, Zig, MLIR, LLVM, and language tooling.",
  },
  {
    code: "TOOLS",
    title: "Creative tools",
    text: "Building Blender addons, visual experiments, and small tools that turn curiosity into something inspectable.",
  },
];

const currentRole = {
  title: "Postdoctoral Associate",
  institution: "Yale University",
};

const education = [
  {
    degree: "Ph.D. in EECS",
    place: "Wichita State University, KS, USA",
    year: "2025",
  },
  {
    degree: "B.Tech + M.Tech in Computer Eng.",
    place: "IIIT D&M, Kancheepuram, India",
    year: "2019",
  },
];

const toolkit = [
  {
    icon: <BrainCircuit size={22} />,
    title: "AI & Machine Learning",
    skills: ["Python", "PyTorch", "JAX", "Transformers", "AI Fairness"],
  },
  {
    icon: <Cpu size={22} />,
    title: "Systems & Compilers",
    skills: ["C++", "CUDA", "Zig", "Rust", "MLIR", "LLVM"],
  },
  {
    icon: <Paintbrush size={22} />,
    title: "Creative Technology",
    skills: ["Blender API", "Python Scripting", "Graphics"],
  },
];

const focusItems = [
  `${currentRole.title}, ${currentRole.institution}`,
  "Fair / robust AI",
  "PTX + CUDA kernels",
  "Compiler and language tooling",
  "Creative software for Blender",
];

const socialLinks = [
  ["GitHub", "https://github.com/theunnecessarythings", Github],
  ["LinkedIn", "https://www.linkedin.com/in/sreeraj-r-1b9b4542/", Linkedin],
  ["YouTube", "https://www.youtube.com/@TheUnnecessaryThings", Youtube],
];

const OperatingModeCard = ({ mode, index }) => (
  <MotionArticle
    {...fade}
    transition={{ duration: 0.5, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
    className="card"
  >
    <div className="tech-card-header">
      <span className="card-index">{mode.code}</span>
      <span className="status-pill">focus</span>
    </div>
    <div className="tech-card-body">
      <h2 className="text-xl font-bold leading-tight text-[var(--text)]">
        {mode.title}
      </h2>
      <p className="muted mt-3 text-sm leading-6">{mode.text}</p>
    </div>
  </MotionArticle>
);

const SkillCategory = ({ group, index }) => (
  <MotionDiv
    {...fade}
    transition={{ duration: 0.5, delay: 0.12 + index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    className="card"
  >
    <div className="tech-card-header">
      <span className="machine-label">Toolkit</span>
      <span className="card-index">T{String(index + 1).padStart(2, "0")}</span>
    </div>
    <div className="tech-card-body">
      <div className="mb-4 flex items-center gap-3">
        {React.cloneElement(group.icon, { className: "text-[var(--accent)]" })}
        <h3 className="font-bold text-[var(--text)]">{group.title}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {group.skills.map((skill) => (
          <span key={skill} className="chip">
            {skill}
          </span>
        ))}
      </div>
    </div>
  </MotionDiv>
);

const EducationPanel = () => (
  <MotionSection {...fade} transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}>
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <p className="eyebrow mb-2">Education</p>
        <h2 className="section-title">Formal training</h2>
      </div>
      <span className="status-pill">education</span>
    </div>
    <div className="instrument-panel space-y-6 p-5">
      {education.map((item) => (
        <div key={item.degree} className="meta-rail">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-[var(--text)]">{item.degree}</h3>
              <p className="muted mt-1 text-sm">{item.place}</p>
            </div>
            <p className="meter-value">{item.year}</p>
          </div>
        </div>
      ))}
    </div>
  </MotionSection>
);

const ContactReadout = () => (
  <MotionAside
    {...fade}
    transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
    className="instrument-panel p-5"
  >
    <div className="mb-5 flex items-center justify-between gap-4">
      <div>
        <p className="machine-label">Contact</p>
        <p className="signal mt-1">Email and links</p>
      </div>
      <span className="status-pill-warning status-pill">available</span>
    </div>
    <div className="space-y-3">
      <div className="readout p-3">
        <p className="machine-label">Current role</p>
        <p className="mt-1 font-mono text-sm font-bold text-[var(--text)]">
          {currentRole.title}
        </p>
        <p className="muted mt-1 text-sm">{currentRole.institution}</p>
      </div>
      <a
        href="mailto:sreerajr000@gmail.com"
        className="readout block p-3 font-mono text-sm text-[var(--text)]"
      >
        sreerajr000@gmail.com
      </a>
      <div className="grid grid-cols-3 gap-2">
        {socialLinks.map(([label, href, icon]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="readout grid place-items-center p-3 text-[var(--text-muted)] transition-colors hover:text-[var(--accent)]"
            aria-label={label}
          >
            {React.createElement(icon, { size: 18 })}
          </a>
        ))}
      </div>
    </div>
    <div className="module-log">
      <div className="module-log-line">
        <span className="signal">work</span>
        <span>research, systems, and creative software</span>
      </div>
      <div className="module-log-line">
        <span className="warning-signal">contact</span>
        <span>best reached by email</span>
      </div>
    </div>
  </MotionAside>
);

const MotionAside = motion.aside;

export const AboutPage = () => (
  <main className="page-shell">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <MotionSection {...fade} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="card">
        <div className="tech-card-header">
          <span className="card-index">SR</span>
          <span className="machine-label">About</span>
        </div>
        <div className="tech-card-body">
          <p className="eyebrow mb-4">About</p>
          <h1 className="page-title">About me</h1>
          <div className="prose-content mt-8 max-w-3xl">
            <p>
              My work sits at the intersection of machine learning, systems
              programming, and creative technology. I am currently a
              Postdoctoral Associate at Yale University. I recently completed my
              PhD, where I worked on making AI models fairer and more robust
              with generative AI techniques.
            </p>
            <p>
              Outside research, I like taking software apart until the
              abstraction leaks. That usually means compilers, GPU programming,
              low-level ML systems, or tools that connect performance work with
              creative workflows.
            </p>
            <p>
              Occasionally this also means writing an About page that admits it
              was probably drafted with AI. At least the system is self-aware.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="mailto:sreerajr000@gmail.com" secondary iconEnd={<Mail />}>
              Contact me
            </Button>
          </div>
        </div>
      </MotionSection>

      <ContactReadout />
    </div>

    <section className="mt-10">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Work areas</p>
          <h2 className="section-title">Where I spend most of my time</h2>
        </div>
        <span className="status-pill">3 areas</span>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {operatingModes.map((mode, index) => (
          <OperatingModeCard key={mode.code} mode={mode} index={index} />
        ))}
      </div>
    </section>

    <section className="mt-10 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
      <div className="space-y-8">
        <MotionSection {...fade} transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}>
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Current focus</p>
              <h2 className="section-title">Current focus</h2>
            </div>
            <span className="status-pill-warning status-pill">active</span>
          </div>
          <div className="instrument-panel p-5">
            {focusItems.map((item, index) => (
              <div key={item} className="meter-row">
                <span className="machine-label">
                  F{String(index + 1).padStart(2, "0")}
                </span>
                <span className="meter-value text-right">{item}</span>
              </div>
            ))}
          </div>
        </MotionSection>
        <EducationPanel />
      </div>

      <section>
        <div className="mb-3 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Toolkit</p>
            <h2 className="section-title">Working set</h2>
          </div>
          <span className="status-pill">stack</span>
        </div>
        <div className="grid gap-4">
          {toolkit.map((group, index) => (
            <SkillCategory key={group.title} group={group} index={index} />
          ))}
        </div>
      </section>
    </section>
  </main>
);
