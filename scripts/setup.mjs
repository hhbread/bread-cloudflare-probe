import { randomBytes } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });

function ask(question, defaultValue = "") {
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  return rl.question(`${question}${suffix}: `).then((answer) => answer.trim() || defaultValue);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: options.input ? ["pipe", "pipe", "pipe"] : "pipe",
    input: options.input,
    shell: process.platform === "win32",
    encoding: "utf8"
  });

  const combinedOutput = `${result.stdout || ""}${result.stderr || ""}`;
  if (options.printOutput && combinedOutput.trim()) {
    console.log(combinedOutput.trim());
  }
  if (result.status !== 0) {
    throw new Error(combinedOutput.trim() || `${command} ${args.join(" ")} failed`);
  }
  return combinedOutput;
}

function wrangler(args, options = {}) {
  const command = process.platform === "win32" ? "npx.cmd" : "npx";
  return run(command, ["wrangler", ...args], options);
}

function parseDatabaseId(outputText) {
  const quoted = outputText.match(/database_id\s*=\s*"([^"]+)"/);
  if (quoted) return quoted[1];

  const uuid = outputText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
  return uuid?.[0] || "";
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const bytes = randomBytes(18);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

async function putSecret(name, value) {
  console.log(`Setting secret ${name}...`);
  wrangler(["secret", "put", name], { input: `${value}\n`, printOutput: true });
}

async function main() {
  console.log("\nBread Cloudflare Probe setup\n");

  if (existsSync("wrangler.toml")) {
    const overwrite = await ask("wrangler.toml already exists. Overwrite? yes/no", "no");
    if (!["y", "yes"].includes(overwrite.toLowerCase())) {
      console.log("Setup cancelled.");
      return;
    }
  }

  const workerName = await ask("Worker name", "bread-cloudflare-probe");
  const databaseName = await ask("D1 database name", `${workerName}-db`);
  const createDb = await ask("Create a new D1 database with Wrangler? yes/no", "yes");

  let databaseId = "";
  if (["y", "yes"].includes(createDb.toLowerCase())) {
    console.log("\nCreating D1 database...");
    const createOutput = wrangler(["d1", "create", databaseName], { printOutput: true });
    databaseId = parseDatabaseId(createOutput);
    if (!databaseId) {
      databaseId = await ask("Could not parse database_id. Paste it here");
    }
  } else {
    databaseId = await ask("Existing D1 database_id");
  }

  const cron = await ask("Cron schedule", "*/5 * * * *");
  const username = await ask("Admin username", "admin");
  const generateAdminPassword = await ask("Generate a random admin password? yes/no", "yes");
  let password = "";
  if (["y", "yes"].includes(generateAdminPassword.toLowerCase())) {
    password = generatePassword();
  } else {
    password = await ask("Admin password");
    if (!password) {
      throw new Error("Admin password cannot be empty.");
    }
  }
  const jwtSecret = randomBytes(32).toString("hex");

  const wranglerToml = `name = "${workerName}"
main = "worker.js"
compatibility_date = "2026-06-29"

[[d1_databases]]
binding = "DB"
database_name = "${databaseName}"
database_id = "${databaseId}"

[triggers]
crons = ["${cron}"]
`;

  writeFileSync("wrangler.toml", wranglerToml, "utf8");
  console.log("\nCreated wrangler.toml");

  await putSecret("USERNAME", username);
  await putSecret("PASSWORD", password);
  await putSecret("JWT_SECRET", jwtSecret);

  console.log("\nSetup complete.");
  console.log("\nAdmin login:");
  console.log(`  Username: ${username}`);
  console.log(`  Password: ${password}`);
  console.log("\nSave this password now. Cloudflare secrets cannot be viewed later.");
  console.log("\nNext steps:");
  console.log("  npm run deploy");
  console.log("  npm run init-db");
}

main()
  .catch((error) => {
    console.error(`\nSetup failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => rl.close());
