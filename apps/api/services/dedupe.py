import hashlib, re


def _norm(s: str) -> str:
    return " ".join(re.sub(r"[^a-z0-9 ]", "", (s or "").lower()).split())


def fingerprint(company: str, title: str, location: str) -> str:
    return hashlib.sha256("|".join(map(_norm, (company, title, location))).encode()).hexdigest()[:32]


def similarity(a: str, b: str) -> float:
    A, B = set(_norm(a).split()), set(_norm(b).split())
    return len(A & B) / len(A | B) if A | B else 0.0


def dedupe(jobs: list[dict], threshold: float = 0.85) -> list[dict]:
    seen: dict[str, dict] = {}
    for j in jobs:
        fp = fingerprint(j["company"], j["title"], j.get("location", ""))
        if fp in seen:
            seen[fp].setdefault("sources", []).append(j.get("source"))
            continue
        dup = next((s for s in seen.values()
                    if _norm(s["company"]) == _norm(j["company"])
                    and similarity(s.get("description", ""), j.get("description", "")) >= threshold), None)
        if dup:
            dup.setdefault("sources", []).append(j.get("source"))
        else:
            j["sources"] = [j.get("source")]
            seen[fp] = j
    return list(seen.values())
