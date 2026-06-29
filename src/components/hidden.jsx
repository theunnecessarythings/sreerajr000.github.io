import React, { useEffect } from "react";
import { motion } from "framer-motion";

const MotionDiv = motion.div;

const averagedLeaderboard = [
  {
    model: "Qwen2.5-32B avg.",
    span: "50.12",
    code: "87.06",
    subcode: "80.51",
    codeSub: "77.33",
    strict: "39.12",
    relaxed: "64.40",
    best: true,
  },
  {
    model: "Mistral-Small-24B avg.",
    span: "48.87",
    code: "--",
    subcode: "--",
    codeSub: "77.49",
    strict: "37.59",
    relaxed: "64.01",
  },
  {
    model: "Llama-3.2-3B avg.",
    span: "49.07",
    code: "--",
    subcode: "--",
    codeSub: "76.49",
    strict: "38.38",
    relaxed: "63.49",
  },
  {
    model: "Llama-3.1-8B avg.",
    span: "48.78",
    code: "--",
    subcode: "--",
    codeSub: "75.84",
    strict: "37.60",
    relaxed: "63.09",
  },
];

const scalingResults = [
  {
    model: "Llama-3.2-3B",
    note: "Landscape noise dominated; averaging gave the largest small-model lift.",
    mean: "61.85",
    averaged: "63.49",
    delta: "+1.64",
  },
  {
    model: "Llama-3.1-8B",
    note: "Stable mid-scale baseline with smaller averaging gain.",
    mean: "62.15",
    averaged: "63.09",
    delta: "+0.94",
  },
  {
    model: "Mistral-Small-24B",
    note: "Needed lower LR and fewer epochs to avoid overfitting.",
    mean: "63.69",
    averaged: "64.01",
    delta: "+0.32",
  },
  {
    model: "Qwen2.5-32B",
    note: "Best single family after tuning; averaging established the current SOTA.",
    mean: "62.86",
    averaged: "64.40",
    delta: "+1.54",
  },
];

const agenticAttempts = [
  {
    name: "Structured search",
    result: "Candidate diversity improved, but full-output selection stayed below greedy.",
    metric: "60.0-63.6 relaxed F1",
    verdict: "below greedy",
  },
  {
    name: "Constrained Stage 3",
    result: "Teacher-forced sub-code scoring mismatched the free-generation objective.",
    metric: "35.1 relaxed F1",
    verdict: "collapsed",
  },
  {
    name: "Local postprocessors",
    result: "Boundary, addition, deletion, and close-candidate overrides were mostly harmful.",
    metric: "no net gain",
    verdict: "rejected",
  },
  {
    name: "Numeric selector",
    result: "Feature-only controllers did not transfer from dev to test.",
    metric: "64.16 vs 64.18",
    verdict: "no transfer",
  },
  {
    name: "Semantic verifier",
    result: "Technically works, but fold-0 had too few positive override examples.",
    metric: "63.29 best active run",
    verdict: "data-limited",
  },
];

const paperComparison = [
  {
    model: "Qwen2.5-32B-Instruct",
    method: "Paper: EPPC-OASIS weight avg.",
    code: "87.29",
    subcode: "80.34",
    span: "85.59",
    codeSub: "77.13",
    triplet: "63.83",
    note: "Best row in the previous paper table.",
  },
  {
    model: "Qwen2.5-32B-Instruct",
    method: "Current: greedy multistage avg.",
    code: "86.87",
    subcode: "80.33",
    span: "50.47",
    codeSub: "--",
    triplet: "64.18",
    note: "Current strongest actual pipeline on relaxed triplet F1.",
    best: true,
  },
  {
    model: "Qwen2.5-32B-Instruct",
    method: "Current: avg. leaderboard run",
    code: "87.06",
    subcode: "80.51",
    span: "50.12",
    codeSub: "77.33",
    triplet: "64.40",
    note: "Top reported averaged checkpoint in this worklog.",
    best: true,
  },
  {
    model: "Llama-3.3-70B-Instruct",
    method: "Paper: EPPC-OASIS weight avg.",
    code: "87.57",
    subcode: "78.79",
    span: "81.71",
    codeSub: "75.33",
    triplet: "60.97",
    note: "Strong previous large-model comparison point.",
  },
  {
    model: "DeepSeek-R1-Distill-Llama-70B",
    method: "Paper: EPPC-OASIS weight avg.",
    code: "85.28",
    subcode: "78.62",
    span: "83.01",
    codeSub: "75.31",
    triplet: "61.28",
    note: "Previous distilled 70B comparison point.",
  },
];

