# Vercel serverless function - FastAPI entry point
import sys
import os
from pathlib import Path

# Add parent directory to Python path
parent_dir = str(Path(__file__).parent.parent)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

# Import the FastAPI app
from main import app

# Vercel expects the app to be named 'app'
# This is the ASGI application that Vercel will call

