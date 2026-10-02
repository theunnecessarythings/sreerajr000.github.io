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
        <strong>53.16</strong>
        <span>Decision Index 0.2.1</span>
      </div>
      <div>
        <strong>8</strong>
        <span>LoRA rank</span>
      </div>
      <div>
        <strong>160,017</strong>
        <span>Training examples</span>
      </div>
      <div>
        <strong>
          100.3<span className="jade-unit"> ms</span>
        </strong>
        <span>Median request latency</span>
      </div>
    </div>
  );
}

export function DecisionPath() {
  return (
    <figure className="jade-figure">
      <div
        className="jade-diagram"
        aria-label="Context, question and options enter Qwen with LoRA, then a 255-slot decision head returns a choice and probabilities"
      >
        <div className="jade-diagram-input">
          <span className="jade-kicker">The request</span>
          <strong>Context + question</strong>
          <span>Options supplied by the caller</span>
          <div className="jade-mini-options">
            <span>calendar</span>
            <span>email</span>
            <span>notes</span>
          </div>
        </div>
        <span className="jade-arrow" aria-hidden="true">
          →
        </span>
        <div className="jade-diagram-model">
          <span className="jade-kicker">Read the input</span>
          <strong>Qwen3.8-27B</strong>
          <span className="jade-adapter">+ rank-8 LoRA</span>
          <div className="jade-head-grid" aria-hidden="true">
            {Array.from({ length: 48 }, (_, i) => (
              <i key={i} className={i < 3 ? "active" : ""} />
            ))}
          </div>
          <span>255 decision slots</span>
        </div>
        <span className="jade-arrow" aria-hidden="true">
          →
        </span>
        <div className="jade-diagram-output">
          <span className="jade-kicker">The response</span>
          <strong>One choice</strong>
          <span>Probability for each option</span>
          <span className="jade-output-code">choice · probabilities</span>
        </div>
      </div>
      <figcaption>
        One typed decision per question. The grid is a schematic of the output
        slots, not a prediction.
      </figcaption>
    </figure>
  );
}

