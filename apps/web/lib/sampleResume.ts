import { Profile } from "./store";

export const SAMPLE_PROFILE: Profile = {
  name: "Dr. Alex R. Chen",
  headline: "Principal AI Systems Architect & Distributed Computing Engineer",
  email: "alex.chen@alumni.stanford.edu",
  location: "San Francisco, CA (Open to Remote)",
  years: 6,
  education: "Ph.D. in Computer Science, Stanford University (2020–2024)\nM.S. in Electrical & Computer Engineering, UC Berkeley (2018–2020)",
  skills: [
    "Python",
    "TypeScript",
    "PyTorch",
    "Ollama",
    "Rust",
    "Distributed Systems",
    "FastAPI",
    "React",
    "Docker",
    "Kubernetes",
    "PostgreSQL",
    "pgvector",
    "Redis"
  ],
  experience: [
    {
      company: "Anthropic Labs / Cortex AI",
      role: "Lead Distributed AI Architect",
      dates: "2023 - Present",
      bullets: [
        "Architected high-throughput local LLM inference engines utilizing quantized models (Q4_K_M GGUF) and Metal GPU acceleration, cutting p99 inference latency by 45%.",
        "Orchestrated autonomous workforce swarms processing 50,000+ candidate applications daily with Redis queue coordination and real-time failure recovery.",
        "Implemented zero-hallucination verification pipeline comparing resume claims directly against primary GitHub commit evidence."
      ]
    },
    {
      company: "FinTech Neural Systems",
      role: "Senior AI Software Engineer",
      dates: "2020 - 2023",
      bullets: [
        "Designed and maintained resilient career intelligence microservices handling 12,000 requests/sec with FastAPI and PostgreSQL pgvector embeddings.",
        "Created APA 7th Edition resume compiler with automated reference checking and dynamic semantic relevance scoring."
      ]
    }
  ],
  projects: [
    {
      name: "itsLARP Autonomous Job-Hunting Workforce",
      tech: ["Python", "FastAPI", "React", "Electron", "Ollama", "Docker"],
      text: "Open-source standalone desktop OS deploying 1,000 autonomous background agents to discover matching roles, synthesize APA-compliant resumes, and stage applications."
    },
    {
      name: "Quantized Metal LLM Acceleration Pipeline",
      tech: ["C++", "Metal", "GGUF", "PyTorch"],
      text: "Zero-copy shared memory tensor evaluation framework for Apple Silicon M-series chips achieving 85 tokens/second for 7B parameter architectures."
    }
  ],
  evidence: [
    {
      source: "GitHub: darknecrocities/itsLARP",
      text: "Production-ready autonomous workforce engine with multi-stage containerization and native Electron desktop build."
    },
    {
      source: "Stanford AI Lab Research Paper (2024)",
      text: "Empirical verification of structured output constraints in low-parameter language models."
    },
    {
      source: "Cortex AI Production Telemetry",
      text: "Maintained 99.98% uptime across 1,000 active worker processes with sub-3s response deadlines."
    }
  ],
  links: {
    github: "github.com/alexchen-ai",
    linkedin: "linkedin.com/in/alexchen-ai"
  }
};
