import React, { useState } from "react";
import { Routes, Route, NavLink, Link, Outlet } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Github, Linkedin, Youtube } from "lucide-react";
import { ScrollToTop, FullscreenImage } from "./components/ui";
import { HomePage } from "./components/home";
import { AboutPage } from "./components/about";
import { BlogPage, BlogDetailPage } from "./components/blog";
import {
  PublicationsPage,
  PublicationDetailPage,
} from "./components/publications";
import { ProjectsPage, ProjectDetailPage } from "./components/projects";
import { GalleryPage } from "./components/gallery";
import { HiddenPage } from "./components/hidden";
import { galleryData } from "./gallery_data.jsx";

const navItems = [
  { to: "/", label: "Home", code: "00", end: true },
  { to: "/about", label: "About", code: "01" },
  { to: "/blog", label: "Blog", code: "02" },
  { to: "/publications", label: "Publications", code: "03" },
  { to: "/projects", label: "Projects", code: "04" },
  { to: "/gallery", label: "Gallery", code: "05" },
];

const socialLinks = [
  { href: "https://github.com/theunnecessarythings", label: "GitHub", icon: Github },
  {
    href: "https://www.linkedin.com/in/sreeraj-r-1b9b4542/",
    label: "LinkedIn",
    icon: Linkedin,
  },
  {
    href: "https://www.youtube.com/@TheUnnecessaryThings",
    label: "YouTube",
    icon: Youtube,
  },
];

const Mark = () => (
  <span className="site-mark">
    SR/00
  </span>
);

const MainLayout = () => (
  <>
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link to="/" className="site-brand" aria-label="Sreeraj Ramachandran home">
          <Mark />
          <span className="site-brand-copy">
            <span className="site-brand-name">
              Sreeraj Ramachandran
            </span>
            <span className="site-brand-role">sreeraj.in</span>
          </span>
        </Link>
        <nav className="site-nav-rail" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `site-link ${isActive ? "site-link-active" : ""}`
              }
            >
              <span className="site-link-code">{item.code}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="site-nav-social" aria-label="Social links">
          {socialLinks.map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              {React.createElement(icon, { size: 16 })}
            </a>
          ))}
        </div>
      </div>
    </header>
    <Outlet />
    <footer className="border-t border-[var(--border-soft)]">
      <div className="mx-auto flex w-[min(1120px,calc(100vw-2rem))] flex-col gap-4 py-8 text-sm text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <p className="mono text-xs">SR/EOF · © 2026 Sreeraj Ramachandran.</p>
        <div className="flex items-center gap-3">
          {socialLinks.map(({ href, label, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-md p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              aria-label={label}
            >
              {React.createElement(icon, { size: 18 })}
            </a>
          ))}
        </div>
      </div>
    </footer>
  </>
);

export default function App() {
  const [fullscreenImage, setFullscreenImage] = useState(null);

  const handleImageNavigation = (direction) => {
    if (fullscreenImage === null) return;
    const newIndex =
      direction === "next"
        ? (fullscreenImage + 1) % galleryData.length
        : (fullscreenImage - 1 + galleryData.length) % galleryData.length;
    setFullscreenImage(newIndex);
  };

  return (
    <div className="app-shell">
      <ScrollToTop />
      <AnimatePresence>
        {fullscreenImage !== null && (
          <FullscreenImage
            src={fullscreenImage}
            onClose={() => setFullscreenImage(null)}
            onNavigate={handleImageNavigation}
          />
        )}
      </AnimatePresence>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="blog" element={<BlogPage />} />
          <Route path="blog/:slug" element={<BlogDetailPage />} />
          <Route path="publications" element={<PublicationsPage />} />
          <Route path="publications/:slug" element={<PublicationDetailPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:slug" element={<ProjectDetailPage />} />
          <Route
            path="gallery"
            element={<GalleryPage onSelectImage={setFullscreenImage} />}
          />
          <Route path="hidden" element={<HiddenPage />} />
        </Route>
      </Routes>
    </div>
  );
}
