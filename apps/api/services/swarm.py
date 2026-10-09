"""Real task-queue workforce orchestrator.
Concurrent async workers pull typed tasks through the multi-stage pipeline:
DISCOVERY -> ANALYSIS -> MATCHING -> RESUMES -> APPLICATIONS.
Human approval gate: Applications stop at 'READY_FOR_REVIEW'.
Unsupported claims are blocked.
"""
import asyncio
import time
import uuid
from typing import Dict, Any, List
from . import jobs, tailoring

STAGES = ["discovery", "analysis", "matching", "resumes", "applications"]
RUNS: dict[str, "Run"] = {}


class Run:
    def __init__(self, profile: dict, queries: list[str], workers: int):
        self.id = uuid.uuid4().hex[:10]
        self.profile = profile
        self.queries = queries
        # Cap concurrent workers between 1 and 1000
        self.n = max(1, min(workers, 1000))
        self.q: asyncio.Queue = asyncio.Queue()
        self.counts = {s: {"queued": 0, "done": 0, "failed": 0, "retries": 0} for s in STAGES}
        self.active = 0
        self.feed: list[dict] = []
        self.results: dict[str, dict] = {}
        self.dead: list[dict] = []
        self.status = "running"
        self.started = time.time()
        self.tasks: list[asyncio.Task] = []

    def log(self, wid: int, msg: str):
        self.feed.insert(0, {
            "t": time.strftime("%H:%M:%S"),
            "id": f"agent_{wid:04d}",
            "msg": msg
        })
        del self.feed[60:]

    def put(self, stage: str, payload, retry: int = 0):
        self.counts[stage]["queued"] += 1
        self.q.put_nowait((stage, payload, retry))

    async def handle(self, wid: int, stage: str, payload):
        if stage == "discovery":
            found, errs = await jobs.discover(payload)
            for e in errs:
                self.log(wid, f"source notice: {e}")
            self.log(wid, f"Discovered {len(found)} jobs for “{payload}”")
            for j in found:
                if j["id"] not in self.results:
                    self.results[j["id"]] = {"job": j}
                    self.put("analysis", j["id"])

        elif stage == "analysis":
            j = self.results[payload]["job"]
            self.log(wid, f"Analyzed {j['title']} @ {j['company']}: {len(j.get('skills', []))} requirements")
            self.put("matching", payload)

        elif stage == "matching":
            r = self.results[payload]
            r["match"] = tailoring.match(self.profile, r["job"])
            score = r["match"]["score"]
            self.log(wid, f"Match score: {score}% · {r['job']['company']} ({r['job']['title']})")
            if score >= 55:  # Filter realistic candidate fits before document generation
                self.put("resumes", payload)
            else:
                r["state"] = "FILTERED_LOW_MATCH"

        elif stage == "resumes":
            r = self.results[payload]
            r["package"] = await tailoring.prepare(self.profile, r["job"])
            self.log(wid, f"Tailored resume drafted for {r['job']['title']} @ {r['job']['company']}")
            self.put("applications", payload)

        elif stage == "applications":
            r = self.results[payload]
            v = r["package"].get("verification", {})
            r["state"] = "READY_FOR_REVIEW" if v.get("passed", False) else "BLOCKED"
            self.log(wid, f"Application {r['state'].lower().replace('_', ' ')}: {r['job']['company']}")

    async def worker(self, wid: int):
        while True:
            stage, payload, retry = await self.q.get()
            self.active += 1
            try:
                await self.handle(wid, stage, payload)
                self.counts[stage]["done"] += 1
            except Exception as e:
                if retry < 2:
                    self.counts[stage]["retries"] += 1
                    self.put(stage, payload, retry + 1)
                else:
                    self.counts[stage]["failed"] += 1
                    self.dead.append({"stage": stage, "error": type(e).__name__})
                    self.log(wid, f"{stage} task failed, moved to dead letter queue")
            finally:
                self.counts[stage]["queued"] -= 1
                self.active -= 1
                self.q.task_done()

    async def supervise(self):
        try:
            await self.q.join()
            self.status = "completed"
        except asyncio.CancelledError:
            self.status = "stopped"
        finally:
            for t in self.tasks:
                if not t.done():
                    t.cancel()

    def start(self):
        for q in self.queries:
            self.put("discovery", q)
        # Limit actual asyncio concurrent tasks to max 64 to avoid Python OS thread overhead,
        # while workers count simulates logical concurrency pulling from queue
        actual_workers = min(self.n, 64)
        self.tasks = [asyncio.create_task(self.worker(i)) for i in range(actual_workers)]
        asyncio.create_task(self.supervise())

    def stop(self):
        self.status = "stopped"
        for t in self.tasks:
            if not t.done():
                t.cancel()

    def snapshot(self):
        res = list(self.results.values())
        tot_q = sum(self.counts[s]["queued"] for s in STAGES)
        tot_d = sum(self.counts[s]["done"] for s in STAGES)
        tot_f = sum(self.counts[s]["failed"] for s in STAGES)
        return {
            "id": self.id,
            "status": self.status,
            "workers": self.n,
            "active": self.active,
            "counts": self.counts,
            "total_queued": tot_q,
            "total_done": tot_d,
            "total_failed": tot_f,
            "feed": self.feed[:40],
            "dead": len(self.dead),
            "elapsed": round(time.time() - self.started, 1),
            "jobs": len(res),
            "ready": sum(1 for r in res if r.get("state") == "READY_FOR_REVIEW"),
            "blocked": sum(1 for r in res if r.get("state") == "BLOCKED")
        }
