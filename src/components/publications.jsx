import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "./button.jsx";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { DecoderText } from "./decoder_text.jsx";

const posts = import.meta.glob("/src/content/publications/*.mdx", {
  eager: true,
});

const publicationsData = Object.keys(posts)
  .map((file) => {
    const slug = file.split("/").pop().replace(".mdx", "");
    return {
      slug,
      ...posts[file].frontmatter,
      Content: posts[file].default,
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
        <div className="space-y-4">
          {publicationsData.map((pub, index) => (
            <React.Fragment key={pub.id}>
              <motion.div
                className="list-item-hover-effect -m-4 p-4 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 * (index + 1) }}
                // onClick={() => onSelectPublication(pub)}
                onClick={() => {
                  navigate(`/publications/${pub.slug}`);
                }}
              >
                <h3 className="font-display text-2xl text-white font-bold">
                  {pub.title}
                </h3>
                <p className="font-body text-gray-400 mt-2">{pub.authors}</p>
                <p className="font-body text-cyan-400 mt-2">{pub.journal}</p>
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
  const publication = publicationsData.find((p) => p.slug === slug);
  if (!publication) return null; // Or a 404 component
  const { Content } = publication;
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
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl md:text-5xl font-bold text-white my-8"
          >
            {publication.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-body text-lg text-gray-400 italic mb-4"
          >
            {publication.authors}
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="font-body text-lg text-cyan-400 mb-8"
          >
            {publication.journal}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-display text-3xl text-white font-bold mb-4"
          >
            Abstract
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="publication-content font-body text-lg text-gray-300 leading-relaxed"
            // dangerouslySetInnerHTML={{ __html: publication.abstract }}
          >
            <Content />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-12"
          >
            <Button href={publication.href} iconEnd={<ExternalLink />}>
              View Publication
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
};
