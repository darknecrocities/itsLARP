"""FastAPI APIRouter modules for HowToLarped backend services."""
from .ai import router as ai_router
from .profile import router as profile_router
from .jobs import router as jobs_router
from .scoring import router as scoring_router
from .applications import router as applications_router
from .swarm import router as swarm_router
from .analytics import router as analytics_router
from .notion import router as notion_router
from .notifications import router as notifications_router
from .email_monitor import router as email_monitor_router
from .platform_accounts import router as platform_accounts_router

__all__ = [
    "ai_router",
    "profile_router",
    "jobs_router",
    "scoring_router",
    "applications_router",
    "swarm_router",
    "analytics_router",
    "notion_router",
    "notifications_router",
    "email_monitor_router",
    "platform_accounts_router",
]
