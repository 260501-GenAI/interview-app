# Interview Prep Application - Local Deployment Guide

Complete guide for running the Interview Preparedness Application locally.

## Prerequisites

- **Python 3.10+** - For the FastAPI backend
- **Node.js 18+** - For the React frontend
- **Google Chrome** - Required for voice recording (Web Speech API)
- **OpenAI API Key** - For AI-powered interview features

---

## Quick Start

### 1. Clone and Navigate
```bash
cd 2396
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Windows (CMD):
.\venv\Scripts\activate.bat

# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# Start the server
python -m uvicorn app.main:app --reload --port 8000
```

Backend will be available at: **http://localhost:8000**

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## Environment Configuration

### Backend (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | ✅ | - | OpenAI API key for LLM |
| `MAX_FOLLOW_UPS` | ❌ | `1` | Max follow-up questions per answer |
| `CHROMA_PERSIST_DIR` | ❌ | `./chroma_db` | ChromaDB storage path |
| `CORS_ORIGINS` | ❌ | `http://localhost:5173` | Allowed CORS origins |

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/materials/upload` | POST | Upload study materials (PDF/TXT/MD) |
| `/api/v1/materials/list` | GET | List uploaded materials |
| `/api/v1/interview/start` | POST | Start new interview session |
| `/api/v1/interview/question` | GET | Get current question |
| `/api/v1/interview/answer` | POST | Submit answer transcript |
| `/api/v1/interview/approve` | POST | HITL approval for assessment |
| `/api/v1/interview/assessment` | GET | Get final assessment report |
| `/docs` | GET | OpenAPI documentation |

---

## Troubleshooting

### PowerShell Execution Policy (Windows)

If npm commands fail with "running scripts is disabled":

```powershell
# Option 1: Run in CMD instead
cmd /c "npm install"

# Option 2: Change execution policy (requires admin)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Voice Recording Not Working

1. Ensure you're using **Google Chrome**
2. Allow microphone permissions when prompted
3. Check that site is served over HTTPS or localhost

### Backend Connection Issues

1. Verify backend is running on port 8000
2. Check CORS_ORIGINS in .env includes frontend URL
3. Ensure .env file exists with valid OPENAI_API_KEY

---

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐
│  React Frontend │────▶│  FastAPI Backend │
│  (localhost:5173)│     │  (localhost:8000) │
└─────────────────┘     └────────┬─────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       ┌──────────┐      ┌──────────────┐   ┌───────────┐
       │ ChromaDB │      │ LangGraph    │   │ OpenAI    │
       │ (Vector) │      │ StateGraph   │   │ GPT-4o    │
       └──────────┘      └──────────────┘   └───────────┘
```

---

## Development

### Hot Reload

Both servers support hot reload:
- Backend: Uvicorn `--reload` flag
- Frontend: Vite HMR

### API Documentation

Visit http://localhost:8000/docs for interactive Swagger UI.

---

## Stopping the Servers

- **Backend**: Press `Ctrl+C` in the terminal
- **Frontend**: Press `Ctrl+C` or `q` in the Vite terminal
