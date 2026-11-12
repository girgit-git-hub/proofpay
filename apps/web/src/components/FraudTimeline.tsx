import { BryntumScheduler } from "./BryntumScheduler";

export function FraudTimeline({ tasks }: { tasks: any[] }) {
  return (
    <div>
      <BryntumScheduler tasks={tasks} />

      <div className="timeline">
        {tasks.map((t, i) => (
          <div className="timeline-row" key={t.id}>
            <div className="worker">Worker {(i % 3) + 1}</div>

            <div className="bar">
              <span>
                {new Date(t.createdAt).toLocaleTimeString()} - {t.title}
              </span>
            </div>

            <div className={t.status === "REVIEW" ? "conflict" : ""}>
              {t.verification?.overallScore ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