const oracleBreakdown = [
  ["multiple", 38],
  ["delete", 29],
  ["code", 10],
  ["add", 8],
  ["subcode", 2],
  ["same", 1],
];

const metricDefinitions = [
  ["Span F1", "How well the model finds the exact text spans that need codes."],
  ["Code F1", "Whether the correct high-level code is assigned to each span."],
  ["Sub-code F1", "Whether the finer-grained sub-code is correct."],
  ["Code+Sub F1", "Both code and sub-code must be right, ignoring span boundary strictness."],
  ["Strict triplet F1", "Span, code, and sub-code all have to match exactly."],
  ["Relaxed triplet F1", "Same end-to-end task, but allows minor span boundary differences."],
];

const pipelineSteps = [
  ["Stage 1", "Extract spans", "Find the relevant pieces of text in the input message."],
  ["Stage 2", "Assign code", "Choose the broad code category for each extracted span."],
  ["Stage 3", "Assign sub-code", "Choose the more specific label under that code."],
  ["Retrieval", "BGE context", "Use nearest codebook/context examples to help the model decide."],
  ["Averaging", "3-seed LoRA average", "Average adapter weights from seeds 3407, 42, and 100 to reduce variance."],
];

const MetricCard = ({ label, value, detail, tone = "normal" }) => (
  <div className="readout p-4">
    <p className="machine-label">{label}</p>
    <p
      className={`mt-3 font-mono text-3xl font-black ${
        tone === "warning" ? "text-[var(--warning)]" : "text-[var(--accent)]"
      }`}
    >
      {value}
    </p>
    <p className="muted mt-2 text-sm leading-6">{detail}</p>
  </div>
);

const ReportTable = ({ children, minWidth = "56rem" }) => (
  <div className="project-table-wrap">
    <div className="project-table-scroll">
      <table className="project-metric-table" style={{ minWidth }}>
        {children}
      </table>
    </div>
  </div>
);

