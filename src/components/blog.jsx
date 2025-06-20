import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./button";
import { DecoderText } from "./decoder_text";
import { Comments } from "./comments";

const posts = import.meta.glob("/src/content/blog/*.mdx", { eager: true });

const blogPosts = Object.keys(posts)
  .map((file) => {
    const slug = file.split("/").pop().replace(".mdx", "");
    const post = posts[file];
    return {
      slug,
      ...post.frontmatter,
      Content: post.default,
    };
  })
  .sort((a, b) => new Date(b.date) - new Date(a.date));

const ArticleEntry = ({
  post,
  delay,
  animationsReady,
  isFeatured,
  onClick,
  onTagClick,
}) => (
  <motion.div
    className={
      !isFeatured
        ? "list-item-hover-effect -m-4 p-4 cursor-pointer"
        : "cursor-pointer"
    }
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
      <>
        <p className="font-body text-gray-300 mb-4">{post.summary}</p>
        {post.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <button
                key={tag}
                className="text-xs bg-cyan-400/10 text-cyan-400 px-2 py-1 rounded-full hover:bg-cyan-400/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent article click
                  onTagClick(tag);
                }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </>
    )}

    <div className="flex justify-between items-center mt-4">
      {!post.comingSoon ? (
        <Button secondary to={`/blog/${post.slug}`} iconEnd={<ArrowRight />}>
          Read article
        </Button>
      ) : (
        <div className="font-body text-gray-600"></div>
      )}
      {post.readTime && (
        <span className="font-mono text-xs text-gray-500">{post.readTime}</span>
      )}
    </div>
  </motion.div>
);

export const BlogPage = ({ animationsReady }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag"));
  const navigate = useNavigate();

  const featuredPost = blogPosts.find((p) => p.featured);
  const latestPosts = blogPosts.filter((p) => !p.featured);

  const allTags = [...new Set(latestPosts.flatMap((p) => p.tags || []))];

  useEffect(() => {
    setSelectedTag(searchParams.get("tag"));
  }, [searchParams]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    if (tag) {
      setSearchParams({ tag: tag });
    } else {
      setSearchParams({});
    }
  };

  const filteredPosts = selectedTag
    ? latestPosts.filter((p) => p.tags && p.tags.includes(selectedTag))
    : latestPosts;

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

        <motion.div
          className="flex flex-wrap gap-2 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => handleTagSelect(null)}
            className={`px-4 py-2 text-sm rounded-full transition-colors ${
              selectedTag === null
                ? "bg-cyan-400 text-gray-900 font-bold"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagSelect(tag)}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${
                selectedTag === tag
                  ? "bg-cyan-400 text-gray-900 font-bold"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {tag}
            </button>
          ))}
        </motion.div>

        <div className="space-y-6">
          {filteredPosts.map((post, index) => (
            <React.Fragment key={post.slug}>
              <ArticleEntry
                post={post}
                delay={0.2 * (index + 1)}
                animationsReady={animationsReady}
                isFeatured={false}
                onClick={() => navigate(`/blog/${post.slug}`)}
                onTagClick={handleTagSelect}
              />
              {index < filteredPosts.length - 1 && (
                <hr className="border-gray-800 my-4" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="md:w-6/12 lg:w-6/12">
        {featuredPost && (
          <motion.div
            className="h-full bg-gray-800/20 border border-gray-700/50 p-6 md:p-8 flex flex-col group relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate(`/blog/${featuredPost.slug}`)}
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
              <ArticleEntry
                post={featuredPost}
                delay={0.4}
                animationsReady={animationsReady}
                isFeatured={true}
                onClick={() => navigate(`/blog/${featuredPost.slug}`)}
                onTagClick={handleTagSelect}
              />
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
};

export const BlogDetailPage = ({ animationsReady }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <main className="flex-1 p-12 text-center">
        <h1 className="text-4xl font-bold">Post not found</h1>
        <Button
          onClick={() => navigate("/blog")}
          secondary
          icon={<ArrowLeft />}
          className="mt-8"
        >
          Back to articles
        </Button>
      </main>
    );
  }
  const { Content } = post;
  return (
    <main className="flex-1 p-4 sm:p-6 md:p-12 m-4 sm:m-6 md:m-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Button
            onClick={() => navigate("/blog")}
            secondary
            icon={<ArrowLeft />}
          >
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
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <button
                    key={tag}
                    className="text-sm bg-cyan-400/10 text-cyan-400 px-3 py-1 rounded-full hover:bg-cyan-400/20 transition-colors"
                    onClick={() => navigate(`/blog?tag=${tag}`)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
        <motion.div
          className="blog-content prose prose-invert prose-lg max-w-none font-body text-gray-300 leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Content />
          <Comments />
        </motion.div>
      </div>
    </main>
  );
};
