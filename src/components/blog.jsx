import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { blogPosts } from "../mock_data.jsx";
import { Button } from "./button";
import { DecoderText } from "./decoder_text";

const ArticleEntry = ({
  post,
  delay,
  animationsReady,
  isFeatured,
  onClick,
}) => (
  <motion.div
    className={!isFeatured ? "list-item-hover-effect -m-4 p-4" : ""}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={!post.comingSoon ? onClick : undefined}
  >
    <div className="h-px w-16 bg-cyan-400 mb-3"></div>
    <p className="font-body text-sm text-gray-400 mb-2">{post.date}</p>
    <h3
      className={`font-display font-bold text-white mb-3 ${isFeatured ? "text-4xl" : "text-2xl"}`}
    >
      {!post.comingSoon ? (
        <DecoderText
          text={post.title}
          start={animationsReady}
          delay={delay + 0.2}
        />
      ) : (
        <span className="text-gray-500">{post.title}</span>
      )}
    </h3>
    {!post.comingSoon && (
      <p className="font-body text-gray-300 mb-4">{post.summary}</p>
    )}

    <div className="flex justify-between items-center mt-4">
      {!post.comingSoon ? (
        <Button secondary href="#" iconEnd={<ArrowRight />}>
          Read article
        </Button>
      ) : (
        <div className="font-body text-gray-600"></div>
      )}
      <span className="font-mono text-xs text-gray-500">{post.readTime}</span>
    </div>
  </motion.div>
);

export const BlogPage = ({ animationsReady, onSelectPost }) => {
  const featuredPost = blogPosts.find((p) => p.featured);
  const latestPosts = blogPosts.filter((p) => !p.featured);

  return (
    <main className="flex-1 flex flex-col md:flex-row p-4 sm:p-6 md:p-12 md:m-12 gap-10">
      <div className="md:w-6/12 lg:w-6/12 flex-shrink-0">
        <motion.h2
          className="layered-title font-display text-3xl font-bold text-white mb-8 py-4"
          data-text="Latest articles"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <DecoderText text="Latest articles" start={animationsReady} />
        </motion.h2>
        <div className="space-y-6">
          {latestPosts.map((post, index) => (
            <React.Fragment key={post.id}>
              <ArticleEntry
                post={post}
                delay={0.2 * (index + 1)}
                animationsReady={animationsReady}
                isFeatured={false}
                onClick={() => onSelectPost(post)}
              />
              {index < latestPosts.length - 1 && (
                <hr className="border-gray-800 my-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="md:w-6/12 lg:w-6/12">
        <motion.div
          className="h-full bg-gray-800/20 border border-gray-700/50 p-6 md:p-8 flex flex-col group relative overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105"
              style={{ backgroundImage: `url(${featuredPost.imageUrl})` }}
            ></div>
          </div>
          <div className="relative z-10">
            <p className="font-body text-sm font-bold text-yellow-400 mb-4">
              Featured
            </p>
            {featuredPost && (
              <ArticleEntry
                post={featuredPost}
                delay={0.4}
                animationsReady={animationsReady}
                isFeatured={true}
                onClick={() => onSelectPost(featuredPost)}
              />
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export const BlogDetailPage = ({ post, onBack, animationsReady }) => (
  <main className="flex-1 p-4 sm:p-6 md:p-12 m-4 sm:m-6 md:m-12">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Button onClick={onBack} secondary icon={<ArrowLeft />}>
          Back to articles
        </Button>
        <motion.div
          className="my-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="h-px w-16 bg-cyan-400 mb-3"></div>
          <p className="font-body text-sm text-gray-400 mb-2">{post.date}</p>
          <h1 className="font-display text-4xl md:text-6xl font-bold text-white">
            {post.title}
          </h1>
        </motion.div>
      </motion.div>
      <motion.div
        className="blog-content font-body text-lg text-gray-300 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: post.content }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      />
    </div>
  </main>
);
