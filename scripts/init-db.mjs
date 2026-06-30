import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

function normalizeWorkerUrl(value) {
  const trimmed = value.trim().replace(/\/+$/, "");
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

async function main() {
  const answer = await rl.question("Worker URL, for example https://bread-cloudflare-probe.your.workers.dev: ");
  const workerUrl = normalizeWorkerUrl(answer);
  if (!workerUrl) {
    throw new Error("Worker URL cannot be empty.");
  }

  const initUrl = `${workerUrl}/api/init-db`;
  console.log(`Initializing database: ${initUrl}`);

  const response = await fetch(initUrl, { method: "GET" });
  const text = await response.text();
  console.log(text);

  if (!response.ok) {
    throw new Error(`Init failed with HTTP ${response.status}`);
  }
}

main()
  .catch((error) => {
    console.error(`\nInit failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
