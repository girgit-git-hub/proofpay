import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";

export async function agentRoutes(app: FastifyInstance) {
  app.post("/api/agent/query", async (req) => {
    const q = String((req.body as any)?.query || "");

    const tasks = await prisma.task.findMany({
      include: {
        verification: true,
        payout: true,
        evidence: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const low = q.toLowerCase();
    let rows = tasks;

    if (low.includes("flag") || low.includes("review")) {
      rows = tasks.filter(
        (t: (typeof tasks)[number]) =>
          t.status === "REVIEW" || (t.verification?.overallScore || 100) < 70,
      );
    }

    if (low.includes("verified")) {
      rows = tasks.filter(
        (t: (typeof tasks)[number]) =>
          t.status === "VERIFIED" || t.status === "PAID",
      );
    }

    if (low.includes("payout")) {
      rows = tasks.filter((t: (typeof tasks)[number]) => !!t.payout);
    }

    return {
      query: q,
      answer: `Found ${rows.length} matching tasks.`,
      tasks: rows,
    };
  });
}
