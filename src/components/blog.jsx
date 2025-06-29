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
        ? "list-item-hover-effect group m-8 p-4 cursor-pointer"
        : "cursor-pointer"
    }
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    onClick={!post.comingSoon ? onClick : undefined}
  >
    <div className="h-px w-16 bg-cyan-400 mb-3" />
    <p className="font-body text-sm text-gray-400 mb-2">{post.date}</p>
    <div
      className={`font-display font-bold text-white mb-3 ${
        isFeatured ? "text-4xl" : "text-2xl"
      }`}
    >
      {!post.comingSoon ? (
        <h3 className="font-display text-2xl text-white font-bold">
          {post.title}
        </h3>
      ) : (
        <span className="text-gray-500">{post.title}</span>
      )}
    </div>
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
                  e.stopPropagation();
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
      {!post.comingSoon && (
        <Button secondary to={`/blog/${post.slug}`} iconEnd={<ArrowRight />}>
          Read article
        </Button>
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
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const featuredPosts = blogPosts.filter((p) => p.featured);
  const latestPosts = blogPosts;
  const allTags = [...new Set(latestPosts.flatMap((p) => p.tags || []))];

  useEffect(() => {
    setSelectedTag(searchParams.get("tag"));
  }, [searchParams]);

  // Reset to page 1 whenever the filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    if (tag) {
      setSearchParams({ tag });
    } else {
      setSearchParams({});
    }
  };

  const filteredPosts = selectedTag
    ? latestPosts.filter((p) => p.tags?.includes(selectedTag))
    : latestPosts;

  // pagination logic
  const postsPerPage = 4;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(
    startIndex,
    startIndex + postsPerPage,
  );

  return (
    <main className="flex-1 flex flex-col flex-col-reverse md:flex-row p-4 m-4 sm:p-6 sm:m-6 md:p-12 md:m-12">
      {/* Left column: paginated posts */}
      <div className="md:w-6/12 lg:w-6/12 flex-shrink-0">
        <motion.h2
          className="layered-title font-display text-4xl md:text-5xl font-bold text-white mb-8 py-4"
          data-text="Latest articles"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <DecoderText text="Latest articles" start={animationsReady} />
        </motion.h2>

        <motion.div
          className="flex flex-wrap gap-2 mb-6"
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

        <div className="space-y-6 py-4">
          {paginatedPosts.map((post, index) => (
            <React.Fragment key={post.slug}>
              <ArticleEntry
                post={post}
                delay={0.2 * (index + 1)}
                animationsReady={animationsReady}
                isFeatured={false}
                onClick={() => navigate(`/blog/${post.slug}`)}
                onTagClick={handleTagSelect}
              />
              {index < paginatedPosts.length - 1 && (
                <hr className="border-gray-800 my-4" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button
              secondary
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              secondary
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      {/* Right column: featured posts */}
      <div className="md:w-6/12 lg:w-6/12">
        {featuredPosts.map((featuredPost) => (
          <motion.div
            key={featuredPost.slug}
            className="h-[400px] m-4 bg-gray-800/20 border border-gray-700/50 p-6 md:p-8 flex flex-col group relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onClick={() => navigate(`/blog/${featuredPost.slug}`)}
          >
            <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-60 transition-opacity duration-500">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-in-out group-hover:scale-105"
                style={{ backgroundImage: `url(${featuredPost.imageUrl})` }}
              />
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
        ))}
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
    <main className="flex-1 m-4 sm:m-6 md:m-12">
      <div className="bg-black/10 rounded-lg border-gray-800 border p-4 sm:p-6 md:p-12 max-w-7xl mx-auto">
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
            <div className="h-px w-16 bg-cyan-400 mb-3" />
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
            {/* Image  */}
            {post.imageUrl && (
              <motion.img
                src={post.imageUrl}
                alt={post.title}
                className="mt-6 mb-0 mx-auto w-auto h-[400px] rounded-lg shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              />
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
