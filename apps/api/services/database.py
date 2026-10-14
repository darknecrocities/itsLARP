import os
import json
from datetime import datetime
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
    source = Column(String(120), default="Direct")
    url = Column(String(1024), default="")
    domain = Column(String(64), default="tech")
    skills = Column(JSON, default=list)
    years = Column(Integer, default=0)
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)


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
    notion_page_id = Column(String(128), nullable=True, index=True)
    notion_database_id = Column(String(128), nullable=True)
    applied_date = Column(String(64), default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class ProfileRecord(Base):
    __tablename__ = "profiles"
    id = Column(String(64), primary_key=True, default="default")
    name = Column(String(255), default="")
    headline = Column(String(255), default="")
    email = Column(String(255), default="")
    location = Column(String(255), default="")
    years = Column(Integer, default=0)
    education = Column(String(255), default="")
    skills = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    links = Column(JSON, default=dict)
    evidence = Column(JSON, default=list)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


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
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


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
                existing_cols = {col[1] for col in cur.fetchall()}
                new_cols = [
                    ("platform", "VARCHAR(64) DEFAULT 'Direct'"),
                    ("url", "VARCHAR(1024) DEFAULT ''"),
                    ("notion_page_id", "VARCHAR(128)"),
                    ("notion_database_id", "VARCHAR(128)"),
                    ("applied_date", "VARCHAR(64) DEFAULT ''"),
                ]
                for col_name, col_type in new_cols:
                    if col_name not in existing_cols:
                        cur.execute(f"ALTER TABLE applications ADD COLUMN {col_name} {col_type};")
                conn.commit()
                conn.close()
            except Exception:
                pass

