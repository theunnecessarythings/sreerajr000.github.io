import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Copy, ExternalLink } from "lucide-react";
import { Button } from "./button.jsx";
import { formatDate, publicationsData } from "../content_data";

const MotionArticle = motion.article;
const MotionDiv = motion.div;
const MotionHeader = motion.header;

const fade = {
  initial: { opacity: 0, y: 22 },
  animate: { opacity: 1, y: 0 },
};

const getAdjacentPublication = (publication, offset) => {
  const index = publicationsData.findIndex((item) => item.slug === publication.slug);
  if (index === -1) return null;
  return publicationsData[index + offset] || null;
};

const PublicationCard = ({ publication, index }) => (
  <MotionArticle
    key={publication.slug}
    {...fade}
    transition={{ duration: 0.5, delay: index * 0.055, ease: [0.22, 1, 0.36, 1] }}
    className="publication-card"
  >
    <Link to={`/publications/${publication.slug}`} className="publication-card-link">
      <div className="publication-card-index">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <small>{formatDate(publication.date)}</small>
      </div>
      {publication.image && (
        <div className="publication-card-media">
          <img src={publication.image} alt={publication.title} />
        </div>
      )}
      <div className="publication-card-body">
        <p className="eyebrow mb-2">{publication.venue}</p>
        <h2>{publication.title}</h2>
        <p>{publication.authors}</p>
        <div className="publication-card-meta">
          <span>{publication.publisher}</span>
        </div>
      </div>
      <ArrowRight className="publication-card-arrow" aria-hidden="true" />
    </Link>
  </MotionArticle>
);

export const PublicationsPage = () => (
  <main className="page-shell">
    <MotionDiv
      {...fade}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="publication-hero"
    >
      <div>
        <p className="eyebrow mb-4">Publications</p>
        <h1 className="page-title">Research work</h1>
        <p className="muted mt-5 max-w-2xl leading-7">
          Published work on fair and robust AI, biometrics, deepfakes, and
          generative model based bias mitigation.
        </p>
      </div>
      <div className="publication-hero-count">
        <strong>{publicationsData.length}</strong>
        <span>papers</span>
      </div>
    </MotionDiv>

    <div className="publication-overview">
      <div>
        <span>Focus</span>
        <strong>Fairness, biometrics, and generative models</strong>
      </div>
      <div>
        <span>Venues</span>
        <strong>IEEE, Springer, Elsevier</strong>
      </div>
      <div>
        <span>Years</span>
        <strong>2021 - 2025</strong>
      </div>
    </div>

    <div className="publication-list">
      {publicationsData.map((publication, index) => (
        <PublicationCard
          key={publication.slug}
          publication={publication}
          index={index}
        />
      ))}
    </div>
  </main>
);

export const PublicationDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [citationCopied, setCitationCopied] = useState(false);
  const publication = publicationsData.find((item) => item.slug === slug);

  if (!publication) {
    return (
      <main className="page-shell page-shell-narrow text-center">
        <h1 className="page-title">Publication not found</h1>
        <div className="mt-8">
          <Button
            onClick={() => navigate("/publications")}
            secondary
            icon={<ArrowLeft />}
          >
            Back to publications
          </Button>
        </div>
      </main>
    );
  }

  const handleCopyCitation = async () => {
    if (!publication.citation) return;
    await navigator.clipboard.writeText(publication.citation);
    setCitationCopied(true);
    setTimeout(() => setCitationCopied(false), 2000);
  };

  const previousPublication = getAdjacentPublication(publication, 1);
  const nextPublication = getAdjacentPublication(publication, -1);

  return (
    <main className="page-shell publication-detail-shell">
      <Button onClick={() => navigate("/publications")} secondary icon={<ArrowLeft />}>
        Back to publications
      </Button>

      <MotionHeader
        {...fade}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="publication-detail-header"
      >
        <p className="eyebrow mb-4">{publication.venue}</p>
        <h1 className="page-title">{publication.title}</h1>
        <div className="publication-detail-meta">
          <span>{publication.authors}</span>
          <span>{publication.publisher}</span>
          {publication.date && (
            <span>
              <CalendarDays aria-hidden="true" />
              {formatDate(publication.date)}
            </span>
          )}
        </div>
      </MotionHeader>

      {publication.image && (
        <MotionDiv
          {...fade}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="publication-detail-media"
        >
          <img
            src={publication.image}
            alt={publication.title}
          />
        </MotionDiv>
      )}

      <section className="publication-content prose-content publication-abstract">
        <h2>Abstract</h2>
        <p>{publication.abstract}</p>
      </section>

      {publication.citation && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="section-title">Citation</h2>
            <Button onClick={handleCopyCitation} secondary icon={<Copy />}>
              Copy
            </Button>
          </div>
          <pre className="readout overflow-x-auto p-4 text-sm text-[var(--text-muted)]">
            <code>{publication.citation}</code>
          </pre>
          <p
            className={`mt-2 text-sm text-[var(--accent)] transition-opacity ${
              citationCopied ? "opacity-100" : "opacity-0"
            }`}
          >
            Citation copied to clipboard.
          </p>
        </section>
      )}

      {publication.link && (
        <div className="mt-10">
          <Button href={publication.link} iconEnd={<ExternalLink />}>
            View Publication
          </Button>
        </div>
      )}

      {(previousPublication || nextPublication) && (
        <nav className="publication-more" aria-label="Publication navigation">
          {previousPublication && (
            <Link to={`/publications/${previousPublication.slug}`}>
              <span>Previous</span>
              <strong>{previousPublication.title}</strong>
            </Link>
          )}
          {nextPublication && (
            <Link to={`/publications/${nextPublication.slug}`}>
              <span>Next</span>
              <strong>{nextPublication.title}</strong>
            </Link>
          )}
        </nav>
      )}
    </main>
  );
};
