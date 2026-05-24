#!/usr/bin/env python3
"""
Dev server: serves site/ and proxies Gemini chat (keeps API key server-side).

Usage (from repo root):
  pip install -r requirements.txt
  # Set GEMINI_API_KEY in .env
  python server/dev_server.py
"""

from __future__ import annotations

import json
import os
import sys
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
SITE_DIR = ROOT / "site"
PROMPTS_DIR = Path(__file__).resolve().parent / "prompts"

try:
    from dotenv import load_dotenv
    load_dotenv(ROOT / ".env")
except ImportError:
    pass

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")
PORT = int(os.getenv("PORT", "8080"))

PAPER_PROMPTS = {
    "dci-agent": PROMPTS_DIR / "dci-agent.md",
}


def load_system_prompt(paper_id: str) -> str:
    path = PAPER_PROMPTS.get(paper_id)
    if path and path.exists():
        return path.read_text(encoding="utf-8")
    return "You are a helpful research paper tutor."


def gemini_chat(system_prompt: str, messages: list[dict]) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not set in .env")

    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(
        DEFAULT_MODEL,
        system_instruction=system_prompt,
    )

    history = []
    for msg in messages[:-1]:
        role = "user" if msg.get("role") == "user" else "model"
        history.append({"role": role, "parts": [msg.get("content", "")]})

    chat = model.start_chat(history=history)
    last = messages[-1].get("content", "") if messages else ""
    response = chat.send_message(last)
    return response.text or ""


class DevHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_DIR), **kwargs)

    def log_message(self, format, *args):
        if self.path.startswith("/api/"):
            sys.stderr.write("[api] %s - %s\n" % (self.address_string(), format % args))

    def send_json(self, status: int, payload: dict):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def read_json_body(self) -> dict:
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        return json.loads(raw.decode("utf-8"))

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/health":
            self.send_json(200, {
                "ok": True,
                "gemini": bool(GEMINI_API_KEY),
                "model": DEFAULT_MODEL,
            })
            return
        super().do_GET()

    def do_POST(self):
        path = urlparse(self.path).path
        if path != "/api/chat":
            self.send_json(404, {"error": "Not found"})
            return

        try:
            body = self.read_json_body()
            paper_id = body.get("paperId", "dci-agent")
            messages = body.get("messages", [])
            if not messages or messages[-1].get("role") != "user":
                self.send_json(400, {"error": "Last message must be from user"})
                return

            system_prompt = load_system_prompt(paper_id)
            reply = gemini_chat(system_prompt, messages)
            self.send_json(200, {"reply": reply})
        except RuntimeError as e:
            self.send_json(503, {"error": str(e)})
        except Exception as e:
            self.send_json(500, {"error": str(e)})


def main():
    if not SITE_DIR.is_dir():
        print("site/ directory not found", file=sys.stderr)
        sys.exit(1)

    server = ThreadingHTTPServer(("127.0.0.1", PORT), DevHandler)
    gemini_status = "configured" if GEMINI_API_KEY else "MISSING — set GEMINI_API_KEY in .env"
    print(f"Serving {SITE_DIR} at http://127.0.0.1:{PORT}")
    print(f"Gemini: {gemini_status} (model: {DEFAULT_MODEL})")
    print("Paper chat: /api/chat · Health: /api/health")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
        server.server_close()


if __name__ == "__main__":
    main()
