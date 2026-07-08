#!/usr/bin/env tsx
import { spawn, type ChildProcess } from "node:child_process";
import { createServer } from "node:net";

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://localhost:3000";
const FORCE_LOCAL_AUTH = process.env.DEMO_FORCE_LOCAL_AUTH !== "0";
const SHOULD_USE_ISOLATED_SERVER = !process.env.DEMO_BASE_URL;
const SERVER_READY_TIMEOUT_MS = 90_000;
const SERVER_POLL_INTERVAL_MS = 1_000;

function runCommand(command: string, args: string[], label: string, env = process.env) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", (error) => reject(new Error(`${label} failed to start: ${error.message}`)));
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`${label} failed (code=${code ?? "null"}, signal=${signal ?? "none"})`));
    });
  });
}

async function isServerReachable(baseUrl: URL) {
  try {
    const response = await fetch(baseUrl, { redirect: "manual" });
    return response.status < 500;
  } catch {
    return false;
  }
}

function shouldManageServer(baseUrl: URL) {
  return baseUrl.hostname === "localhost" || baseUrl.hostname === "127.0.0.1";
}

async function findAvailablePort(hostname: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, hostname, () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Could not determine available port")));
        return;
      }
      const { port } = address;
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(port);
      });
    });
  });
}

async function waitForServer(baseUrl: URL, timeoutMs: number) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await isServerReachable(baseUrl)) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, SERVER_POLL_INTERVAL_MS));
  }
  throw new Error(`Timed out waiting for local server at ${baseUrl.toString()}`);
}

async function stopChildProcess(child: ChildProcess) {
  if (child.killed || child.exitCode !== null) {
    return;
  }

  try {
    if (process.platform !== "win32" && child.pid) {
      process.kill(-child.pid, "SIGTERM");
    } else {
      child.kill("SIGTERM");
    }
  } catch {
    return;
  }

  await new Promise((resolve) => setTimeout(resolve, 3_000));
  if (child.exitCode !== null) {
    return;
  }

  try {
    if (process.platform !== "win32" && child.pid) {
      process.kill(-child.pid, "SIGKILL");
    } else {
      child.kill("SIGKILL");
    }
  } catch {
    // Process already exited.
  }
}

async function main() {
  const parsedBaseUrl = new URL(BASE_URL);
  const demoEnv = FORCE_LOCAL_AUTH
    ? {
        ...process.env,
        NEXT_PUBLIC_SUPABASE_URL: "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
      }
    : process.env;

  console.log(`→ Ensuring Playwright Chromium is available (${BASE_URL})...`);
  await runCommand(
    "npx",
    ["playwright", "install", "chromium"],
    "Playwright install",
    demoEnv,
  );

  let walkthroughBaseUrl = parsedBaseUrl;
  let localServerProcess: ChildProcess | undefined;
  const isLocalTarget = shouldManageServer(parsedBaseUrl);

  if (isLocalTarget && SHOULD_USE_ISOLATED_SERVER) {
    const port = await findAvailablePort(parsedBaseUrl.hostname);
    walkthroughBaseUrl = new URL(`${parsedBaseUrl.protocol}//${parsedBaseUrl.hostname}:${port}`);
  }

  if (
    isLocalTarget &&
    (SHOULD_USE_ISOLATED_SERVER || !(await isServerReachable(walkthroughBaseUrl)))
  ) {
    const port = walkthroughBaseUrl.port || "3000";
    console.log(`→ Starting local Next.js dev server on port ${port}...`);
    if (FORCE_LOCAL_AUTH) {
      console.log(
        "→ Forcing local auth mode for demo reproducibility (set DEMO_FORCE_LOCAL_AUTH=0 to disable)",
      );
    }

    const useShell = process.platform === "win32";
    localServerProcess = spawn(
      "npm",
      ["run", "dev", "--", "--hostname", walkthroughBaseUrl.hostname, "--port", port],
      {
        env: demoEnv,
        stdio: "inherit",
        shell: useShell,
        detached: !useShell,
      },
    );
    await waitForServer(walkthroughBaseUrl, SERVER_READY_TIMEOUT_MS);
    console.log(`✓ Local server is ready at ${walkthroughBaseUrl.toString()}`);
  }

  const walkthroughEnv = {
    ...demoEnv,
    DEMO_BASE_URL: walkthroughBaseUrl.toString(),
  };

  try {
    await runCommand("npm", ["run", "demo:browser:run"], "Browser walkthrough", walkthroughEnv);
  } finally {
    if (localServerProcess) {
      await stopChildProcess(localServerProcess);
    }
  }
}

main().catch((error) => {
  console.error(`\n❌ demo:browser failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
