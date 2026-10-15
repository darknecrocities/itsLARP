from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from datetime import datetime

from services.database import init_db
from routers import (
    ai_router,
    profile_router,
    jobs_router,
    scoring_router,
    applications_router,
    swarm_router,
    analytics_router,
    notion_router,
    notifications_router,
)

init_db()

app = FastAPI(
    title="HowToLarped API - AI Job-Hunting Workforce",
    description="Backend API and local Ollama gateway for the itsLARP desktop and web applications."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root_index(request: Request):
    accept = request.headers.get("accept", "")
    if "text/html" in accept:
        return HTMLResponse(
            """<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>itsLARP Backend API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #ffffff; color: #09090b; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
    .card { background: #fff; border: 1px solid #e4e4e7; border-radius: 6px; padding: 32px; max-width: 440px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    h1 { font-size: 20px; margin: 0 0 8px 0; font-weight: 700; letter-spacing: -0.02em; }
    p { font-size: 13px; color: #71717a; margin: 0 0 20px 0; line-height: 1.6; }
    .badge { display: inline-block; font-size: 11px; font-family: monospace; padding: 2px 8px; background: #f4f4f5; border: 1px solid #e4e4e7; border-radius: 4px; margin-bottom: 12px; }
    .btn { display: block; text-align: center; background: #000; color: #fff; text-decoration: none; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; margin-bottom: 10px; transition: background 0.15s; }
    .btn:hover { background: #27272a; }
    .btn-sec { display: block; text-align: center; background: #fff; color: #09090b; border: 1px solid #e4e4e7; text-decoration: none; padding: 10px 16px; border-radius: 4px; font-weight: 600; font-size: 13px; transition: background 0.15s; }
    .btn-sec:hover { background: #f4f4f5; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">BACKEND API · PORT 8000</div>
    <h1>itsLARP API Online</h1>
    <p>You have navigated to the FastAPI backend service on port 8000. The application user interface is running on <strong>port 3000</strong>.</p>
    <a href="http://localhost:3000/dashboard" class="btn">Open App Dashboard (localhost:3000/dashboard) →</a>
    <a href="/docs" class="btn-sec">View Swagger API Docs (/docs)</a>
  </div>
</body>
</html>"""
        )
    return {
        "service": "itsLARP API",
        "status": "online",
        "dashboard": "http://localhost:3000/dashboard",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/health")
def health():
    return {"ok": True, "service": "itsLARP API", "time": datetime.now().isoformat()}

# Include all modular routers
app.include_router(ai_router)
app.include_router(profile_router)
app.include_router(jobs_router)
app.include_router(scoring_router)
app.include_router(applications_router)
app.include_router(swarm_router)
app.include_router(analytics_router)
app.include_router(notion_router)
app.include_router(notifications_router)
