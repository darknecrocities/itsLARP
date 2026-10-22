import { describe, it, expect } from "vitest";
import {
  isBotUserAgent,
  shouldCountDownload,
  RELEASE_FILE_PATTERN,
  type DownloadRequestInfo,
} from "@/lib/counters/filters";

describe("filters and bot detection", () => {
  it("detects bot and crawler user agents", () => {
    expect(isBotUserAgent("Googlebot/2.1 (+http://www.google.com/bot.html)")).toBe(true);
    expect(isBotUserAgent("curl/8.1.2")).toBe(true);
    expect(isBotUserAgent("python-requests/2.31.0")).toBe(true);
    expect(isBotUserAgent("Slackbot-LinkExpanding 1.0")).toBe(true);
    expect(isBotUserAgent("Mozilla/5.0 (compatible; Discordbot/2.0)")).toBe(true);
    expect(isBotUserAgent("")).toBe(true);
    expect(isBotUserAgent(null)).toBe(true);
  });

  it("passes standard desktop and mobile browser user agents", () => {
    expect(
      isBotUserAgent(
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      ),
    ).toBe(false);
    expect(
      isBotUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
      ),
    ).toBe(false);
  });

  it("validates release file names strictly", () => {
    expect(RELEASE_FILE_PATTERN.test("itsLARP-mac-arm64.dmg")).toBe(true);
    expect(RELEASE_FILE_PATTERN.test("itsLARP-win-x64-setup.exe")).toBe(true);
    expect(RELEASE_FILE_PATTERN.test("itsLARP-win-x64-portable.zip")).toBe(true);
    expect(RELEASE_FILE_PATTERN.test("something-else.exe")).toBe(false);
    expect(RELEASE_FILE_PATTERN.test("itsLARP-mac.sh")).toBe(false);
    expect(RELEASE_FILE_PATTERN.test("../itsLARP-mac-arm64.dmg")).toBe(false);
  });

  it("decides download counting with robust heuristics", () => {
    const validInfo: DownloadRequestInfo = {
      method: "GET",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      purpose: null,
      secPurpose: null,
      nextRouterPrefetch: null,
      range: null,
    };

    expect(shouldCountDownload(validInfo, "itsLARP-mac-arm64.dmg")).toBe(true);

    // Reject non-GET
    expect(shouldCountDownload({ ...validInfo, method: "HEAD" }, "itsLARP-mac-arm64.dmg")).toBe(false);

    // Reject bot UA
    expect(shouldCountDownload({ ...validInfo, userAgent: "curl/8.1.2" }, "itsLARP-mac-arm64.dmg")).toBe(false);

    // Reject prefetch
    expect(shouldCountDownload({ ...validInfo, purpose: "prefetch" }, "itsLARP-mac-arm64.dmg")).toBe(false);
    expect(shouldCountDownload({ ...validInfo, nextRouterPrefetch: "1" }, "itsLARP-mac-arm64.dmg")).toBe(false);

    // Reject resumed range (non-zero start)
    expect(shouldCountDownload({ ...validInfo, range: "bytes=5000-10000" }, "itsLARP-mac-arm64.dmg")).toBe(false);
    expect(shouldCountDownload({ ...validInfo, range: "bytes=0-" }, "itsLARP-mac-arm64.dmg")).toBe(true);

    // Reject invalid file name
    expect(shouldCountDownload(validInfo, "random.dmg")).toBe(false);
  });
});
