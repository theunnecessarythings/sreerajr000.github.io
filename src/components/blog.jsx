import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Clock3 } from "lucide-react";
import { Button } from "./button";
import { Comments } from "./comments";
import { blogPosts, formatDate, getAllTags } from "../content_data";

const MotionArticle = motion.article;
const MotionDiv = motion.div;
const MotionHeader = motion.header;

const fade = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

const getSeriesPosts = (post) => {
  if (!post?.slug?.startsWith("llm-ptx-")) return [];
  return blogPosts
    .filter((item) => item.slug.startsWith("llm-ptx-"))
    .slice()
    .reverse();
};

const getAdjacentPost = (posts, post, offset) => {
  const index = posts.findIndex((item) => item.slug === post.slug);
  if (index === -1) return null;
  return posts[index + offset] || null;
};

const getRelatedPosts = (post) =>
  blogPosts
    .filter((item) => item.slug !== post.slug)
    .map((item) => ({
      ...item,
      score: (item.tags || []).filter((tag) => post.tags?.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

const ArticleCard = ({ post, index, delay = 0 }) => (
  <MotionArticle
    {...fade}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className="blog-card"
  >
    <Link to={`/blog/${post.slug}`} className="blog-card-link">
      <div className="blog-card-meta">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span>{formatDate(post.date)}</span>
        {post.readTime && <span>{post.readTime}</span>}
      </div>
      <div className="min-w-0">
        <h2 className="blog-card-title">{post.title}</h2>
        {post.summary && <p className="blog-card-summary">{post.summary}</p>}
        {post.tags && (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span key={tag} className="chip">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <ArrowRight className="blog-card-arrow" aria-hidden="true" />
    </Link>
  </MotionArticle>
);

const SmallPostLink = ({ post }) => (
  <Link to={`/blog/${post.slug}`} className="blog-side-link">
    <span>{post.title}</span>
    <small>{formatDate(post.date)}</small>
  </Link>
);

export const BlogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedTag, setSelectedTag] = useState(searchParams.get("tag"));
  const [currentPage, setCurrentPage] = useState(1);
  const allTags = getAllTags(blogPosts);

  useEffect(() => {
    setSelectedTag(searchParams.get("tag"));
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTag]);

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
    if (tag) setSearchParams({ tag });
    else setSearchParams({});
  };

  const filteredPosts = selectedTag
    ? blogPosts.filter((post) => post.tags?.includes(selectedTag))
    : blogPosts;
  const postsPerPage = 5;
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const startIndex = (currentPage - 1) * postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage);
  const featuredPost = blogPosts.find((post) => post.featured) || blogPosts[0];
  const secondaryFeatured = blogPosts
    .filter((post) => post.slug !== featuredPost?.slug && post.featured)
    .slice(0, 3);
  const seriesPosts = blogPosts
    .filter((post) => post.slug.startsWith("llm-ptx-"))
    .slice()
    .reverse();

  return (
    <main className="page-shell">
      <MotionDiv
        {...fade}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="blog-hero"
      >
        <div>
          <p className="eyebrow mb-4">Writing</p>
          <h1 className="page-title">Technical notes and project logs</h1>
          <p className="muted mt-5 max-w-2xl leading-7">
            Notes on GPU programming, ML systems, compilers, and implementation
            details that were worth writing down.
          </p>
        </div>
        <div className="blog-hero-count">
          <strong>{blogPosts.length}</strong>
          <span>posts</span>
        </div>
      </MotionDiv>

      {featuredPost && (
        <MotionArticle
          {...fade}
          transition={{ duration: 0.5, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          className="blog-featured"
        >
          <Link to={`/blog/${featuredPost.slug}`} className="blog-featured-link">
            {featuredPost.imageUrl && (
              <div className="blog-featured-media">
                <img src={featuredPost.imageUrl} alt={featuredPost.title} />
              </div>
            )}
            <div className="blog-featured-body">
              <p className="eyebrow mb-3">Featured</p>
              <h2>{featuredPost.title}</h2>
              {featuredPost.summary && <p>{featuredPost.summary}</p>}
              <div className="blog-inline-meta">
                <span>
                  <CalendarDays aria-hidden="true" />
                  {formatDate(featuredPost.date)}
                </span>
                {featuredPost.readTime && (
                  <span>
                    <Clock3 aria-hidden="true" />
                    {featuredPost.readTime}
                  </span>
                )}
              </div>
            </div>
          </Link>
        </MotionArticle>
      )}

      <div className="blog-layout">
        <section className="grid gap-4">
          <div className="blog-filter-bar">
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

          {paginatedPosts.map((post, index) => (
            <ArticleCard
              key={post.slug}
              post={post}
              index={startIndex + index}
              delay={index * 0.055}
            />
          ))}
          {totalPages > 1 && (
            <div className="blog-pagination">
              <Button
                secondary
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="subtle text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                secondary
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </section>

        <aside className="blog-side-panel">
          {seriesPosts.length > 0 && (
            <div className="blog-side-section">
              <h2>Series</h2>
              <p>
                A running sequence on building and understanding LLM kernels.
              </p>
              <div className="blog-series-list">
                {seriesPosts.slice(0, 5).map((post, index) => (
                  <Link key={post.slug} to={`/blog/${post.slug}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {post.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {secondaryFeatured.length > 0 && (
            <div className="blog-side-section">
              <h2>Featured</h2>
              <div className="grid gap-3">
                {secondaryFeatured.map((post) => (
                  <SmallPostLink key={post.slug} post={post} />
                ))}
              </div>
            </div>
          )}

          <div className="blog-side-section">
            <h2>Topics</h2>
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 12).map((tag) => (
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
        </aside>
      </div>
    </main>
  );
};

export const BlogDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = blogPosts.find((item) => item.slug === slug);

  if (!post) {
    return (
      <main className="page-shell page-shell-narrow text-center">
        <h1 className="page-title">Post not found</h1>
        <div className="mt-8">
          <Button onClick={() => navigate("/blog")} secondary icon={<ArrowLeft />}>
            Back to articles
          </Button>
        </div>
      </main>
    );
  }

  const { Content } = post;
  const seriesPosts = getSeriesPosts(post);
  const seriesPrevious = getAdjacentPost(seriesPosts, post, -1);
  const seriesNext = getAdjacentPost(seriesPosts, post, 1);
  const chronologicalPrevious = getAdjacentPost(blogPosts, post, 1);
  const chronologicalNext = getAdjacentPost(blogPosts, post, -1);
  const previousPost = seriesPrevious || chronologicalPrevious;
  const nextPost = seriesNext || chronologicalNext;
  const relatedPosts = getRelatedPosts(post);

  return (
    <main className="page-shell blog-detail-shell">
      <div className="mb-8">
        <Button onClick={() => navigate("/blog")} secondary icon={<ArrowLeft />}>
          Back to writing
        </Button>
      </div>

      <article className="blog-detail-article">
          <MotionHeader
            {...fade}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="blog-detail-header"
          >
            <div className="blog-inline-meta">
              <span>
                <CalendarDays aria-hidden="true" />
                {formatDate(post.date)}
              </span>
              {post.readTime && (
                <span>
                  <Clock3 aria-hidden="true" />
                  {post.readTime}
                </span>
              )}
            </div>
            <h1 className="page-title">{post.title}</h1>
            {post.summary && <p className="muted mt-5 leading-7">{post.summary}</p>}
            <div className="mt-5 flex flex-wrap gap-2">
              {(post.tags || []).map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/blog?tag=${tag}`)}
                  className="chip"
                >
                  {tag}
                </button>
              ))}
            </div>
          </MotionHeader>

          {post.imageUrl && (
            <MotionDiv
              {...fade}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="media-frame media-frame-cover blog-detail-media"
            >
              <img src={post.imageUrl} alt={post.title} />
            </MotionDiv>
          )}

          <MotionArticle
            {...fade}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="blog-content prose-content"
          >
            <Content />
          </MotionArticle>

          <nav className="blog-read-next" aria-label="Article navigation">
            {previousPost && (
              <Link to={`/blog/${previousPost.slug}`}>
                <span>Previous</span>
                <strong>{previousPost.title}</strong>
              </Link>
            )}
            {nextPost && (
              <Link to={`/blog/${nextPost.slug}`}>
                <span>Next</span>
                <strong>{nextPost.title}</strong>
              </Link>
            )}
          </nav>
          <Comments />
      </article>

      <aside className="blog-detail-footer">
          {seriesPosts.length > 0 && (
            <div className="blog-side-section">
              <h2>Series</h2>
              <div className="blog-series-list">
                {seriesPosts.map((item, index) => (
                  <Link
                    key={item.slug}
                    to={`/blog/${item.slug}`}
                    className={item.slug === post.slug ? "is-current" : ""}
                  >
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {relatedPosts.length > 0 && (
            <div className="blog-side-section">
              <h2>Read next</h2>
              <div className="grid gap-3">
                {relatedPosts.map((item) => (
                  <SmallPostLink key={item.slug} post={item} />
                ))}
              </div>
            </div>
          )}

        {(post.tags || []).length > 0 && (
          <div className="blog-side-section">
            <h2>Topics</h2>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/blog?tag=${tag}`)}
                  className="chip"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </aside>
    </main>
  );
};