export function OracleExample() {
  const [selection, setSelection] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [offset, setOffset] = useState(0);
  const options = Object.entries(data.example.question.criteria);
  const arranged = [...options.slice(offset), ...options.slice(0, offset)];
  const material = data.example.state.materials.find(
    (m) => m.name === data.exampleView.material,
  );
  const heatUnits = data.exampleView.heatUnits;
  const answer =
    material.baseline_conductivity + heatUnits * material.heat_gain_per_unit;
  return (
    <figure className="jade-figure jade-oracle">
      <div className="jade-panel-top">
        <span className="jade-kicker">Inside a generated world</span>
        <span className="jade-tag">Actual training example</span>
      </div>
      <div className="jade-world">
        <div>
          <span>Material</span>
          <strong>{material.name}</strong>
        </div>
        <div>
          <span>Baseline</span>
          <strong>{material.baseline_conductivity}</strong>
        </div>
        <div>
          <span>Gain / heat unit</span>
          <strong>+{material.heat_gain_per_unit}</strong>
        </div>
        <div>
          <span>Applied heat</span>
          <strong>{heatUnits}</strong>
        </div>
      </div>
      <p className="jade-question">{data.example.question.instructions}</p>
      <div
        className="jade-ballot"
        role="group"
        aria-label="Choose the conductivity"
      >
        {arranged.map(([id, value], i) => (
          <button
            type="button"
            key={id}
            aria-pressed={selection === id}
            onClick={() => setSelection(id)}
            className={`${selection === id ? "selected" : ""} ${reveal && id === data.example.label ? "correct" : ""}`}
          >
            <small>{String(i + 1).padStart(2, "0")}</small>
            {value}
            {reveal && id === data.example.label && (
              <span aria-label="Oracle answer">✓</span>
            )}
          </button>
        ))}
      </div>
      <div className="jade-controls">
        <button type="button" onClick={() => setReveal(!reveal)}>
          {reveal ? "Hide the oracle" : "Reveal the oracle"}
        </button>
        <button
          type="button"
          onClick={() => setOffset((offset + 5) % options.length)}
        >
          Rearrange the options ↻
        </button>
      </div>
      <div className="jade-oracle-answer" aria-live="polite">
        {reveal ? (
          <>
            <strong>
              {material.baseline_conductivity} + {heatUnits} ×{" "}
              {material.heat_gain_per_unit} = {answer}.
            </strong>{" "}
            {selection
              ? selection === data.example.label
                ? "Your choice matches the oracle."
                : "Your choice differs from the oracle."
              : "The label stays the same when the options move."}
          </>
        ) : (
          "Choose an option, then reveal the calculation. No model is running here."
        )}
      </div>
      <details>
        <summary>See the rest of the world</summary>
        <div className="jade-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Material</th>
                <th>Baseline</th>
                <th>Heat gain</th>
                <th>Mass (g)</th>
              </tr>
            </thead>
            <tbody>
              {data.example.state.materials.map((m) => (
                <tr key={m.name}>
                  <td>{m.name}</td>
                  <td>{m.baseline_conductivity}</td>
                  <td>{m.heat_gain_per_unit}</td>
                  <td>{m.sample_mass_grams}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>{data.example.state.rule}</p>
      </details>
      <figcaption>
        Source: JADE-Data, <code>{data.example.id}</code>. The compact view
        shows the relevant material; the full record also contains distractor
        materials.
      </figcaption>
    </figure>
  );
}

export function Mixture() {
  const parts = [
    ["Core", 20001, "#7cf7c8"],
    ["Reasoning", 22000, "#b1baff"],
    ["Language", 22011, "#f4b88b"],
    ["Retrieval", 28004, "#72d8ff"],
    ["Tools", 38001, "#e4c761"],
    ["Arts / forecasting", 30000, "#e8a1c3"],
  ];
  return (
    <figure className="jade-figure">
      <span className="jade-kicker">The training mixture · 160,017 rows</span>
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
        Actual emitted row counts. Related cases stay together, so family
        boundaries account for the extra 17 rows.
      </figcaption>
    </figure>
  );
}

export function Leaderboard() {
  const [zoom, setZoom] = useState(false);
  const min = zoom ? 48 : 0;
  const max = zoom ? 60 : 65;
  const ticks = zoom ? [48, 51, 54, 57, 60] : [0, 16.25, 32.5, 48.75, 65];
  return (
    <figure className="jade-figure">
      <div className="jade-panel-top">
        <span className="jade-kicker">Where 53.16 would fit</span>
        <button
          type="button"
          className="jade-toggle"
          aria-pressed={zoom}
          onClick={() => setZoom(!zoom)}
        >
          {zoom ? "Show full scale" : "Zoom to 48–60"}
        </button>
      </div>
      <p className="jade-chart-note">
        Listed models + JADE's submitted result. Jev is the reference. Pending
        submissions are omitted.
      </p>
      <div className="jade-board-axis">
        <span>{zoom ? "Zoomed scale" : "Full scale"}</span>
        <div>
          {ticks.map((n) => (
            <span key={n}>{Number.isInteger(n) ? n : n.toFixed(1)}</span>
          ))}
        </div>
        <span>Index</span>
      </div>
      <div
        className="jade-board"
        aria-label="Comparison of Decision Index scores"
      >
        {data.peers.map((peer) => (
          <div
            key={peer.name}
            className={`jade-board-row ${peer.name === "JADE" ? "jade-highlight" : ""}`}
          >
            <div className="jade-board-name">
              {peer.name}
              <small>
                {peer.status === "submitted"
                  ? "Submitted · provisional"
                  : peer.status === "reference"
                    ? "Reference"
                    : "Listed"}
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
      <div className="jade-tie-note">
        <span>
          53.16 <b>JADE</b>
        </span>
        <span className="jade-tie-link">↔ 0.03 points</span>
        <span>
          53.13 <b>Eikos</b>
        </span>
        <small>
          Same provisional rank under the board's 0.25-point tie rule.
        </small>
      </div>
      <figcaption>
        September 28, 2026 score snapshot, retrieved October 2. The October 2
        AutoJev rename is reflected here.{" "}
        <a href={data.source.leaderboardUrl}>Board data</a> ·{" "}
        <a href="https://github.com/apolinario/decision-index/pull/45">
          JADE submission
        </a>
        . This is not a live leaderboard.
      </figcaption>
    </figure>
  );
}

export function CapabilityChart() {
  const [metric, setMetric] = useState("skill");
  const denominator = data.areas
    .filter((a) => a.id !== "arts")
    .reduce((sum, a) => sum + Math.sqrt(a.n), 0);
  return (
    <figure className="jade-figure">
      <div className="jade-panel-top">
        <span className="jade-kicker">
          Five areas, five very different results
        </span>
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
            Raw
          </button>
        </div>
      </div>
      <p className="jade-chart-note">
        {metric === "skill"
          ? "Chance-adjusted skill: 0 is chance-level, 100 is perfect."
          : "Native area aggregate after coverage accounting. These are mixed task metrics, not a single accuracy."}
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
            <span>
              {(a.id === "arts"
                ? 10
                : (90 * Math.sqrt(a.n)) / denominator
              ).toFixed(1)}
              % of the index · {a.n} benchmarks
            </span>
          </div>
          <div className="jade-capability-track">
            <span style={{ width: `${a[metric] * 100}%` }} />
            <i className="jade-midline" />
          </div>
          <b>{percent(a[metric])}</b>
        </div>
      ))}
      <figcaption>
        Both views use a 0–100 axis. The index weights areas differently; it
        also weights gold benchmarks inside each area. Switching views does not
        change the underlying run.
      </figcaption>
    </figure>
  );
}

export function BenchmarkExplorer() {
  const [area, setArea] = useState("all");
  const [includeOutside, setIncludeOutside] = useState(false);
  const visible = data.benchmarks.filter(
    (b) => (includeOutside || b.counted) && (area === "all" || b.area === area),
  );
  return (
    <figure className="jade-figure jade-benchmarks">
      <div className="jade-panel-top">
        <span className="jade-kicker">The individual benchmarks</span>
        <label className="jade-select-label">
          Area{" "}
          <select value={area} onChange={(e) => setArea(e.target.value)}>
            <option value="all">All areas</option>
            {Object.entries(names).map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="jade-checkbox">
        <input
          type="checkbox"
          checked={includeOutside}
          onChange={(e) => setIncludeOutside(e.target.checked)}
        />{" "}
        Also show benchmarks outside the headline index
      </label>
      <p className="jade-chart-note" aria-live="polite">
        Showing {visible.length} benchmarks. Native values are on their original
        0–1 metric scale; skill is on a 0–100 scale.
      </p>
      <div className="jade-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Benchmark / native metric</th>
              <th>Native</th>
              <th>Skill</th>
              <th>Requests</th>
              <th>Unsupported</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((b) => (
              <tr key={b.id}>
                <td>
                  <strong>{b.name}</strong>
                  <small>
                    {b.metric}
                    {!b.counted ? " · outside the index" : ""}
                  </small>
                </td>
                <td>
                  {b.native == null ? "—" : b.native.toFixed(4)}
                  {b.metric.includes("Brier") && <small>↓ better</small>}
                </td>
                <td>{b.skill == null ? "—" : percent(b.skill)}</td>
                <td>{b.requests.toLocaleString("en-US")}</td>
                <td>{b.unsupported}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <figcaption>
        Native metrics are not interchangeable. Index skill includes chance
        correction and coverage adjustments; ForecastBench uses Brier
        improvement over 0.25.{" "}
        <a href={data.source.scoresUrl}>Frozen source scores</a>.
      </figcaption>
    </figure>
  );
}
