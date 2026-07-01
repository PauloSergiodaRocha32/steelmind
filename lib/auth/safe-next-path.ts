const FALLBACK_PATH = "/";
const BLOCKED_DESTINATIONS = new Set(["/login", "/signup"]);

export function resolveSafeNextPath(nextPath: string | null | undefined): string {
  if (!nextPath || typeof nextPath !== "string") return FALLBACK_PATH;
  if (!nextPath.startsWith("/") || nextPath.startsWith("//")) return FALLBACK_PATH;

  try {
    const parsed = new URL(nextPath, "http://localhost");
    const safePath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (BLOCKED_DESTINATIONS.has(parsed.pathname)) {
      return FALLBACK_PATH;
    }
    return safePath || FALLBACK_PATH;
  } catch {
    return FALLBACK_PATH;
  }
}

