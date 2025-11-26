#!/bin/bash

echo "🔍 Stopping any running backend instances..."
pkill -f backend/app.py 2>/dev/null || true
pkill -f app.py 2>/dev/null || true

echo "🔍 Checking if port 5001 is free..."
if lsof -i :5001 > /dev/null 2>&1; then
    echo "⚠️  Port 5001 still busy. Force-killing process..."
    PID=$(lsof -ti :5001)
    kill -9 $PID 2>/dev/null || true
fi

echo "🚀 Starting backend on port 5001..."
export GEMINI_API_KEY="$GEMINI_API_KEY"
export GEMINI_MODEL="models/gemini-2.5-flash"  # set your chosen model
python backend/app.py
