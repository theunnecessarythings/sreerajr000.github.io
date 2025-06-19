import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "./button";
import { DecoderText } from "./decoder_text";

const posts = import.meta.glob("/src/content/projects/*.mdx", { eager: true });

const projectsData = Object.keys(posts)
  .map((file) => {
    const slug = file.split("/").pop().replace(".mdx", "");
    return {
      slug,
      ...posts[file].frontmatter,
      Content: posts[file].default,
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const tagColorMap = {
  React: "bg-cyan-500/20 text-cyan-300",
  "D3.js": "bg-orange-500/20 text-orange-300",
  Python: "bg-blue-500/20 text-blue-300",
  "Next.js": "bg-gray-400/20 text-gray-200",
  Solidity: "bg-purple-500/20 text-purple-300",
  IPFS: "bg-teal-500/20 text-teal-300",
  WebSockets: "bg-red-500/20 text-red-300",
  "Monaco Editor": "bg-indigo-500/20 text-indigo-300",
  WebRTC: "bg-green-500/20 text-green-300",
};
const getTagColor = (tag) => tagColorMap[tag] || "bg-gray-700 text-gray-300";

export const ProjectsPage = ({ animationsReady }) => {
  const featuredProject = projectsData.find((p) => p.featured);
  const otherProjects = projectsData.filter((p) => !p.featured);
  const navigate = useNavigate();

  return (
    <main className="flex-1 m-4 p-4 sm:m-6 sm:p-6 md:m-12 md:p-12">
      <div className="max-w-7xl mx-auto">
        <motion.h2
          className="layered-title font-display text-4xl md:text-5xl font-bold text-white mb-8 py-4"
          data-text="Projects"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <DecoderText text="Projects" start={animationsReady} />
        </motion.h2>

        <motion.div
          className="group list-item-hover-effect -m-4 p-4 mb-12 cursor-pointer border-2 border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          onClick={() => navigate(`/projects/${featuredProject.slug}`)}
        >
          <div className="absolute inset-0 z-0 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105"
              style={{ backgroundImage: `url(${featuredProject.imageUrl})` }}
            ></div>
          </div>
          <div className="relative p-8 bg-black/20">
            <p className="font-body text-sm font-bold text-yellow-400 mb-4">
              Featured Project
            </p>
            <h3 className="font-display text-4xl md:text-5xl text-white font-bold">
              {featuredProject.title}
            </h3>
            <p className="font-body text-gray-300 mt-4 max-w-2xl">
              {featuredProject.summary}
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {otherProjects.map((project, index) => (
            <motion.div
              key={project.id}
              className="group list-item-hover-effect -m-4 p-4 cursor-pointer border border-gray-800"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.4 + index * 0.2,
                ease: "easeOut",
              }}
              onClick={() => navigate(`/projects/${project.slug}`)}
            >
              <div className="relative">
                <h3 className="font-display text-2xl text-white font-bold">
                  {project.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {project.tech.map((t) => (
                    <span
                      key={t}
                      className={`text-xs px-2 py-1 ${getTagColor(t)}`}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
};

export const ProjectDetailPage = ({ animationsReady }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const project = projectsData.find((p) => p.slug === slug);

  if (!project) return null; // Or a 404 component
  const { Content } = project;
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => {
              navigate(-1);
            }}
            secondary
            icon={<ArrowLeft />}
          >
            Back to projects
          </Button>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-bold text-white my-8"
          >
            {project.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            {project.tech.map((t) => (
              <span key={t} className={`text-sm px-3 py-1 ${getTagColor(t)}`}>
                {t}
              </span>
            ))}
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="project-content font-body text-lg text-gray-300 leading-relaxed"
          >
            <Content />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-12"
          >
            <Button href="#" iconEnd={<ExternalLink />}>
              View Project
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};
