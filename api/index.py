"""
Vercel Serverless Function entry point for the Tempora FastAPI backend.
Placed at project root /api/index.py so Vercel auto-detects it.
Catches all /api/* routes via the vercel.json rewrite.
"""
import sys
import os

# Add the backend directory to Python path so 'from app.*' imports resolve
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# Set production environment
os.environ.setdefault("ENVIRONMENT", "production")

from app.main import app

# Vercel expects a variable named 'app' (ASGI-compatible)
