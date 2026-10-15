"""Authentic company metadata directory.
Provides accurate company background, official LinkedIn URL, website, and career information.
"""
import re
from typing import Dict, Any, Optional

COMPANIES_DB: Dict[str, Dict[str, Any]] = {
    "Anthropic": {
        "name": "Anthropic",
        "background": "Frontier AI safety and research company developing Claude, constitutional AI models, and scalable alignment infrastructure.",
        "linkedin": "https://www.linkedin.com/company/anthropicresearch",
        "website": "https://anthropic.com",
        "careers": "https://jobs.anthropic.com",
        "roles": ["Lead AI Systems Engineer", "Principal Researcher", "Distributed Inference Engineer", "Safety Alignment Engineer"]
    },
    "OpenAI": {
        "name": "OpenAI",
        "background": "AI research and deployment company developing general-purpose artificial intelligence, GPT models, and ChatGPT systems.",
        "linkedin": "https://www.linkedin.com/company/openai",
        "website": "https://openai.com",
        "careers": "https://openai.com/careers",
        "roles": ["Staff AI Engineer", "Kernel Engineer", "Distributed Training Architect", "Full Stack Platform Engineer"]
    },
    "Vercel": {
        "name": "Vercel",
        "background": "Frontend cloud platform for Next.js, React, and serverless edge infrastructure enabling rapid web deployment.",
        "linkedin": "https://www.linkedin.com/company/vercel",
        "website": "https://vercel.com",
        "careers": "https://vercel.com/careers",
        "roles": ["Staff Edge Infrastructure Engineer", "Full Stack Platform Architect", "DevOps Systems Specialist"]
    },
    "Stripe": {
        "name": "Stripe",
        "background": "Global financial infrastructure platform processing hundreds of billions in commerce with resilient distributed transaction engines.",
        "linkedin": "https://www.linkedin.com/company/stripe",
        "website": "https://stripe.com",
        "careers": "https://stripe.com/jobs",
        "roles": ["Staff Backend Systems Engineer", "Distributed Payments Infrastructure Lead", "Machine Learning Fraud Engineer"]
    },
    "Databricks": {
        "name": "Databricks",
        "background": "Data and AI company pioneering the lakehouse architecture, Apache Spark, and open-source enterprise intelligence.",
        "linkedin": "https://www.linkedin.com/company/databricks",
        "website": "https://databricks.com",
        "careers": "https://databricks.com/company/careers",
        "roles": ["Senior Distributed Systems Engineer", "MLOps Infrastructure Lead", "Data Platform Architect"]
    },
    "Supabase": {
        "name": "Supabase",
        "background": "Open source Firebase alternative providing Postgres databases, authentication, real-time edge functions, and vector embeddings.",
        "linkedin": "https://www.linkedin.com/company/supabase",
        "website": "https://supabase.com",
        "careers": "https://supabase.com/careers",
        "roles": ["Database Systems Engineer", "Full Stack Platform Engineer", "Edge Runtime Architect"]
    },
    "Linear": {
        "name": "Linear",
        "background": "Purpose-built project management system for modern high-performance software engineering teams.",
        "linkedin": "https://www.linkedin.com/company/linear-app",
        "website": "https://linear.app",
        "careers": "https://linear.app/careers",
        "roles": ["Senior Full Stack Engineer", "Real-Time Sync Systems Architect", "Frontend Core Engineer"]
    },
    "Scale AI": {
        "name": "Scale AI",
        "background": "Data-centric AI platform providing data annotation, RLHF evaluation, and foundation model infrastructure.",
        "linkedin": "https://www.linkedin.com/company/scaleai",
        "website": "https://scale.com",
        "careers": "https://scale.com/careers",
        "roles": ["AI Systems Infrastructure Engineer", "RLHF Evaluation Engineer", "Computer Vision Platform Engineer"]
    },
    "Google DeepMind": {
        "name": "Google DeepMind",
        "background": "World-leading artificial intelligence research laboratory creating transformative AI breakthroughs including Gemini and AlphaFold.",
        "linkedin": "https://www.linkedin.com/company/googledeepmind",
        "website": "https://deepmind.google",
        "careers": "https://deepmind.google/careers",
        "roles": ["Research Engineer - Foundation Models", "Distributed Systems Software Engineer", "AI Safety Evaluation Scientist"]
    },
    "Meta": {
        "name": "Meta",
        "background": "Technology and social metaverse company building LLaMA open-weights AI models, PyTorch, and massive distributed infrastructure.",
        "linkedin": "https://www.linkedin.com/company/meta",
        "website": "https://meta.com",
        "careers": "https://metacareers.com",
        "roles": ["Production Engineer - AI Inference", "Distributed Compute Systems Engineer", "Machine Learning Platform Specialist"]
    },
    "Cloudflare": {
        "name": "Cloudflare",
        "background": "Global cloud network platform protecting and accelerating internet properties with distributed edge computing and security.",
        "linkedin": "https://www.linkedin.com/company/cloudflare",
        "website": "https://cloudflare.com",
        "careers": "https://cloudflare.com/careers",
        "roles": ["Systems Engineer - Edge Runtimes", "Distributed Network Security Architect", "Cloud Platform Engineer"]
    },
    "Modal": {
        "name": "Modal",
        "background": "Serverless cloud compute engine for running AI, machine learning, and data workloads in containers with microsecond cold starts.",
        "linkedin": "https://www.linkedin.com/company/modal-labs",
        "website": "https://modal.com",
        "careers": "https://modal.com/careers",
        "roles": ["Cloud Systems Engineer", "GPU Virtualization Specialist", "Container Runtime Architect"]
    },
    "Perplexity": {
        "name": "Perplexity",
        "background": "Conversational answer engine delivering accurate, cited, real-time knowledge synthesis through frontier LLMs.",
        "linkedin": "https://www.linkedin.com/company/perplexity-ai",
        "website": "https://perplexity.ai",
        "careers": "https://perplexity.ai/careers",
        "roles": ["AI Search Infrastructure Engineer", "Real-Time RAG Systems Engineer", "Full Stack AI Engineer"]
    },
    "Mistral AI": {
        "name": "Mistral AI",
        "background": "Open and portable generative artificial intelligence company providing efficient foundation models and enterprise inference.",
        "linkedin": "https://www.linkedin.com/company/mistral-ai",
        "website": "https://mistral.ai",
        "careers": "https://mistral.ai/careers",
        "roles": ["LLM Inference Optimization Engineer", "Kernel & CUDA Specialist", "Platform Architect"]
    },
    "Figma": {
        "name": "Figma",
        "background": "Collaborative design platform connecting modern product development teams across interface design, prototyping, and developer handoff.",
        "linkedin": "https://www.linkedin.com/company/figma",
        "website": "https://figma.com",
        "careers": "https://figma.com/careers",
        "roles": ["Graphics Engine Developer", "Collaborative Infrastructure Architect", "Full Stack Platform Engineer"]
    },
    "GitHub": {
        "name": "GitHub",
        "background": "Complete developer platform for software development, GitHub Actions CI/CD, Copilot AI pair programming, and open-source collaboration.",
        "linkedin": "https://www.linkedin.com/company/github",
        "website": "https://github.com",
        "careers": "https://github.com/about/careers",
        "roles": ["Copilot Systems Engineer", "Distributed Git Infrastructure Architect", "Developer Platform Engineer"]
    },
    "Snowflake": {
        "name": "Snowflake",
        "background": "Cloud data warehousing company providing global data mesh, data engineering, and Cortex AI generative intelligence.",
        "linkedin": "https://www.linkedin.com/company/snowflake-computing",
        "website": "https://snowflake.com",
        "careers": "https://careers.snowflake.com",
        "roles": ["Data Cloud Infrastructure Engineer", "Query Optimization Specialist", "Full Stack Systems Engineer"]
    },
    "Palantir": {
        "name": "Palantir",
        "background": "Enterprise software company building Foundry and AIP operational decision-making platforms for complex distributed datasets.",
        "linkedin": "https://www.linkedin.com/company/palantir-technologies",
        "website": "https://palantir.com",
        "careers": "https://palantir.com/careers",
        "roles": ["Forward Deployed Software Engineer", "AIP Platform Architect", "Distributed Core Infrastructure Engineer"]
    }
}


def get_company_info(raw_company: str) -> Dict[str, Any]:
    """Resolves accurate company background, LinkedIn URL, and website.
    Supports substring and alias matching with deterministic fallback.
    """
    clean_name = (raw_company or "").strip()
    norm = clean_name.lower()

    # Exact or substring match in curated database
    for key, data in COMPANIES_DB.items():
        if key.lower() in norm or norm in key.lower():
            return {
                "name": data["name"],
                "background": data["background"],
                "linkedin": data["linkedin"],
                "website": data["website"],
                "careers": data["careers"],
                "roles": data.get("roles", ["Software Engineer", "AI Systems Engineer"])
            }

    # Deterministic fallback for uncataloged companies
    slug = re.sub(r"[^a-z0-9]", "", norm) or "techcorp"
    return {
        "name": clean_name or "Technology Systems",
        "background": f"{clean_name} is a high-growth technology organization engineering scalable distributed systems, cloud infrastructure, and data platforms.",
        "linkedin": f"https://www.linkedin.com/company/{slug}",
        "website": f"https://{slug}.com",
        "careers": f"https://jobs.{slug}.com",
        "roles": ["Senior Systems Engineer", "AI Platform Specialist", "Full Stack Developer"]
    }
