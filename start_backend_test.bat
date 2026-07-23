@echo off
cd C:\Users\DELL\Downloads\CodeMind
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload --log-level debug
