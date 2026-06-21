import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, ExternalLink } from "lucide-react";
import { Button } from "./button";
import { Comments } from "./comments";
import { formatDate, getAllTags, projectsData } from "../content_data";

const MotionArticle = motion.article;
const MotionDiv = motion.div;
const MotionHeader = motion.header;

const fade = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

const getAdjacentProject = (project, offset) => {
  const index = projectsData.findIndex((item) => item.slug === project.slug);
  if (index === -1) return null;
  return projectsData[index + offset] || null;
};

const ProjectCard = ({ project, index, delay = 0 }) => (
  <MotionArticle
    {...fade}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`project-card ${project.featured ? "project-card-featured" : ""}`}
  >
    <Link to={`/projects/${project.slug}`} className="project-card-link">
      {project.imageUrl && (
        <div className="project-card-media">
          <img src={project.imageUrl} alt={project.title} />
        </div>
      )}
      <div className="project-card-body">
        <div className="project-card-meta">
          <span>{String(index + 1).padStart(2, "0")}</span>
          {project.featured && <span>Featured</span>}
          {project.date && <span>{formatDate(project.date)}</span>}
        </div>
        <h2>{project.title}</h2>
        <p>{project.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {(project.tags || []).map((tag) => (
            <span key={tag} className="chip">
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ArrowRight className="project-card-arrow" aria-hidden="true" />
    </Link>
  </MotionArticle>
);

export const ProjectsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag"));
  const allTags = getAllTags(projectsData);

  useEffect(() => {
    setSelectedTag(searchParams.get("tag"));
  }, [searchParams]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    if (tag) setSearchParams({ tag });
    else setSearchParams({});
  };

  const filteredProjects = selectedTag
    ? projectsData.filter((project) => project.tags?.includes(selectedTag))
    : projectsData;
  const featuredProjects = projectsData.filter((project) => project.featured);

  return (
    <main className="page-shell">
      <MotionDiv
        {...fade}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="project-hero"
      >
        <div>
          <p className="eyebrow mb-4">Projects</p>
          <h1 className="page-title">Tools, systems, and experiments</h1>
          <p className="muted mt-5 max-w-2xl leading-7">
            Systems experiments, ML tooling, creative software, and projects that
            became useful after starting out unnecessary.
          </p>
        </div>
        <div className="project-hero-count">
          <strong>{projectsData.length}</strong>
          <span>projects</span>
        </div>
      </MotionDiv>

      <div className="project-overview">
        <div>
          <span>Featured</span>
          <strong>{featuredProjects.length} active highlights</strong>
        </div>
        <div>
          <span>Focus</span>
          <strong>GPU systems, Zig, Rust, Blender tools</strong>
        </div>
        <div>
          <span>Topics</span>
          <strong>{allTags.length} tags</strong>
        </div>
      </div>

      <div className="project-filter-bar">
        <span className="machine-label">Topics</span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleTagSelect(null)}
            className={`chip ${selectedTag === null ? "chip-active" : ""}`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className={`chip ${selectedTag === tag ? "chip-active" : ""}`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="project-grid">
        {filteredProjects.map((project, index) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={index}
            delay={index * 0.055}
          />
        ))}
      </div>
    </main>
  );
};

export const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const project = projectsData.find((item) => item.slug === slug);

  if (!project) {
    return (
      <main className="page-shell page-shell-narrow text-center">
        <h1 className="page-title">Project not found</h1>
        <div className="mt-8">
          <Button onClick={() => navigate("/projects")} secondary icon={<ArrowLeft />}>
            Back to projects
          </Button>
        </div>
      </main>
    );
  }

  const { Content } = project;
  const previousProject = getAdjacentProject(project, 1);
  const nextProject = getAdjacentProject(project, -1);

  return (
    <main className="page-shell project-detail-shell">
      <Button onClick={() => navigate(-1)} secondary icon={<ArrowLeft />}>
        Back
      </Button>
      <MotionHeader
        {...fade}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="project-detail-header"
      >
        <div className="project-detail-meta">
          {project.featured && <span>Featured</span>}
          {project.date && (
            <span>
              <CalendarDays aria-hidden="true" />
              {formatDate(project.date)}
            </span>
          )}
        </div>
        <h1 className="page-title">{project.title}</h1>
        <p className="muted mt-5 leading-7">{project.summary}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {(project.tags || []).map((tag) => (
            <button
              key={tag}
              onClick={() => navigate(`/projects?tag=${tag}`)}
              className="chip"
            >
              {tag}
            </button>
          ))}
        </div>
      </MotionHeader>

      {project.imageUrl && (
        <MotionDiv
          {...fade}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="project-detail-media"
        >
          <img
            src={project.imageUrl}
            alt={project.title}
          />
        </MotionDiv>
      )}

      <MotionArticle
        {...fade}
        transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="project-content prose-content"
      >
        <Content />
      </MotionArticle>

      {project.url && (
        <div className="mt-10">
          <Button href={project.url} iconEnd={<ExternalLink />}>
            View Project
          </Button>
        </div>
      )}

      {(previousProject || nextProject) && (
        <nav className="project-more" aria-label="Project navigation">
          {previousProject && (
            <Link to={`/projects/${previousProject.slug}`}>
              <span>Previous</span>
              <strong>{previousProject.title}</strong>
            </Link>
          )}
          {nextProject && (
            <Link to={`/projects/${nextProject.slug}`}>
              <span>Next</span>
              <strong>{nextProject.title}</strong>
            </Link>
          )}
        </nav>
      )}
      <Comments />
    </main>
  );
};
