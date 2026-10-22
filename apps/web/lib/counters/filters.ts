/**
 * Pure, dependency-free request filters shared by the browser visit counter and
 * the server-side download counter. Kept side-effect free for unit testing.
 */

/** Crawlers, link unfurlers, uptime monitors, and scripted HTTP clients. */
const BOT_USER_AGENT =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|embedly|quora link|whatsapp|telegram|discord|slack|headless|lighthouse|pingdom|uptime|monitor|curl\/|wget|python-requests|httpclient|go-http-client|node-fetch|axios|okhttp|java\//i;

/** Only real desktop installers / portable archives are counted. */
export const RELEASE_FILE_PATTERN = /^itsLARP-[A-Za-z0-9._-]+\.(dmg|zip|exe)$/;

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || userAgent.trim().length === 0) return true;
  return BOT_USER_AGENT.test(userAgent);
}

export interface DownloadRequestInfo {
  method: string;
  userAgent: string | null;
  purpose: string | null;
  secPurpose: string | null;
  nextRouterPrefetch: string | null;
  range: string | null;
}

export function downloadInfoFromRequest(req: Request): DownloadRequestInfo {
  const h = req.headers;
  return {
    method: req.method.toUpperCase(),
    userAgent: h.get("user-agent"),
    purpose: h.get("purpose"),
    secPurpose: h.get("sec-purpose"),
    nextRouterPrefetch: h.get("next-router-prefetch"),
    range: h.get("range"),
  };
}

/**
 * A download is counted only for a real GET of an installer by a non-bot client.
 * HEAD probes, prefetch/prerender hints, and resumed partial ranges are ignored
 * so a single download is never counted more than once.
 */
export function shouldCountDownload(info: DownloadRequestInfo, file: string): boolean {
  if (info.method !== "GET") return false;
  if (!RELEASE_FILE_PATTERN.test(file)) return false;
  if (info.nextRouterPrefetch) return false;
  if ([info.purpose, info.secPurpose].some((v) => v && /prefetch|prerender/i.test(v))) return false;
  if (info.range && !/^bytes=0-/i.test(info.range.trim())) return false;
  if (isBotUserAgent(info.userAgent)) return false;
  return true;
}
