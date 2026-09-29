"""
Vercel Serverless Function entry point for the Tempora FastAPI backend.
This file exposes the FastAPI app as a Vercel serverless function.
"""
import sys
import os

# Ensure the backend directory is on the Python path so 'from app.*' imports work
backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.main import app

# Vercel expects a variable named 'app' or 'handler'
# FastAPI/Starlette apps are ASGI-compatible, which Vercel supports natively
