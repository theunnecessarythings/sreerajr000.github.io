"use client";

import React, { useEffect, useState } from "react";
import { Routes, Route, Link, useLocation, Outlet } from "react-router-dom";
import {
  Home,
  User,
  Briefcase,
  FileText,
  BookOpen,
  Github,
  Linkedin,
  Instagram,
  Sun,
  Moon,
  ArrowRight,
  ArrowLeft,
  Server,
  Feather,
  ExternalLink,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { FluidBackground } from "./components/fluid_bg.jsx";
import { AnimatePresence } from "framer-motion";
import { Button } from "./components/button";
import { DecoderText } from "./components/decoder_text";
import {
  CursorFollowerProvider,
  CursorFollower,
} from "./components/cursor_follower";
import { ReactIcon, NodeIcon, ThreeJSIcon } from "./components/icons";
import { CustomLogo, ToolkitItem, FullscreenImage } from "./components/ui";
import { HomePage } from "./components/home";
import { AboutPage } from "./components/about";
import { BlogPage, BlogDetailPage } from "./components/blog";
import {
  PublicationsPage,
  PublicationDetailPage,
} from "./components/publications";
import { ProjectsPage, ProjectDetailPage } from "./components/projects";
import { GalleryPage } from "./components/gallery";

const navItems = [
  { to: "/", label: "home", icon: <Home size={24} /> },
  { to: "/about", label: "about", icon: <User size={24} /> },
  { to: "/blog", label: "blog", icon: <FileText size={24} /> },
  { to: "/publications", label: "publications", icon: <BookOpen size={24} /> },
  { to: "/projects", label: "projects", icon: <Briefcase size={24} /> },
  { to: "/gallery", label: "gallery", icon: <ImageIcon size={24} /> },
];

const MainLayout = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const isCurrentPage = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <aside className="hidden md:flex flex-col items-center justify-between w-20 py-8 border-r border-gray-500/30">
        <Link to="/">
          <CustomLogo />
        </Link>
        <nav className="flex flex-col items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`transition-colors ${
                isCurrentPage(item.to)
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
        <button
          onClick={toggleTheme}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
        </button>
      </aside>
      <div className="flex-1 flex overflow-y-auto">
        <Outlet />
      </div>
      <div className="hidden md:block absolute bottom-8 right-8 text-xs text-gray-500">
        © 2025 Sreeraj Ramachandran. All rights reserved.
      </div>
      <header className="md:hidden absolute top-0 left-0 right-0 flex justify-between items-center p-4">
        <Link to="/">
          <CustomLogo />
        </Link>
        <button
          onClick={toggleTheme}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {theme === "dark" ? <Sun size={24} /> : <Moon size={24} />}{" "}
        </button>
      </header>
      <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm border-t border-gray-500/30">
        <nav className="flex justify-around items-center p-4">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={`transition-colors ${
                isCurrentPage(item.to)
                  ? "text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {item.icon}
            </Link>
          ))}
        </nav>
      </footer>
    </>
  );
};

// --- Main App Component ---
export default function App() {
  const [theme, setTheme] = useState("dark");
  const [animationsReady, setAnimationsReady] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    // Add Google Font links to the document head
    const fontFamilies = [
      "DM+Serif+Display:wght@400",
      "Roboto:wght@300;400;700",
    ];
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${fontFamilies.join("&family=")}&display=swap`;
    document.head.appendChild(link);

    // Set up a style element for font families and button styles
    const style = document.createElement("style");
    style.innerHTML = `
        :root {
            --primary: #FBBF24; /* yellow-400 */
            --cyan: #22d3ee;
            --background: #111827; /* gray-900 */
            --textBody: #D1D5DB; /* gray-300 */
            --spaceS: 8px;
            --spaceM: 16px;
            --spaceL: 24px;
            --durationS: 0.3s;
            --durationM: 0.5s;
            --bezierFastoutSlowin: cubic-bezier(0.4, 0, 0.2, 1);
        }
        .font-display { font-family: 'DM Serif Display', serif; }
        .font-body { font-family: 'Roboto', sans-serif; }
        .button {
            height: 44px;
            padding: 0 var(--spaceL);
            cursor: pointer;
            transition: background 0.3s, color 0.3s, opacity 0.3s;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--background);
            position: relative;
            isolation: isolate;
        }
        .button::after {
            content: '';
            transition: background 0.3s;
            background: var(--primary);
            position: absolute;
            inset: 0;
            z-index: -1;
            clip-path: polygon(0 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%);
        }
        .button:hover { transform: scale(1.05); }
        .button-secondary {
            --buttonTextColor: var(--cyan);
            background: none;
            padding: 0;
            height: 32px;
            color: var(--buttonTextColor);
        }
        .button-secondary::after { content: none; }
        .button-secondary:hover { transform: none; }
        .button-text { font-size: 16px; font-weight: 700; line-height: 1; }
        .button-secondary .button-text { font-size: 1rem; font-weight: 700; }
        .button-icon-start { margin-right: 8px; height: 16px; width: 16px; }
        .button-icon-end { margin-left: var(--spaceS); height: 16px; width: 16px; transition: transform 0.3s var(--bezierFastoutSlowin); }
        .button:hover .button-icon-end[data-shift='true'] { transform: translateX(4px); }
        .button-secondary .button-icon-end { margin-left: 0; margin-right: 4px; }
        .button-secondary:hover .button-icon-end[data-shift='true'] { transform: translateX(4px); }
        .layered-title { position: relative; color: white; }
        .layered-title::before, .layered-title::after {
            content: attr(data-text);
            position: absolute; top: 0; left: 0;
            z-index: -1; color: white; will-change: transform;
        }
        .layered-title::before { transform: translate(60px, -40px) scale(1.2); opacity: 0.2; }
        .layered-title::after { transform: translate(-50px, 40px) scale(1.25); opacity: 0.1; }
        .list-item-hover-effect {
            position: relative;
            z-index: 1;
            cursor: pointer;
        }
        .list-item-hover-effect::after {
             content: ''; position: absolute; inset: -1rem;
            background-color: rgba(31, 41, 55, 0.5);
            transform: scaleX(0);
            transition: transform 0.4s var(--bezierFastoutSlowin);
            z-index: -1;
        }
        .list-item-hover-effect:hover::after { transform: scaleX(1); transform-origin: left; }
        .list-item-hover-effect:not(:hover)::after { transform-origin: right; }
        .blog-content p, .publication-content p, .project-content p { margin-bottom: 1.5rem; }
        .blog-content ol, .project-content ol { list-style-type: decimal; margin-left: 2rem; margin-bottom: 1.5rem; }
        .blog-content li, .project-content li { margin-bottom: 0.5rem; }
        .project-content h3 { font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem; font-family: 'DM Serif Display', serif; }
    `;
    document.head.appendChild(style);

    const timeout = setTimeout(() => setAnimationsReady(true), 500);

    return () => {
      if (link.parentNode) document.head.removeChild(link);
      if (style.parentNode) document.head.removeChild(style);
      clearTimeout(timeout);
    };
  }, []);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  const location = useLocation();
  useEffect(() => {
    setAnimationsReady(false);
    const timeout = setTimeout(() => {
      setAnimationsReady(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [location.pathname]);

  return (
    <CursorFollowerProvider>
      <CursorFollower />
      <AnimatePresence>
        {fullscreenImage && (
          <FullscreenImage
            src={fullscreenImage}
            onClose={() => setFullscreenImage(null)}
          />
        )}
      </AnimatePresence>
      <div
        className={`font-body min-h-screen transition-colors duration-500 ${
          theme === "dark"
            ? "bg-gray-900 text-gray-100"
            : "bg-white text-gray-800"
        }`}
      >
        <div className="fixed inset-0 w-full h-full z-0">
          <FluidBackground />
          <div
            className={`absolute inset-0 w-full h-full z-0 ${
              theme === "dark" ? "bg-black/80" : "bg-white/60"
            }`}
          ></div>
        </div>
        <div className="relative z-10 flex min-h-screen">
          <Routes>
            <Route
              element={<MainLayout theme={theme} toggleTheme={toggleTheme} />}
            >
              <Route
                index
                element={<HomePage animationsReady={animationsReady} />}
              />
              <Route
                path="about"
                element={<AboutPage animationsReady={animationsReady} />}
              />
              <Route
                path="blog"
                element={<BlogPage animationsReady={animationsReady} />}
              />
              <Route
                path="blog/:slug"
                element={<BlogDetailPage animationsReady={animationsReady} />}
              />
              <Route
                path="publications"
                element={<PublicationsPage animationsReady={animationsReady} />}
              />
              <Route
                path="publications/:slug"
                element={
                  <PublicationDetailPage animationsReady={animationsReady} />
                }
              />
              <Route
                path="projects"
                element={<ProjectsPage animationsReady={animationsReady} />}
              />
              <Route
                path="projects/:slug"
                element={
                  <ProjectDetailPage animationsReady={animationsReady} />
                }
              />
              <Route
                path="gallery"
                element={
                  <GalleryPage
                    animationsReady={animationsReady}
                    onSelectImage={setFullscreenImage}
                  />
                }
              />
            </Route>
          </Routes>
        </div>
      </div>
    </CursorFollowerProvider>
  );
}
