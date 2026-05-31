# Vercel serverless function entry point
# This imports and exposes the FastAPI app from main.py

import sys
import os

# Add parent directory to path so we can import main
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

# Export the app for Vercel
__all__ = ['app']
