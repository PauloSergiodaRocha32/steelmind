import { describe, expect, it } from "vitest";
import { resolveSafeNextPath } from "@/lib/auth/safe-next-path";

describe("resolveSafeNextPath", () => {
  it("returns safe in-app path when valid", () => {
    expect(resolveSafeNextPath("/warehouse?tab=stock")).toBe("/warehouse?tab=stock");
  });

  it("falls back for external absolute urls", () => {
    expect(resolveSafeNextPath("https://evil.com")).toBe("/");
  });

  it("falls back for protocol-relative urls", () => {
    expect(resolveSafeNextPath("//evil.com/hijack")).toBe("/");
  });

  it("falls back for auth pages to avoid loops", () => {
    expect(resolveSafeNextPath("/login")).toBe("/");
    expect(resolveSafeNextPath("/signup?invite=1")).toBe("/");
  });

  it("falls back for empty or malformed values", () => {
    expect(resolveSafeNextPath("")).toBe("/");
    expect(resolveSafeNextPath(null)).toBe("/");
    expect(resolveSafeNextPath("http://")).toBe("/");
  });
});

