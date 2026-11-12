import { prisma } from "../lib/prisma.js";
import { createPayout } from "../lib/paypal.js";
import crypto from "node:crypto";

export async function payoutTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      verification: true,
      payout: true,
      worker: true,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.verification?.decision !== "VERIFIED") {
    throw new Error("Task is not eligible for payout");
  }

  if (
    task.payout?.status === "SUCCEEDED" ||
    task.payout?.status === "PROCESSING"
  ) {
    return task.payout;
  }

  const idempotencyKey =
    task.payout?.idempotencyKey ||
    crypto.createHash("sha256").update(`proofpay:${taskId}`).digest("hex");

  const payout = await prisma.payout.upsert({
    where: { taskId },
    create: {
      taskId,
      workerEmail: task.worker?.email || "demo-worker@example.com",
      amount: task.amount,
      currency: task.currency,
      idempotencyKey,
      status: "PROCESSING",
    },
    update: {
      status: "PROCESSING",
    },
  });

  try {
    if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET) {
      const r: any = await createPayout(
        payout.workerEmail,
        Number(payout.amount),
        payout.currency,
        idempotencyKey,
      );

      return await prisma.payout.update({
        where: { id: payout.id },
        data: {
          paypalBatchId: r.batch_header?.payout_batch_id,
          status: "PROCESSING",
        },
      });
    }

    return await prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: "SUCCEEDED",
        paypalBatchId: `DEMO-${idempotencyKey.slice(0, 10)}`,
      },
    });
  } catch (e) {
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: "FAILED" },
    });

    throw e;
  }
}
