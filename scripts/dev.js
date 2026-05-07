const { spawn } = require("node:child_process");
const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

function ensureDeps(dir, label) {
  const nodeModules = join(dir, "node_modules");
  if (existsSync(nodeModules)) return;

  const result = spawnSync("npm", ["--prefix", dir, "install"], {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    console.error(`[${label}] npm install failed`);
    process.exit(result.status || 1);
  }
}

function run(label, command, args) {
  const child = spawn(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  child.on("exit", (code, signal) => {
    if (signal) process.kill(process.pid, signal);
    if (typeof code === "number" && code !== 0) process.exitCode = code;
  });

  child.on("error", (err) => {
    console.error(`[${label}] failed to start:`, err);
    process.exitCode = 1;
  });

  return child;
}

ensureDeps("server", "server");
ensureDeps("client", "client");

const server = run("server", "npm", ["--prefix", "server", "run", "dev"]);
const client = run("client", "npm", ["--prefix", "client", "run", "dev"]);

function shutdown(signal) {
  if (server?.pid) server.kill(signal);
  if (client?.pid) client.kill(signal);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
