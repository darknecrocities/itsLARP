import { NextRequest, NextResponse, after } from "next/server";
import fs from "fs";
import path from "path";
import { downloadInfoFromRequest, shouldCountDownload } from "@/lib/counters/filters";
import { incrementCounterServer } from "@/lib/counters/server";

const GITHUB_RELEASE_BASE =
  "https://github.com/darknecrocities/itsLARP/releases/download/v1.0.0-desktop";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file || file.includes("..") || file.includes("/") || file.includes("\\")) {
    return new NextResponse("Invalid file request", { status: 400 });
  }

  // Live download counter: increment after the response is sent so the
  // redirect / file stream is never delayed by the Firestore round-trip.
  if (shouldCountDownload(downloadInfoFromRequest(req), file)) {
    after(() => incrementCounterServer("downloads"));
  }

  // Check local release directories first (desktop/release and web/public/releases across workspaces)
  const localCandidates = [
    path.resolve(process.cwd(), "public", "releases", file),
    path.resolve(process.cwd(), "apps", "web", "public", "releases", file),
    path.resolve(process.cwd(), "..", "desktop", "release", file),
    path.resolve(process.cwd(), "apps", "desktop", "release", file),
  ];

  for (const p of localCandidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      const stat = fs.statSync(/*turbopackIgnore: true*/ p);
      if (stat.size > 1000) {
        const buffer = fs.readFileSync(/*turbopackIgnore: true*/ p);
        const contentType = file.endsWith(".exe")
          ? "application/vnd.microsoft.portable-executable"
          : file.endsWith(".dmg")
          ? "application/x-apple-diskimage"
          : "application/octet-stream";

        return new NextResponse(buffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `attachment; filename="${file}"`,
            "Content-Length": stat.size.toString(),
          },
        });
      }
    }
  }

  // Otherwise fallback directly to GitHub Release asset CDN
  return NextResponse.redirect(`${GITHUB_RELEASE_BASE}/${file}`, 302);
}
