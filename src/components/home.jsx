import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Github, Linkedin, Mail, Youtube } from "lucide-react";
import { Button } from "./button";
import {
  blogPosts,
  projectsData,
  publicationsData,
  formatDate,
} from "../content_data";

const MotionDiv = motion.div;

const fade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const signalProjects = ["llm-ptx", "sr-lang", "zyg"];

const ReadoutCard = ({
  to,
  index,
  type,
  title,
  summary,
  image,
  meta,
  delay = 0,
}) => (
  <MotionDiv
    {...fade}
    transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
    className="card card-interactive"
  >
    <Link to={to} className="grid h-full">
      <div className="tech-card-header">
        <span className="card-index">{index}</span>
        <span className="machine-label">{type}</span>
      </div>
      {image && (
        <div className="media-frame media-frame-cover aspect-[16/9] border-x-0 border-t-0">
          <img
            src={image}
            alt=""
            className="h-full"
          />
        </div>
      )}
      <div className="tech-card-body flex h-full flex-col gap-3">
        <h3 className="text-xl font-bold leading-tight text-[var(--text)]">
          {title}
        </h3>
        {summary && <p className="muted text-sm leading-6">{summary}</p>}
        {meta && <p className="machine-label mt-auto">{meta}</p>}
      </div>
    </Link>
  </MotionDiv>
);

const InstrumentPanel = ({ featuredProjects, recentPosts }) => {
  const latestPost = recentPosts[0];
  const primaryProject = featuredProjects[0];

  return (
    <MotionDiv
      {...fade}
      transition={{ duration: 0.58, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="instrument-panel p-5"
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="machine-label">Overview</p>
          <p className="signal mt-1">Selected work</p>
        </div>
        <span className="status-pill-warning status-pill">current</span>
      </div>

      {primaryProject?.imageUrl && (
        <Link
          to={`/projects/${primaryProject.slug}`}
          className="media-frame media-frame-cover relative mb-5 block aspect-[16/10]"
          aria-label={`Open ${primaryProject.title}`}
        >
          <div className="media-frame-header">
            <span className="machine-label">Featured project</span>
            <span className="warning-signal">selected</span>
          </div>
          <img
            src={primaryProject.imageUrl}
            alt=""
            className="h-full"
          />
          <div className="absolute inset-x-0 bottom-0 z-[4] border-t border-[var(--border-soft)] bg-black/60 p-3 backdrop-blur">
            <p className="machine-label">Featured project</p>
            <p className="mt-1 font-mono text-sm font-bold text-[var(--text)]">
              {primaryProject.title}
            </p>
          </div>
        </Link>
      )}

      <div>
        <Link to="/projects" className="meter-row">
          <span className="machine-label">featured projects</span>
          <span className="meter-value">{featuredProjects.length}</span>
        </Link>
        <Link to={latestPost ? `/blog/${latestPost.slug}` : "/blog"} className="meter-row">
          <span className="machine-label">latest note</span>
          <span className="meter-value">{latestPost?.slug || "idle"}</span>
        </Link>
        <Link to="/publications" className="meter-row">
          <span className="machine-label">publications</span>
          <span className="meter-value">{publicationsData.length}</span>
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        {signalProjects.map((slug) => (
          <Link
            key={slug}
            to={`/projects/${slug}`}
            className="readout p-3 text-center"
          >
            <span className="machine-label">{slug}</span>
          </Link>
        ))}
      </div>
      <div className="module-log">
        <div className="module-log-line">
          <span className="warning-signal">now</span>
          <span>projects, writing, and publications</span>
        </div>
        <div className="module-log-line">
          <span className="signal">focus</span>
          <span>research, systems, and creative tools</span>
        </div>
      </div>
    </MotionDiv>
  );
};

export const HomePage = () => {
  const featuredProjects = projectsData
    .filter((project) => project.featured)
    .slice(0, 3);
  const recentPosts = blogPosts.filter((post) => !post.comingSoon).slice(0, 2);
  const topPublications = publicationsData.slice(0, 2);

  return (
    <main>
      <section className="page-shell pb-10 pt-16 md:pt-24">
        <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <MotionDiv {...fade} transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}>
            <p className="eyebrow mb-5">AI research · systems · creative tools</p>
            <h1 className="display-title max-w-4xl">
              AI research, systems, and tools.
            </h1>
            <p className="muted mt-7 max-w-2xl text-lg leading-8">
              I am Sreeraj Ramachandran. I build wonderfully{" "}
              <span className="text-[var(--text)]">unnecessary things</span>{" "}
              across fair AI, PTX/CUDA, compilers, and creative software.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to="/projects" iconEnd={<ArrowRight />}>
                View work
              </Button>
              <Button href="mailto:sreerajr000@gmail.com" secondary iconEnd={<Mail />}>
                Contact
              </Button>
            </div>
            <div className="mt-6 flex gap-2">
              {[
                ["GitHub", "https://github.com/theunnecessarythings", Github],
                [
                  "LinkedIn",
                  "https://www.linkedin.com/in/sreeraj-r-1b9b4542/",
                  Linkedin,
                ],
                ["YouTube", "https://www.youtube.com/@TheUnnecessaryThings", Youtube],
              ].map(([label, href, icon]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-[var(--radius)] border border-[var(--border-soft)] p-2 text-[var(--text-muted)] transition-colors hover:border-[rgba(var(--accent-rgb),0.45)] hover:text-[var(--accent)]"
                  aria-label={label}
                >
                  {React.createElement(icon, { size: 18 })}
                </a>
              ))}
            </div>
          </MotionDiv>
          <InstrumentPanel
            featuredProjects={featuredProjects}
            recentPosts={recentPosts}
          />
        </div>
      </section>

      <section className="page-shell pt-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Selected work</p>
            <h2 className="section-title">Systems, writing, and research</h2>
          </div>
          <Button to="/projects" secondary iconEnd={<ArrowRight />}>
            All projects
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredProjects.map((project, index) => (
            <ReadoutCard
              key={project.slug}
              to={`/projects/${project.slug}`}
              index={`P${String(index + 1).padStart(2, "0")}`}
              type="Project"
              title={project.title}
              summary={project.summary}
              image={project.imageUrl}
              meta={(project.tags || []).join(" / ")}
              delay={0.05 * index}
            />
          ))}
        </div>
      </section>

      <section className="page-shell grid gap-4 pt-4 lg:grid-cols-2">
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Writing</p>
              <h2 className="section-title">Recent notes</h2>
            </div>
            <Button to="/blog" secondary iconEnd={<ArrowRight />}>
              Blog
            </Button>
          </div>
          <div className="grid gap-4">
            {recentPosts.map((post, index) => (
              <ReadoutCard
                key={post.slug}
                to={`/blog/${post.slug}`}
                index={`B${String(index + 1).padStart(2, "0")}`}
                type={formatDate(post.date)}
                title={post.title}
                summary={post.summary}
                meta={post.readTime}
                delay={0.05 * index}
              />
            ))}
          </div>
        </div>
        <div>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Research</p>
              <h2 className="section-title">Published work</h2>
            </div>
            <Button to="/publications" secondary iconEnd={<ArrowRight />}>
              Publications
            </Button>
          </div>
          <div className="grid gap-4">
            {topPublications.map((publication, index) => (
              <ReadoutCard
                key={publication.slug}
                to={`/publications/${publication.slug}`}
                index={`R${String(index + 1).padStart(2, "0")}`}
                type={publication.venue}
                title={publication.title}
                summary={publication.authors}
                meta={formatDate(publication.date)}
                delay={0.05 * index}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
