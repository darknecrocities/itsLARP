import json
import os
import re
import httpx
from typing import Optional, Dict, Any, List

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

class AIGateway:
    def __init__(self):
        self.provider: str = os.getenv("AI_PROVIDER", "ollama")
        self.model: str = os.getenv("AI_MODEL", "qwen2.5:0.5b")
        self.api_key: Optional[str] = os.getenv("AI_API_KEY", None)

    async def get_status(self) -> Dict[str, Any]:
        """Check status of AI providers and available models."""
        ollama_ok = False
        ollama_models = []
        try:
            async with httpx.AsyncClient(timeout=2.0) as client:
                res = await client.get(f"{OLLAMA_HOST}/api/tags")
                if res.status_code == 200:
                    ollama_ok = True
                    ollama_models = [m["name"] for m in res.json().get("models", [])]
        except Exception:
            ollama_ok = False

        # Pick fastest available model if current model isn't installed
        if ollama_models and self.model not in ollama_models:
            for preferred in ["qwen2.5:0.5b", "llama3.2:latest", "gemma2:2b", "gemma3:4b", "qwen2.5-coder:7b"]:
                if preferred in ollama_models:
                    self.model = preferred
                    break
            else:
                self.model = ollama_models[0]

        return {
            "provider": self.provider,
            "model": self.model,
            "connected": ollama_ok,
            "models": ollama_models,
            "providers": [
                {"id": "ollama", "name": "Ollama (Local)", "connected": ollama_ok, "default_model": self.model},
                {"id": "google", "name": "Google Gemini", "connected": bool(os.getenv("GEMINI_API_KEY")), "default_model": "gemini-1.5-flash"},
                {"id": "openai", "name": "OpenAI", "connected": bool(os.getenv("OPENAI_API_KEY")), "default_model": "gpt-4o-mini"},
                {"id": "anthropic", "name": "Anthropic", "connected": bool(os.getenv("ANTHROPIC_API_KEY")), "default_model": "claude-3-5-haiku"},
            ]
        }

    def set_config(self, provider: str, model: str, api_key: Optional[str] = None):
        self.provider = provider
        self.model = model
        if api_key:
            self.api_key = api_key

    async def generate(self, prompt: str, system: str = "", max_tokens: int = 1000, temperature: float = 0.2) -> Optional[str]:
        """Generates completion through selected provider with graceful fallback."""
        if self.provider == "ollama":
            return await self._call_ollama(prompt, system, max_tokens, temperature)
        elif self.provider == "google" and (self.api_key or os.getenv("GEMINI_API_KEY")):
            return await self._call_gemini(prompt, system, max_tokens, temperature)
        return None

    async def _call_ollama(self, prompt: str, system: str, max_tokens: int, temperature: float) -> Optional[str]:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                body = {
                    "model": self.model,
                    "prompt": prompt,
                    "system": system,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens,
                    }
                }
                res = await client.post(f"{OLLAMA_HOST}/api/generate", json=body)
                if res.status_code == 200:
                    return res.json().get("response", "").strip()
        except Exception:
            return None
        return None

    async def _call_gemini(self, prompt: str, system: str, max_tokens: int, temperature: float) -> Optional[str]:
        key = self.api_key or os.getenv("GEMINI_API_KEY")
        if not key:
            return None
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={key}"
            payload = {
                "contents": [{"parts": [{"text": f"{system}\n\n{prompt}"}]}],
                "generationConfig": {"temperature": temperature, "maxOutputTokens": max_tokens}
            }
            async with httpx.AsyncClient(timeout=15.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    parts = res.json()["candidates"][0]["content"]["parts"]
                    return "".join(p.get("text", "") for p in parts).strip()
        except Exception:
            return None
        return None


ai_gateway = AIGateway()
