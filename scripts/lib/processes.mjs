/**
 * Child processes for the scripts (a `next start` server, a headless
 * Chromium), started so they always stop with the script.
 *
 * Why this exists. `spawn("pnpm", ["start"])` starts a chain: pnpm, then
 * `sh -c next start`, then node, then `next-server`. Killing the spawned
 * process kills pnpm only; the shell and the server are re-parented and keep
 * running on their random port. One leaked server per run is how a day of
 * PDF runs filled the machine's memory.
 *
 * So each child is started `detached`, which makes it the leader of a new
 * process group, and stopping it signals the whole group (`kill(-pgid)`):
 * every process in the chain goes at once. Stopping happens on every way
 * out of the script: normal exit, an uncaught error, Ctrl-C, SIGTERM, SIGHUP.
 *
 * A script killed with SIGKILL (a timeout, a crash, the laptop shutting
 * down) runs none of its handlers. For that, every group started is written
 * to a ledger with the script that owns it, and the next script to start
 * sweeps it: a recorded group whose owner has died, and which is still
 * running from this repo, is stopped. A group whose owner is still running
 * (two scripts at once) is left alone.
 */
import { spawn } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, readlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const LEDGER = path.join(ROOT, "node_modules", ".cache", "script-processes.json");
const started = new Set();

const readLedger = () => {
  try {
    return JSON.parse(readFileSync(LEDGER, "utf8"));
  } catch {
    return [];
  }
};

const writeLedger = (entries) => {
  mkdirSync(path.dirname(LEDGER), { recursive: true });
  writeFileSync(LEDGER, JSON.stringify(entries));
};

const killGroup = (pgid) => {
  try {
    process.kill(-pgid, "SIGKILL");
  } catch {
    /* Already gone. */
  }
};

const alive = (pid) => {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
};

/* A recorded group is stopped only if some process in it is still running
   from this repo. Not just its leader: pnpm can exit while the server it
   started lives on. A group id the system has since reused for something
   elsewhere is left alone. */
const stillOurs = ({ pgid }) => {
  for (const name of readdirSync("/proc")) {
    if (!/^\d+$/.test(name)) continue;
    try {
      const stat = readFileSync(`/proc/${name}/stat`, "utf8");
      const group = Number(stat.slice(stat.lastIndexOf(")") + 2).split(" ")[2]);
      if (group === pgid && readlinkSync(`/proc/${name}/cwd`) === ROOT) return true;
    } catch {
      /* Gone, or not ours to read. */
    }
  }
  return false;
};

/** Stops whatever an earlier, hard-killed run left behind. */
export function sweepStale() {
  const kept = [];
  for (const entry of readLedger()) {
    if (alive(entry.owner)) kept.push(entry);
    else if (stillOurs(entry)) killGroup(entry.pgid);
  }
  writeLedger(kept);
}

/** Starts a child in its own process group, recorded until it stops. */
export function startGroup(command, args, options = {}) {
  const child = spawn(command, args, { stdio: "ignore", ...options, detached: true });
  started.add(child.pid);
  writeLedger([...readLedger(), { pgid: child.pid, command, owner: process.pid }]);
  return child;
}

/** Stops one group this script started (a browser closed mid-run). */
export function stopGroup(child) {
  killGroup(child.pid);
  started.delete(child.pid);
  writeLedger(readLedger().filter((entry) => entry.pgid !== child.pid));
}

/** Stops every group this script started. Safe to call more than once. */
export function stopAll() {
  if (!started.size) return;
  const mine = [...started];
  for (const pgid of mine) killGroup(pgid);
  started.clear();
  writeLedger(readLedger().filter((entry) => !mine.includes(entry.pgid)));
}

let installed = false;
/** Stops the groups on every way out of the script. Call once, early. */
export function stopOnExit() {
  if (installed) return;
  installed = true;
  sweepStale();
  process.on("exit", stopAll);
  for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
    process.on(signal, () => {
      stopAll();
      process.exit(1);
    });
  }
  process.on("uncaughtException", (error) => {
    console.error(error);
    stopAll();
    process.exit(1);
  });
  process.on("unhandledRejection", (error) => {
    console.error(error);
    stopAll();
    process.exit(1);
  });
}
