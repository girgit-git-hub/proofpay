import { useEffect, useState } from "react";
import {
  getTasks,
  agentQuery,
  verifyTask,
  payoutTask,
  uploadEvidence,
} from "../lib/api";

import { ReviewGrid } from "../components/ReviewGrid";
import { FraudTimeline } from "../components/FraudTimeline";
import { MapPanel } from "../components/MapPanel";

type Task = {
  id: string;
  title: string;
  status: string;
  payout?: any;
  verification?: {
    overallScore?: number;
    explanation?: string;
    checks?: Array<{
      key: string;
      score: number;
    }>;
  };
  evidence?: Array<{
    filePath: string;
    originalName: string;
    sha256: string;
    perceptualHash?: string;
  }>;
};

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selected, setSelected] = useState<Task | undefined>();
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);

    try {
      const data = await getTasks();

      setTasks(data);

      // Keep the selected task synchronized with the freshly
      // fetched version from the backend.
      if (selected) {
        const updatedSelected = data.find(
          (task: Task) => task.id === selected.id,
        );

        setSelected(updatedSelected);
      }
    } catch (error: any) {
      console.error("Failed to load tasks:", error);
      alert(error?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const data = await getTasks();
        setTasks(data);
      } catch (error: any) {
        console.error("Failed to load tasks:", error);
        alert(error?.message || "Failed to load tasks");
      }
    };

    void loadTasks();
  }, []);

  const act = async (fn: () => Promise<any>) => {
    try {
      setLoading(true);

      await fn();

      // Fetch the latest state from the backend.
      const data = await getTasks();
      setTasks(data);

      // Update currently selected task as well.
      if (selected) {
        const updatedSelected = data.find(
          (task: Task) => task.id === selected.id,
        );

        setSelected(updatedSelected);
      }
    } catch (error: any) {
      console.error("Action failed:", error);
      alert(error?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const runAgent = async () => {
    if (!q.trim()) {
      return;
    }

    try {
      setAgentLoading(true);
      setAnswer("");

      const result = await agentQuery(q.trim());

      setAnswer(result?.answer || "No answer returned by the agent.");
    } catch (error: any) {
      console.error("Agent query failed:", error);
      alert(error?.message || "Agent request failed");
    } finally {
      setAgentLoading(false);
    }
  };

  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:4000";

  const evidenceUrl = selected?.evidence?.[0]
    ? `${apiBaseUrl}/uploads/${selected.evidence[0].filePath.split("/").pop()}`
    : "";

  const verifiedCount = tasks.filter(
    (task) => task.status === "VERIFIED" || task.status === "PAID",
  ).length;

  const reviewCount = tasks.filter((task) => task.status === "REVIEW").length;

  const payoutCount = tasks.filter((task) => Boolean(task.payout)).length;

  const highRiskCount = tasks.filter(
    (task) => (task.verification?.overallScore ?? 100) < 70,
  ).length;

  return (
    <div className="app">
      <header>
        <div>
          <div className="brand">
            Proof<span>Pay</span>
          </div>

          <div className="sub">
            Proof of work. Verified by AI. Paid by PayPal.
          </div>
        </div>

        <div className="live">
          <i /> PAYPAL SANDBOX
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero">
          <div>
            <div className="eyebrow">AI VERIFICATION CONTROL CENTER</div>

            <h1>Donor money, backed by proof.</h1>

            <p>
              Every payout is gated by evidence, fraud signals and deterministic
              eligibility checks.
            </p>
          </div>

          <div className="score">
            <b>{verifiedCount}</b>

            <span>verified tasks</span>
          </div>
        </section>

        {/* STATS */}
        <section className="stats">
          <div>
            <b>{tasks.length}</b>
            <span>Total tasks</span>
          </div>

          <div>
            <b>{reviewCount}</b>
            <span>Needs review</span>
          </div>

          <div>
            <b>{payoutCount}</b>
            <span>Payouts</span>
          </div>

          <div>
            <b>{highRiskCount}</b>
            <span>High risk</span>
          </div>
        </section>

        {/* AGENT */}
        <section className="panel agent">
          <div>
            <div className="eyebrow">PAYPAL AGENT + MCP</div>

            <h2>Ask ProofPay anything about the money trail.</h2>
          </div>

          <div className="query">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !agentLoading) {
                  void runAgent();
                }
              }}
              placeholder="show workers with 2+ flags this week, worst first"
              disabled={agentLoading}
            />

            <button
              onClick={() => void runAgent()}
              disabled={agentLoading || !q.trim()}
            >
              {agentLoading ? "Running..." : "Run agent"}
            </button>
          </div>

          {answer && <div className="answer">{answer}</div>}
        </section>

        {/* REVIEW GRID */}
        <section className="panel">
          <div className="panel-head">
            <div>
              <div className="eyebrow">AG GRID · REVIEW WORKBENCH</div>

              <h2>Evidence decisions</h2>
            </div>

            <button
              className="ghost"
              onClick={() => void refresh()}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>

          <ReviewGrid
            rows={tasks}
            onSelect={(task: Task) => setSelected(task)}
          />
        </section>

        {/* SELECTED TASK */}
        {selected && (
          <section className="panel detail">
            <div className="panel-head">
              <div>
                <div className="eyebrow">TASK {selected.id.slice(-8)}</div>

                <h2>{selected.title}</h2>
              </div>

              <div className="actions">
                <button
                  onClick={() => void act(() => verifyTask(selected.id))}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Run verification"}
                </button>

                <button
                  className="success"
                  disabled={loading || selected.status !== "VERIFIED"}
                  onClick={() => void act(() => payoutTask(selected.id))}
                >
                  {loading ? "Processing..." : "Pay via PayPal"}
                </button>
              </div>
            </div>

            <div className="detail-grid">
              {/* AI SCORE */}
              <div>
                <h3>AI proof score</h3>

                <div className="bigscore">
                  {selected.verification?.overallScore ?? "—"}

                  <small>/100</small>
                </div>

                <p>
                  {selected.verification?.explanation ||
                    "Evidence not verified yet."}
                </p>
              </div>

              {/* CHECKS */}
              <div>
                <h3>Checks</h3>

                <div className="checks">
                  {(selected.verification?.checks || []).map((check) => (
                    <div key={check.key}>
                      <span>{check.key.replaceAll("_", " ")}</span>

                      <b>{check.score}</b>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* EVIDENCE */}
            {selected.evidence?.[0] && (
              <div className="evidence">
                <img
                  src={evidenceUrl}
                  alt={selected.evidence[0].originalName}
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div>
                  <b>{selected.evidence[0].originalName}</b>

                  <p>
                    SHA-256:{" "}
                    {selected.evidence[0].sha256
                      ? `${selected.evidence[0].sha256.slice(0, 20)}…`
                      : "—"}
                  </p>

                  <p>pHash: {selected.evidence[0].perceptualHash || "—"}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TIMELINE + MAP */}
        <section className="two">
          <section className="panel">
            <div className="eyebrow">BRYNTUM SCHEDULER PRO</div>

            <h2>Fraud timeline</h2>

            <FraudTimeline tasks={tasks} />
          </section>

          <section className="panel">
            <div className="eyebrow">LEAFLET + OPENSTREETMAP</div>

            <h2>Evidence geography</h2>

            <MapPanel />
          </section>
        </section>

        {/* UPLOAD */}
        <section className="panel upload">
          <div>
            <div className="eyebrow">FIELD EVIDENCE</div>

            <h2>Upload proof to selected task</h2>

            <p>
              Sharp normalizes the image; Exifr extracts metadata; pHash checks
              reuse before AI verification.
            </p>
          </div>

          <input
            type="file"
            accept="image/*"
            disabled={!selected || loading}
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file || !selected) {
                return;
              }

              void act(() => uploadEvidence(selected.id, file));

              // Allow selecting the same file again later.
              e.currentTarget.value = "";
            }}
          />
        </section>
      </main>
    </div>
  );
}
