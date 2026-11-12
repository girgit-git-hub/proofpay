import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { paypalRequest } from "../lib/paypal.js";

export async function webhookRoutes(app: FastifyInstance) {
  app.post("/api/webhooks/paypal", async (req, reply) => {
    const body: any = req.body || {};
    const eventId = body.id;
    if (!eventId)
      return reply
        .code(400)
        .send({ ok: false, error: "Missing PayPal event id" });
    const existing = await prisma.webhookEvent.findUnique({
      where: { eventId },
    });
    if (existing) return reply.code(200).send({ ok: true, deduplicated: true });

    // PayPal's REST webhook verification endpoint is used for real sandbox events.
    // Mock simulator events cannot be cryptographically verified by PayPal, per their docs.
    let verified = false;
    if (env.PAYPAL_WEBHOOK_ID) {
      const h = req.headers;
      try {
        const result: any = await paypalRequest(
          "/v1/notifications/verify-webhook-signature",
          {
            method: "POST",
            body: JSON.stringify({
              auth_algo: h["paypal-auth-algo"],
              cert_url: h["paypal-cert-url"],
              transmission_id: h["paypal-transmission-id"],
              transmission_sig: h["paypal-transmission-sig"],
              transmission_time: h["paypal-transmission-time"],
              webhook_id: env.PAYPAL_WEBHOOK_ID,
              webhook_event: body,
            }),
          },
        );
        verified = result?.verification_status === "SUCCESS";
      } catch {
        verified = false;
      }
    }
    if (env.PAYPAL_WEBHOOK_ID && !verified)
      return reply.code(400).send({
        ok: false,
        error: "PayPal webhook signature verification failed",
      });

    await prisma.webhookEvent.create({
      data: {
        eventId,
        eventType: body.event_type || "UNKNOWN",
        payload: body,
        processed: true,
      },
    });
    const type = body.event_type || "";
    const batchId = body.resource?.payout_batch_id;
    if (batchId) {
      const p = await prisma.payout.findFirst({
        where: { paypalBatchId: batchId },
      });
      if (p) {
        let status: any = p.status;
        if (type.includes("SUCCEEDED")) status = "SUCCEEDED";
        if (type.includes("FAILED") || type.includes("DENIED"))
          status = "FAILED";
        if (type.includes("HELD") || type.includes("BLOCKED")) status = "HELD";
        if (status !== p.status)
          await prisma.payout.update({ where: { id: p.id }, data: { status } });
      }
    }
    return reply.code(200).send({ ok: true, verified });
  });
}
