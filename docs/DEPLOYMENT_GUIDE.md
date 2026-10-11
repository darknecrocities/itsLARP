# Production Deployment & Operations Guide

## Overview

**itsLARP / HowToLarped** is engineered as a decoupled monorepo:
- **Frontend**: Next.js 16 (React 19, TypeScript, Tailwind CSS)
- **Backend API**: FastAPI (Python 3.13, Uvicorn, SQLAlchemy)
- **Local AI**: Ollama Daemon (Port 11434)
- **Database**: SQLite (default local) or PostgreSQL (production)

---

## 1. System Requirements

- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Python**: v3.12 or v3.13
- **Memory**: Minimum 8 GB RAM (16 GB recommended when running 7B models locally)
- **OS**: macOS, Linux (Ubuntu 22.04+), or Windows with WSL2

---

## 2. Environment Variables

Create `.env` in the root or set in production:

```bash
# Backend AI Configuration
OLLAMA_HOST=http://localhost:11434
AI_PROVIDER=ollama
AI_MODEL=qwen2.5-coder:7b

# Database (Leave unset for local SQLite howtolarped.db)
DATABASE_URL=postgresql://user:password@localhost:5432/howtolarped

# Cloud Fallback Keys (Optional)
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 3. Docker Compose Deployment

The repository includes a ready-to-run [`docker-compose.yml`](file:///Users/arronkianparejas/itsLarper/docker-compose.yml):

```yaml
version: "3.8"

services:
  api:
    build:
      context: .
      dockerfile: infrastructure/docker/api.Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://larp:larppass@postgres:5432/larpdb
      - OLLAMA_HOST=http://ollama:11434
    depends_on:
      - postgres

  web:
    build:
      context: .
      dockerfile: infrastructure/docker/web.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
    depends_on:
      - api

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=larp
      - POSTGRES_PASSWORD=larppass
      - POSTGRES_DB=larpdb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Running with Docker Compose:
```bash
docker compose up -d
```

---

## 4. Bare-Metal / VPS Deployment (systemd)

### 4.1 Backend Service (`/etc/systemd/system/howtolarped-api.service`)
```ini
[Unit]
Description=HowToLarped FastAPI Backend Service
After=network.target

[Service]
User=deploy
WorkingDirectory=/var/www/itsLarper/apps/api
ExecStart=/var/www/itsLarper/apps/api/.venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always
Environment=OLLAMA_HOST=http://127.0.0.1:11434

[Install]
WantedBy=multi-user.target
```

### 4.2 Frontend Service (PM2 or systemd)
```bash
cd /var/www/itsLarper/apps/web
npm install
npm run build
pm2 start npm --name "howtolarped-web" -- start -- -p 3000
```

### 4.3 Nginx Reverse Proxy
```nginx
server {
    server_name yourdomain.com;

    # Next.js Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # FastAPI Backend
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
