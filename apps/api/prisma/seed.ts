import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const p = new PrismaClient();

async function main() {
  const funder = await p.user.upsert({
    where: {
      email: "funder@proofpay.com",
    },
    update: {},
    create: {
      name: "ProofPay Funder",
      email: "funder@proofpay.com",
      role: "FUNDER",
    },
  });

  const worker = await p.user.upsert({
    where: {
      email: "worker@proofpay.com",
    },
    update: {},
    create: {
      name: "ProofPay Worker",
      email: "worker@proofpay.com",
      role: "WORKER",
    },
  });

  console.log("Seed completed.");
  console.log("Funder:", funder.email);
  console.log("Worker:", worker.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await p.$disconnect();
  });
