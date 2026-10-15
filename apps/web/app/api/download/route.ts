import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GITHUB_RELEASE_BASE =
  "https://github.com/darknecrocities/itsLARP/releases/download/v1.0.0-desktop";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const file = searchParams.get("file");

  if (!file || file.includes("..") || file.includes("/")) {
    return new NextResponse("Invalid file request", { status: 400 });
  }

  // Check local release directories first (desktop/release and web/public/releases)
  const localCandidates = [
    path.resolve(process.cwd(), "public", "releases", file),
    path.resolve(process.cwd(), "..", "desktop", "release", file),
    path.resolve(process.cwd(), "apps", "desktop", "release", file),
  ];

  for (const p of localCandidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ p)) {
      const stat = fs.statSync(/*turbopackIgnore: true*/ p);
      if (stat.size > 1000) {
        const buffer = fs.readFileSync(/*turbopackIgnore: true*/ p);
        return new NextResponse(buffer, {
          headers: {
            "Content-Type": "application/octet-stream",
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
