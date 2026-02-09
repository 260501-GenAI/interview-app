# Interview Preparedness API - Backend

FastAPI backend for the Interview Preparedness Application with LangGraph multi-agent system.

## Quick Start

```bash
# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables
copy .env.example .env
# Edit .env with your OPENAI_API_KEY

# Run server
uvicorn app.main:app --reload --port 8000
```

## API Documentation

Once running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/materials/upload` | Upload study materials (PDF/TXT) |
| POST | `/api/v1/interview/start` | Start interview session |
| GET | `/api/v1/interview/question` | Get next question |
| POST | `/api/v1/interview/answer` | Submit voice transcript |
| GET | `/api/v1/interview/assessment` | Get performance report |