export const HiddenPage = () => {
  useEffect(() => {
    const existingMeta = document.querySelector('meta[name="robots"]');
    const previousContent = existingMeta?.getAttribute("content");
    const meta = existingMeta || document.createElement("meta");

    meta.setAttribute("name", "robots");
    meta.setAttribute("content", "noindex, nofollow");

    if (!existingMeta) {
      document.head.appendChild(meta);
    }

    return () => {
      if (existingMeta && previousContent !== null) {
        existingMeta.setAttribute("content", previousContent);
      } else {
        meta.remove();
      }
    };
  }, []);

  return (
    <main>
      <section className="hidden-report page-shell pb-6 pt-12 md:pt-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="eyebrow mb-4">Research progress update</p>
            <h1 className="hidden-report-title display-title max-w-5xl">
              EPPC-OASIS scaling and agentic selection.
            </h1>
            <p className="muted mt-5 max-w-3xl text-base leading-7">
              Last week established a stronger multi-stage Qwen32B
              weight-averaged baseline and clarified the main bottleneck for
              the agentic approach: candidate generation has headroom, but
              reliable verification is still unsolved.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="readout p-4">
                <p className="machine-label">In plain English</p>
                <p className="muted mt-2 text-sm leading-6">
                  The normal greedy pipeline is currently the result to trust.
                  Search-based methods can generate better answers sometimes,
                  but our selector cannot yet tell when to switch away from the
                  greedy answer.
                </p>
              </div>
              <div className="readout p-4">
                <p className="machine-label">How to read numbers</p>
                <p className="muted mt-2 text-sm leading-6">
                  All displayed F1 values are percentages. Higher is better.
                  Relaxed triplet F1 is the main summary number because it
                  measures the full span-code-subcode prediction while being
                  less brittle about tiny boundary differences.
                </p>
              </div>
            </div>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.58, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="instrument-panel p-4"
          >
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="machine-label">Current best actual method</p>
                <p className="signal mt-1">Greedy multistage Qwen32B avg.</p>
              </div>
              <span className="status-pill-warning status-pill">main result</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="Relaxed triplet F1" value="64.18" detail="Reproduced greedy test run" />
              <MetricCard label="Strict triplet F1" value="39.34" detail="End-to-end exact structure" />
              <MetricCard label="Code F1" value="86.87" detail="Stage 2 assignment quality" />
              <MetricCard label="Sub-code F1" value="80.33" detail="Stage 3 free-generation output" />
            </div>
            <div className="module-log">
              <div className="module-log-line">
                <span className="warning-signal">takeaway</span>
                <span>Keep greedy Qwen32B averaged checkpoint as the baseline.</span>
              </div>
              <div className="module-log-line">
                <span className="signal">next</span>
                <span>Focus agentic work on verifier/selector supervision.</span>
              </div>
            </div>
          </MotionDiv>
        </div>
      </section>

      <section className="hidden-report page-shell py-6">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="panel p-5 md:p-6">
            <p className="eyebrow mb-2">What the system does</p>
            <h2 className="hidden-section-title section-title">Multi-stage labeling pipeline</h2>
            <p className="muted mt-4 text-sm leading-6">
              Each input message is converted into structured labels through
              three model calls. The final prediction is a set of triplets:
              <span className="mono text-[var(--text)]"> span + code + sub-code</span>.
            </p>
            <div className="mt-5 grid gap-3">
              {pipelineSteps.map(([label, title, detail]) => (
                <div key={label} className="readout p-3">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="machine-label">{label}</p>
                    <p className="signal">{title}</p>
                  </div>
                  <p className="muted mt-2 text-sm leading-6">{detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-5 md:p-6">
            <p className="eyebrow mb-2">Metric glossary</p>
            <h2 className="hidden-section-title section-title">What each column means</h2>
            <div className="mt-5 grid gap-3">
              {metricDefinitions.map(([metric, definition]) => (
                <div key={metric} className="grid gap-2 border-b border-[var(--border-soft)] pb-3 sm:grid-cols-[9rem_1fr]">
                  <p className="signal">{metric}</p>
                  <p className="muted text-sm leading-6">{definition}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="hidden-report page-shell py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Comparison to paper</p>
            <h2 className="hidden-section-title section-title">How the current result relates to the earlier table</h2>
          </div>
          <span className="status-pill-warning status-pill">important caveat</span>
        </div>
        <div className="rounded-[var(--radius)] border border-[var(--border-soft)] bg-white/[0.025] p-4">
          <p className="machine-label">Read this first</p>
          <p className="muted mt-2 text-sm leading-6">
            The earlier paper table reports triplet F1 as a single percentage.
            This worklog separates strict triplet F1 and relaxed triplet F1.
            The direct comparison below uses the current relaxed triplet F1
            because it is the main end-to-end number we are optimizing in these
            experiments. Span F1 may not be directly comparable if the previous
            table used a different span-matching convention.
          </p>
        </div>
        <ReportTable minWidth="66rem">
          <thead>
            <tr>
              <th>Model</th>
              <th>Method / source</th>
              <th>Code F1</th>
              <th>Sub-code F1</th>
              <th>Span F1</th>
              <th>Code+Sub F1</th>
              <th>Triplet F1</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            {paperComparison.map((row) => (
              <tr key={`${row.model}-${row.method}`}>
                <th>{row.model}</th>
                <td className="text-sm text-[var(--text-muted)]">{row.method}</td>
                <td className="project-table-number">{row.code}</td>
                <td className="project-table-number">{row.subcode}</td>
                <td className="project-table-number">{row.span}</td>
                <td className="project-table-number">{row.codeSub}</td>
                <td className={`project-table-number ${row.best ? "project-table-number-b" : ""}`}>
                  {row.triplet}
                </td>
                <td className="text-sm text-[var(--text-muted)]">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </ReportTable>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="readout p-4">
            <p className="machine-label">Previous best paper row</p>
            <p className="mono mt-2 text-xl font-black text-[var(--text)]">63.83</p>
            <p className="muted mt-2 text-sm leading-6">Qwen2.5-32B EPPC-OASIS weight avg.</p>
          </div>
          <div className="readout p-4">
            <p className="machine-label">Current actual result</p>
            <p className="mono mt-2 text-xl font-black text-[var(--accent)]">64.18</p>
            <p className="muted mt-2 text-sm leading-6">Greedy multistage Qwen32B averaged checkpoint.</p>
          </div>
          <div className="readout p-4">
            <p className="machine-label">Current reported top</p>
            <p className="mono mt-2 text-xl font-black text-[var(--accent)]">64.40</p>
            <p className="muted mt-2 text-sm leading-6">Best averaged leaderboard run in this worklog.</p>
          </div>
        </div>
      </section>

      <section className="hidden-report page-shell py-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Stage 1</p>
          <h2 className="hidden-section-title section-title">Scaling and weight averaging</h2>
          </div>
          <span className="status-pill">eppc_test</span>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {scalingResults.map((row) => (
            <div key={row.model} className="card p-3">
              <p className="machine-label">{row.model}</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div>
                  <p className="subtle text-xs">Mean</p>
                  <p className="mono text-lg font-black text-[var(--text)]">{row.mean}</p>
                </div>
                <div>
                  <p className="subtle text-xs">Avg.</p>
                  <p className="mono text-lg font-black text-[var(--accent)]">{row.averaged}</p>
                </div>
              </div>
              <p className="warning-signal mt-4">{row.delta}</p>
              <p className="muted mt-3 text-xs leading-5">{row.note}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-[var(--radius)] border border-[var(--border-soft)] bg-white/[0.025] p-4">
          <p className="machine-label">What this section shows</p>
          <p className="muted mt-2 text-sm leading-6">
            We trained the same multi-stage approach across model families and
            random seeds. The "Mean" value is the average relaxed triplet F1
            from normal single-seed training. The "Avg." value is the result
            after averaging the LoRA adapter weights across three seeds. The
            delta shows how much weight averaging helped.
          </p>
        </div>

        <ReportTable>
          <thead>
            <tr>
              <th>Model / configuration</th>
              <th>Span F1</th>
              <th>Code F1</th>
              <th>Sub-code F1</th>
              <th>Code+Sub F1</th>
              <th>Strict triplet F1</th>
              <th>Relaxed triplet F1</th>
            </tr>
          </thead>
          <tbody>
            {averagedLeaderboard.map((row) => (
              <tr key={row.model}>
                <th>
                  {row.model}
                  {row.best ? " *" : ""}
                </th>
                <td className="project-table-number">{row.span}</td>
                <td className="project-table-number">{row.code}</td>
                <td className="project-table-number">{row.subcode}</td>
                <td className="project-table-number project-table-number-b">{row.codeSub}</td>
                <td className="project-table-number">{row.strict}</td>
                <td className="project-table-number project-table-number-b">{row.relaxed}</td>
              </tr>
            ))}
          </tbody>
        </ReportTable>
        <p className="muted max-w-4xl text-sm leading-6">
          The leaderboard is focused on weight-averaged checkpoints because the
          goal here was to reduce seed instability without adding inference
          cost. The Qwen2.5-32B averaged model is the current top model on
          relaxed triplet F1 and is also strong across code/sub-code metrics.
        </p>
      </section>

      <section className="hidden-report page-shell py-6">
        <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="instrument-panel p-5">
            <p className="eyebrow mb-2">Agentic approach</p>
            <h2 className="hidden-section-title section-title">Oracle says the headroom is real</h2>
            <div className="mt-6 grid gap-3">
              <MetricCard label="Greedy relaxed F1" value="64.18" detail="Best actual deployed selection" />
              <MetricCard
                label="Oracle relaxed F1"
                value="68.89"
                detail="Best candidate selected with gold labels"
                tone="warning"
              />
              <MetricCard label="Better examples" value="88 / 260" detail="Average gain on improved cases: +14.97 F1" />
            </div>
          </div>

          <div className="card p-4">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="machine-label">Oracle improvement types</p>
                <p className="signal mt-1">What the candidates fix</p>
              </div>
              <span className="status-pill-warning status-pill">diagnostic</span>
            </div>
            <div className="grid gap-3">
              {oracleBreakdown.map(([label, count]) => (
                <div key={label} className="grid grid-cols-[6rem_1fr_3rem] items-center gap-3">
                  <p className="machine-label">{label}</p>
                  <div className="h-3 overflow-hidden rounded-sm bg-white/10">
                    <div
                      className="h-full bg-[var(--accent)]"
                      style={{ width: `${Math.max(6, (count / 38) * 100)}%` }}
                    />
                  </div>
                  <p className="mono text-right text-sm font-bold text-[var(--text)]">{count}</p>
                </div>
              ))}
            </div>
            <div className="module-log">
              <div className="module-log-line">
                <span className="warning-signal">read</span>
                <span>Most oracle gains are structural edits, especially multiple simultaneous corrections and deletions.</span>
              </div>
            </div>
            <p className="muted mt-4 text-sm leading-6">
              "Oracle" means we temporarily used the gold answer to pick the
              best candidate from the search set. This is not a deployable
              method, but it tells us whether the candidate pool contains useful
              alternatives. It does: the problem is choosing them automatically.
            </p>
          </div>
        </div>
      </section>

      <section className="hidden-report page-shell py-6">
        <div className="mb-6">
          <p className="eyebrow mb-2">Selection experiments</p>
          <h2 className="hidden-section-title section-title">What failed to beat greedy</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {agenticAttempts.map((attempt) => (
            <div key={attempt.name} className="card p-3">
              <p className="machine-label">{attempt.name}</p>
              <p className="mono mt-3 text-base font-black text-[var(--accent)]">{attempt.metric}</p>
              <p className="muted mt-3 text-xs leading-5">{attempt.result}</p>
              <p className="warning-signal mt-4">{attempt.verdict}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-[var(--radius)] border border-[var(--border-soft)] bg-white/[0.025] p-4">
          <p className="machine-label">Interpretation</p>
          <p className="muted mt-2 text-sm leading-6">
            These were attempts to exploit the oracle headroom. Broad search
            produced alternatives, constrained scoring changed the task in a way
            the model was not trained for, hand-written rules were too brittle,
            numeric selectors did not generalize, and the semantic verifier did
            not have enough positive examples to learn when an override is safe.
          </p>
        </div>
      </section>

      <section className="hidden-report page-shell py-6">
        <div className="panel p-5 md:p-6">
          <p className="eyebrow mb-2">Bottom line</p>
          <h2 className="hidden-section-title section-title">Candidate generation is no longer the bottleneck.</h2>
          <p className="muted mt-4 max-w-4xl text-base leading-7">
            The strongest actual result remains the greedy Qwen32B averaged
            multi-stage pipeline. Structured search produces better candidates
            in many examples, raising relaxed triplet F1 from 64.18 to 68.89
            under an oracle selector, but unsupervised heuristics, numeric
            selectors, and a fold-0 semantic verifier do not identify those
            candidates reliably out of split.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="readout p-4">
              <p className="machine-label">Main result</p>
              <p className="signal mt-2">Greedy Qwen32B avg.</p>
            </div>
            <div className="readout p-4">
              <p className="machine-label">Agentic promise</p>
              <p className="signal mt-2">+4.71 relaxed F1 oracle gap</p>
            </div>
            <div className="readout p-4">
              <p className="machine-label">Next bottleneck</p>
              <p className="signal mt-2">Verifier supervision</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};
