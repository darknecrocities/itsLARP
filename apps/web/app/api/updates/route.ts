import { NextResponse } from "next/server";
import { LATEST_UPDATE_DATA, CURRENT_RELEASE_VERSION, CURRENT_COMMIT_SHA, MAIN_BRANCH } from "@/lib/updates";

export async function GET() {
  try {
    // Optionally check if a newer GitHub release exists
    let latestTag = LATEST_UPDATE_DATA.releaseTag;
    let publishedAt = LATEST_UPDATE_DATA.releaseDate;

    try {
      const ghRes = await fetch("https://api.github.com/repos/darknecrocities/itsLARP/releases/latest", {
        headers: { "User-Agent": "itsLARP-Updater/1.0" },
        next: { revalidate: 300 },
      });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        if (ghData.tag_name) {
          latestTag = ghData.tag_name;
        }
        if (ghData.published_at) {
          publishedAt = ghData.published_at;
        }
      }
    } catch {
      // Fallback to static manifest if GitHub API is unreachable
    }

    const isUpdateAvailable = latestTag !== LATEST_UPDATE_DATA.releaseTag;

    return NextResponse.json({
      status: isUpdateAvailable ? "update_available" : "up_to_date",
      currentVersion: CURRENT_RELEASE_VERSION,
      latestVersion: latestTag.replace(/^v/, "").replace(/-desktop$/, ""),
      releaseTag: latestTag,
      releaseDate: publishedAt,
      commitSha: CURRENT_COMMIT_SHA,
      branch: MAIN_BRANCH,
      updateAvailable: isUpdateAvailable,
      data: LATEST_UPDATE_DATA,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        error: error.message || "Failed to retrieve update information",
        data: LATEST_UPDATE_DATA,
      },
      { status: 500 }
    );
  }
}
