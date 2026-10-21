import os
import json
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)
from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, Text, DateTime, JSON
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./howtolarped.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class JobRecord(Base):
    __tablename__ = "jobs"
    id = Column(String(64), primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    location = Column(String(255), default="Remote")
    remote = Column(Boolean, default=True)
    salary = Column(String(120), default="Not listed")
    employment_type = Column(String(64), default="Full-time")
    source = Column(String(120), default="Direct")
    url = Column(String(1024), default="")
    domain = Column(String(64), default="tech")
    skills = Column(JSON, default=list)
    years = Column(Integer, default=0)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)


class ApplicationRecord(Base):
    __tablename__ = "applications"
    id = Column(String(64), primary_key=True, index=True)
    job_id = Column(String(64), index=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    match = Column(Integer, default=0)
    status = Column(String(64), default="SAVED")  # SAVED, PREPARING, READY, APPLIED, INTERVIEW, OFFER, REJECTED
    resume = Column(Text, default="")
    cover = Column(Text, default="")
    answers = Column(JSON, default=dict)
    verified = Column(Boolean, default=True)
    events = Column(JSON, default=list)
    platform = Column(String(64), default="Direct")
    url = Column(String(1024), default="")
    screenshot_url = Column(String(1024), default="")
    notion_page_id = Column(String(128), nullable=True, index=True)
    notion_database_id = Column(String(128), nullable=True)
    applied_date = Column(String(64), default="")
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class ProfileRecord(Base):
    __tablename__ = "profiles"
    id = Column(String(64), primary_key=True, default="default")
    name = Column(String(255), default="")
    headline = Column(String(255), default="")
    email = Column(String(255), default="")
    location = Column(String(255), default="")
    years = Column(Integer, default=0)
    education = Column(String(255), default="")
    phone = Column(String(64), default="")
    summary = Column(Text, default="")
    target_roles = Column(JSON, default=lambda: ["all"])
    target_companies = Column(JSON, default=lambda: ["all"])
    work_types = Column(JSON, default=lambda: ["fulltime", "remote"])
    skills = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    licenses = Column(JSON, default=list)
    github_metrics = Column(JSON, default=dict)
    links = Column(JSON, default=dict)
    evidence = Column(JSON, default=list)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class AgentQuestionRecord(Base):
    __tablename__ = "agent_questions"
    id = Column(String(64), primary_key=True)
    run_id = Column(String(64), default="")
    bot_id = Column(String(64), default="")
    job_id = Column(String(64), default="")
    company = Column(String(255), default="")
    role = Column(String(255), default="")
    question = Column(Text, default="")
    context = Column(Text, default="")
    status = Column(String(32), default="pending")  # pending, answered, dismissed
    answer = Column(Text, default="")
    created_at = Column(DateTime, default=utc_now)
    answered_at = Column(DateTime, nullable=True)


class IntegrationRecord(Base):
    __tablename__ = "integrations"
    id = Column(String(64), primary_key=True)  # e.g. "notion"
    token = Column(String(512), default="")
    database_id = Column(String(128), default="")
    database_name = Column(String(255), default="")
    database_url = Column(String(1024), default="")
    workspace = Column(String(255), default="")
    connected = Column(Boolean, default=False)
    last_synced_at = Column(DateTime, nullable=True)
    synced_count = Column(Integer, default=0)
    settings = Column(JSON, default=dict)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


class PlatformCredentialRecord(Base):
    __tablename__ = "platform_credentials"
    id = Column(String(64), primary_key=True)  # "linkedin", "indeed", "glassdoor"
    platform = Column(String(64), nullable=False)
    username = Column(String(255), default="")
    auth_token = Column(String(1024), default="")
    connected = Column(Boolean, default=False)
    max_daily_applications = Column(Integer, default=15)
    applications_today = Column(Integer, default=0)
    min_delay_seconds = Column(Integer, default=60)
    max_delay_seconds = Column(Integer, default=180)
    allowed_actions = Column(JSON, default=lambda: ["easy_apply", "save_job"])
    active_schedule = Column(JSON, default=lambda: {"start": "09:00", "end": "17:00", "timezone": "local"})
    last_applied_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)


def init_db():
    Base.metadata.create_all(bind=engine)
    # Safe SQLite column migration for existing tables
    if DATABASE_URL.startswith("sqlite"):
        import sqlite3
        db_file = DATABASE_URL.replace("sqlite:///", "")
        if os.path.exists(db_file):
            try:
                conn = sqlite3.connect(db_file)
                cur = conn.cursor()
                cur.execute("PRAGMA table_info(applications);")
                app_cols = {col[1] for col in cur.fetchall()}
                new_app_cols = [
                    ("platform", "VARCHAR(64) DEFAULT 'Direct'"),
                    ("url", "VARCHAR(1024) DEFAULT ''"),
                    ("notion_page_id", "VARCHAR(128)"),
                    ("notion_database_id", "VARCHAR(128)"),
                    ("applied_date", "VARCHAR(64) DEFAULT ''"),
                ]
                for col_name, col_type in new_app_cols:
                    if col_name not in app_cols:
                        cur.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_type};")

                cur.execute("PRAGMA table_info(jobs);")
                job_cols = {col[1] for col in cur.fetchall()}
                if "employment_type" not in job_cols:
                    cur.execute("ALTER TABLE jobs ADD COLUMN employment_type VARCHAR(64) DEFAULT 'Full-time';")

                cur.execute("PRAGMA table_info(profiles);")
                prof_cols = {col[1] for col in cur.fetchall()}
                new_prof_cols = [
                    ("phone", "VARCHAR(64) DEFAULT ''"),
                    ("summary", "TEXT DEFAULT ''"),
                    ("target_roles", "JSON DEFAULT '[\"all\"]'"),
                    ("target_companies", "JSON DEFAULT '[\"all\"]'"),
                    ("work_types", "JSON DEFAULT '[\"fulltime\", \"remote\"]'"),
                ]
                for col_name, col_type in new_prof_cols:
                    if col_name not in prof_cols:
                        cur.execute(f"ALTER TABLE profiles ADD COLUMN {col_name} {col_type};")

                conn.commit()
                conn.close()
            except Exception:
                pass

