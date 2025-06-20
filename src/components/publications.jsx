import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./button.jsx";
import { ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { DecoderText } from "./decoder_text.jsx";

const posts = import.meta.glob("/src/content/publications/*.mdx", {
  eager: true,
});

const publicationsData = Object.keys(posts)
  .map((file) => {
    const slug = file.split("/").pop().replace(".mdx", "");
    const post = posts[file];
    return {
      slug,
      ...post.frontmatter,
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

export const PublicationsPage = ({ animationsReady }) => {
  const navigate = useNavigate();
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-12 m-4 sm:m-6 md:m-12">
      <div className="max-w-5xl mx-auto">
        <motion.h2
          className="layered-title font-display text-4xl md:text-5xl font-bold text-white mb-8 py-4"
          data-text="Publications"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <DecoderText text="Publications" start={animationsReady} />
        </motion.h2>
        <div className="space-y-8">
          {publicationsData.map((pub, index) => (
            <React.Fragment key={pub.slug}>
              <motion.div
                className="list-item-hover-effect group -m-4 p-4 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                onClick={() => {
                  navigate(`/publications/${pub.slug}`);
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-start">
                  {pub.image && (
                    <div className="sm:col-span-1">
                      <div className="aspect-video rounded-lg overflow-hidden border border-gray-800">
                        <img
                          src={pub.image}
                          alt={pub.title}
                          className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={pub.image ? "sm:col-span-3" : "sm:col-span-4"}
                  >
                    <h3 className="font-display text-2xl text-white font-bold">
                      {pub.title}
                    </h3>
                    <p className="font-body text-gray-400 mt-2">
                      {pub.authors}
                    </p>
                    <p className="font-body text-amber-400 mt-2">{pub.venue}</p>
                  </div>
                </div>
              </motion.div>
              {index < publicationsData.length - 1 && (
                <hr className="border-gray-800" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </main>
  );
};

export const PublicationDetailPage = ({ animationsReady }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [citationCopied, setCitationCopied] = useState(false);
  const publication = publicationsData.find((p) => p.slug === slug);

  if (!publication) return null; // Or a 404 component

  const handleCopyCitation = () => {
    const citationText = publication.citation;
    if (!citationText) return;
    const textArea = document.createElement("textarea");
    textArea.value = citationText;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2000);
  };

  return (
    <main className="flex-1 p-4 sm:p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/publications")}
            secondary
            icon={<ArrowLeft />}
          >
            Back to publications
          </Button>

          {publication.image && (
            <motion.div
              className="my-8 aspect-[16/9] rounded-lg overflow-hidden border border-gray-800 group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <img
                src={publication.image}
                alt={publication.title}
                className="w-full h-full object-cover transition-all duration-300 ease-in-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
            </motion.div>
          )}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-3xl md:text-4xl font-bold text-white my-8"
          >
            {publication.title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-gray-400 mb-4"
          >
            <p>{publication.authors}</p>
            <p className="text-amber-400 mt-2">
              {publication.venue}, {publication.publisher}
            </p>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-3xl text-white font-bold mt-12 mb-4"
          >
            Abstract
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="publication-content font-sans text-gray-300 text-lg leading-relaxed whitespace-pre-wrap"
          >
            {publication.abstract}
          </motion.div>

          {publication.citation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h2 className="font-display text-3xl text-white font-bold mt-12 mb-4">
                Citation
              </h2>
              <div className="relative bg-gray-900/50 border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-400">
                <pre className="whitespace-pre-wrap overflow-x-auto">
                  <code>{publication.citation}</code>
                </pre>
                <Button
                  onClick={handleCopyCitation}
                  className="absolute top-2 right-2 p-2"
                  secondary
                >
                  <Copy size={16} />
                  <span className="sr-only">Copy Citation</span>
                </Button>
              </div>
              <p
                className={`text-xs mt-2 text-green-400 transition-opacity duration-300 ${citationCopied ? "opacity-100" : "opacity-0"}`}
              >
                Citation copied to clipboard!
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4 mt-12"
          >
            {publication.link && (
              <Button href={publication.link} iconEnd={<ExternalLink />}>
                View Publication
              </Button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};
