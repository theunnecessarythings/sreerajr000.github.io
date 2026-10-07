import { useState } from "react";
import data from "./jade-results.json";
import "./jade.css";

const names = {
  knowledge: "Knowledge & reasoning",
  language: "Language understanding",
  retrieval: "Retrieval & classification",
  tools: "Tools & automation",
  arts: "Arts & human taste",
};
const percent = (value) => (value * 100).toFixed(2);

export function ResultStrip() {
  return (
    <div className="jade-result-strip" aria-label="JADE evaluation overview">
      <div>
        <strong>{data.index.toFixed(2)}</strong>
        <span>Decision Index {data.edition}</span>
      </div>
      <div>
        <strong>#{data.rank}</strong>
        <span>Joint overall placement</span>
      </div>
      <div>
        <strong>8</strong>
        <span>LoRA rank</span>
      </div>
      <div>
        <strong>{data.trainingRows.toLocaleString("en-US")}</strong>
        <span>Training examples</span>
      </div>
    </div>
  );
}

export function Mixture() {
  const parts = [
    ["Broad/core tasks", 20001, "#7cf7c8"],
    ["Knowledge and reasoning", 22000, "#b1baff"],
    ["Language", 22011, "#f4b88b"],
    ["Retrieval and classification", 28004, "#72d8ff"],
    ["Tools and automation", 38001, "#e4c761"],
    ["Arts, preferences, and forecasting", 30000, "#e8a1c3"],
  ];
  return (
    <figure className="jade-figure">
      <span className="jade-kicker">Training mixture · 160,017 examples</span>
      <div className="jade-mixture-bar" aria-hidden="true">
        {parts.map(([name, count, color]) => (
          <span
            key={name}
            style={{
              width: `${(count / data.trainingRows) * 100}%`,
              background: color,
            }}
          />
        ))}
      </div>
      <div className="jade-mixture-key">
        {parts.map(([name, count, color]) => (
          <div key={name}>
            <i style={{ background: color }} />
            <span>{name}</span>
            <strong>{count.toLocaleString("en-US")}</strong>
          </div>
        ))}
      </div>
      <figcaption>
        Actual training counts from{" "}
        <a href="https://huggingface.co/datasets/theunnecessarythings/JADE-Data">
          JADE-Data
        </a>
        .
      </figcaption>
    </figure>
  );
}

export function Leaderboard() {
  const [zoom, setZoom] = useState(false);
  const min = zoom ? 50 : 0;
  const max = zoom ? 65 : 70;
  const ticks = zoom ? [50, 53.75, 57.5, 61.25, 65] : [0, 17.5, 35, 52.5, 70];
  return (
    <figure className="jade-figure">
      <div className="jade-panel-top">
        <span className="jade-kicker">Decision Index 0.3 · Full score</span>
        <button
          type="button"
          className="jade-toggle"
          aria-pressed={zoom}
          onClick={() => setZoom(!zoom)}
        >
          {zoom ? "Show full scale" : "Zoom to 50–65"}
        </button>
      </div>
      <p className="jade-chart-note">
        Selected entries · October 7, 2026 · Includes Jev as the reference.
      </p>
      <div className="jade-board-axis">
        <span>{zoom ? "Zoomed scale" : "Full scale"}</span>
        <div>
          {ticks.map((n) => (
            <span key={n}>{n}</span>
          ))}
        </div>
        <span>Score</span>
      </div>
      <div
        className="jade-board"
        aria-label="Comparison of Decision Index 0.3 Full scores"
      >
        {data.peers.map((peer) => (
          <div
            key={peer.engine}
            className={`jade-board-row ${peer.engine === "jade" ? "jade-highlight" : ""}`}
          >
            <div className="jade-board-name">
              {peer.name}
              <small>
                {peer.tied ? "Joint " : ""}#{peer.rank}
                {peer.engine === "jade" ? " · Accepted" : ""}
              </small>
            </div>
            <div className="jade-board-track">
              <div
                className="jade-board-fill"
                style={{
                  width: `${((peer.score - min) / (max - min)) * 100}%`,
                }}
              />
              <span
                className="jade-board-dot"
                style={{ left: `${((peer.score - min) / (max - min)) * 100}%` }}
              />
            </div>
            <strong>{peer.score.toFixed(2)}</strong>
          </div>
        ))}
      </div>
      <figcaption>
        Frozen October 7 snapshot. Displayed ranks follow the board's{" "}
        {data.tieBand}-point tie band.{" "}
        <a href={data.source.indexDataUrl}>Source data</a> ·{" "}
        <a href={data.source.acceptanceUrl}>JADE acceptance</a>.
      </figcaption>
    </figure>
  );
}

export function CapabilityChart() {
  const [metric, setMetric] = useState("skill");
  return (
    <figure className="jade-figure">
      <div className="jade-panel-top">
        <span className="jade-kicker">Public-panel area scores · v0.3</span>
        <div className="jade-segment" role="group" aria-label="Score type">
          <button
            type="button"
            aria-pressed={metric === "skill"}
            onClick={() => setMetric("skill")}
          >
            Skill
          </button>
          <button
            type="button"
            aria-pressed={metric === "raw"}
            onClick={() => setMetric("raw")}
          >
            Native
          </button>
        </div>
      </div>
      <p className="jade-chart-note">
        {metric === "skill"
          ? "Chance-adjusted skill, with coverage accounting."
          : "Native area aggregate, with coverage accounting."}
      </p>
      <div className="jade-capability-axis">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
      {data.areas.map((a) => (
        <div className="jade-capability-row" key={a.id}>
          <div>
            <strong>{names[a.id]}</strong>
            <span>{a.n} public benchmarks</span>
          </div>
          <div className="jade-capability-track">
            <span style={{ width: `${a[metric] * 100}%` }} />
            <i className="jade-midline" />
          </div>
          <b>{percent(a[metric])}</b>
        </div>
      ))}
      <figcaption>
        Both views use a 0–100 axis. These are the public-panel scores; the Full
        score also incorporates private evaluations.{" "}
        <a href={data.source.indexDataUrl}>Source data</a>.
      </figcaption>
    </figure>
  );
}
