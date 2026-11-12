import { env } from "../config/env.js";
import fs from "node:fs/promises";
import OpenAI from "openai";

type Check = { key: string; score: number; reason: string };
type Result = {
  decision: "VERIFIED" | "REVIEW" | "REJECTED";
  score: number;
  checks: Check[];
  explanation: string;
  model: string;
};

function normalizeResult(raw: any, model: string): Result {
  const allowed = new Set(["VERIFIED", "REVIEW", "REJECTED"]);
  const checks: Array<Check> = Array.isArray(raw?.checks)
    ? raw.checks.map((c: any) => ({
        key: String(c?.key || "unknown"),
        score: Math.max(0, Math.min(100, Number(c?.score ?? 0))),
        reason: String(c?.reason || ""),
      }))
    : [];
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Number(
          raw?.score ??
            (checks.length
              ? checks.reduce((a, c) => a + c.score, 0) / checks.length
              : 0),
        ),
      ),
    ),
  );
  const decision = allowed.has(raw?.decision)
    ? raw.decision
    : score >= 80
      ? "VERIFIED"
      : score >= 55
        ? "REVIEW"
        : "REJECTED";
  return {
    decision,
    score,
    checks,
    explanation: String(raw?.explanation || ""),
    model,
  };
}

async function geminiVerify(
  task: any,
  evidence: any,
  product: any,
): Promise<Result> {
  if (!env.GOOGLE_API_KEY)
    throw new Error(
      "GOOGLE_API_KEY is missing. Create a Gemini API key and put it in .env.",
    );
  const b64 = (await fs.readFile(evidence.filePath)).toString("base64");
  const prompt = `You are ProofPay's evidence-verification engine. Analyze the submitted image against the task and reference product. Return JSON ONLY with this schema: {"decision":"VERIFIED|REVIEW|REJECTED","score":0,"checks":[{"key":"task_match|completion|image_originality|metadata_consistency|location_consistency|timestamp_consistency|product_match|price_fairness|fraud_risk","score":0,"reason":"..."}],"explanation":"..."}. Be conservative. Do not invent GPS/EXIF facts: metadata supplied by the application is authoritative for metadata checks. Task=${JSON.stringify(task)} EvidenceMetadata=${JSON.stringify(evidence)} ProductReference=${JSON.stringify(product)}`;
  const r = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(env.GOOGLE_MODEL)}:generateContent`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": env.GOOGLE_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: evidence.mimeType, data: b64 } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0,
          responseMimeType: "application/json",
        },
      }),
    },
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`Gemini ${r.status}: ${text}`);
  const j: any = JSON.parse(text);
  const out = j?.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.text,
  )?.text;
  if (!out) throw new Error("Gemini returned no text content");
  return normalizeResult(JSON.parse(out), env.GOOGLE_MODEL);
}

async function openaiVerify(
  task: any,
  evidence: any,
  product: any,
): Promise<Result> {
  if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is missing.");
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const b64 = (await fs.readFile(evidence.filePath)).toString("base64");
  const prompt = `You are ProofPay's evidence verifier. Return JSON only with keys decision (VERIFIED|REVIEW|REJECTED), score (0-100), checks (array of {key,score,reason}), explanation. Task: ${JSON.stringify(task)}. Evidence metadata: ${JSON.stringify(evidence)}. Product reference: ${JSON.stringify(product)}. Be conservative about identity, location, timestamps, reuse and price.`;
  const r = await client.chat.completions.create({
    model: env.OPENAI_MODEL,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: { url: `data:${evidence.mimeType};base64,${b64}` },
          },
        ],
      },
    ],
  });
  return normalizeResult(
    JSON.parse(r.choices[0]?.message?.content || "{}"),
    env.OPENAI_MODEL,
  );
}

export async function verifyEvidence(
  task: any,
  evidence: any,
  product: any,
): Promise<Result> {
  if (env.AI_PROVIDER === "gemini")
    return geminiVerify(task, evidence, product);
  if (env.AI_PROVIDER === "openai")
    return openaiVerify(task, evidence, product);
  throw new Error(
    "AI_PROVIDER=mock is disabled in this build. Configure gemini or openai with a real API key.",
  );
}
