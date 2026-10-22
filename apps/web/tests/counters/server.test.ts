import { describe, it, expect, vi } from "vitest";
import {
  buildIncrementCommit,
  commitUrl,
  incrementCounterServer,
} from "@/lib/counters/server";

describe("server-side counter commit", () => {
  it("builds the correct Firestore REST commit payload", () => {
    const payload = buildIncrementCommit("itslarp-counter", "downloads");
    expect(payload.writes).toHaveLength(1);

    const write = payload.writes[0];
    expect(write.transform.document).toBe(
      "projects/itslarp-counter/databases/(default)/documents/itslarpcounter/downloads",
    );
    expect(write.transform.fieldTransforms).toEqual([
      { fieldPath: "count", increment: { integerValue: "1" } },
      { fieldPath: "updatedAt", setToServerValue: "REQUEST_TIME" },
    ]);
  });

  it("builds the correct documents:commit URL", () => {
    expect(commitUrl("itslarp-counter")).toBe(
      "https://firestore.googleapis.com/v1/projects/itslarp-counter/databases/(default)/documents:commit",
    );
  });

  it("handles successful remote increment with retry mechanism", async () => {
    const fakeFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });
    const fakeSleep = vi.fn().mockResolvedValue(undefined);

    const origApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const origProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "itslarp-counter";

    try {
      const res = await incrementCounterServer("downloads", {
        fetchImpl: fakeFetch as unknown as typeof fetch,
        sleep: fakeSleep,
      });

      expect(res).toBe(true);
      expect(fakeFetch).toHaveBeenCalledTimes(1);
      expect(fakeFetch).toHaveBeenCalledWith(
        expect.stringContaining("projects/itslarp-counter"),
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-Goog-Api-Key": "test-key",
          }),
        }),
      );
    } finally {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = origApiKey;
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = origProjectId;
    }
  });

  it("retries on 503 service unavailable and succeeds if second try succeeds", async () => {
    const fakeFetch = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503 })
      .mockResolvedValueOnce({ ok: true, status: 200 });
    const fakeSleep = vi.fn().mockResolvedValue(undefined);

    const origApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const origProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "itslarp-counter";

    try {
      const res = await incrementCounterServer("downloads", {
        fetchImpl: fakeFetch as unknown as typeof fetch,
        sleep: fakeSleep,
      });

      expect(res).toBe(true);
      expect(fakeFetch).toHaveBeenCalledTimes(2);
      expect(fakeSleep).toHaveBeenCalledTimes(1);
    } finally {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = origApiKey;
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = origProjectId;
    }
  });

  it("does not throw on network failure, returns false", async () => {
    const fakeFetch = vi.fn().mockRejectedValue(new Error("Network timeout"));
    const fakeSleep = vi.fn().mockResolvedValue(undefined);

    const origApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const origProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY = "test-key";
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = "itslarp-counter";

    try {
      const res = await incrementCounterServer("downloads", {
        fetchImpl: fakeFetch as unknown as typeof fetch,
        sleep: fakeSleep,
      });
      expect(res).toBe(false);
    } finally {
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY = origApiKey;
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = origProjectId;
    }
  });
});
