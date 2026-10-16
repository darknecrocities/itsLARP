from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services import jobs, tailoring

router = APIRouter(prefix="/jobs", tags=["jobs"])


class SearchIn(BaseModel):
    query: str = ""
    remote: bool = False
    profile: dict = {}


@router.get("")
async def jobs_list(q: str = "Engineer", limit: int = 50):
    found, _ = await jobs.discover(q.strip()[:80])
    return found[:limit]


@router.post("/search")
async def jobs_search(b: SearchIn):
    found, errs = await jobs.discover(b.query.strip()[:80])
    if b.remote:
        found = [j for j in found if j.get("remote", True)]
    if b.profile.get("skills"):
        for j in found:
            j["match"] = tailoring.match(b.profile, j)
        found.sort(key=lambda j: -j.get("match", {}).get("score", 0))
    return {
        "jobs": [{k: v for k, v in j.items() if k != "description"} | {"description": j.get("description", "")[:800]} for j in found[:100]],
        "errors": errs
    }


class ImportJobIn(BaseModel):
    url: str = ""
    title: str = ""
    company: str = ""
    description: str = ""
    profile: dict = {}


@router.post("/import-url")
async def jobs_import_url(b: ImportJobIn):
    j = await jobs.import_custom_job(url=b.url, title=b.title, company=b.company, raw_text=b.description)
    if b.profile.get("skills"):
        j["match"] = tailoring.match(b.profile, j)
    return j


@router.get("/{job_id}")
def job_get(job_id: str):
    j = jobs.get_job(job_id)
    if not j:
        raise HTTPException(404, "Job not found. Search again to refresh listings.")
    return j


class StreamTargetJobsIn(BaseModel):
    target_count: int = 100
    queries: list[str] | None = None
    target_companies: list[str] | None = None
    work_types: list[str] | None = None
    min_years: int = 0


@router.post("/stream-target-jobs")
def stream_target_jobs_endpoint(b: StreamTargetJobsIn):
    return jobs.stream_target_jobs(
        target_count=b.target_count,
        queries=b.queries,
        target_companies=b.target_companies,
        work_types=b.work_types,
        min_years=b.min_years
    )
