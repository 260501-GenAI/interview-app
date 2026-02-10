# Cloud Run + Artifact Registry Deployment Guide

Deploy the Interview Prep Application as **Docker containers** on **Cloud Run**, using **Artifact Registry** for image storage.

---

## Prerequisites

- GCP project with billing enabled
- OpenAI API key
- The app repo pushed to GitHub: `https://github.com/260501-GenAI/interview-app.git`

---

## Step 1 — Enable APIs

1. Open the [GCP Console](https://console.cloud.google.com/)
2. Go to **APIs & Services → Enable APIs and Services**
3. Search for and enable each:
   - **Cloud Run Admin API**
   - **Artifact Registry API**
   - **Cloud Build API**

---

## Step 2 — Create an Artifact Registry Repository

1. Go to **Artifact Registry** in the GCP Console
2. Click **Create Repository**:

| Setting | Value |
|---------|-------|
| **Name** | `interview-app` |
| **Format** | Docker |
| **Region** | `us-central1` |

3. Click **Create**

---

## Step 3 — Create the Docker Files

### Backend — `backend/Dockerfile`

```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Cloud Run uses PORT env variable (default 8080)
ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

### Backend — `backend/.dockerignore`

```
.venv/
__pycache__/
*.pyc
chroma_db/
.env
.env.example
.git/
.gitignore
README.md
```

### Frontend — `frontend/Dockerfile`

```dockerfile
# Stage 1: Build the Vite app
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Accept the backend URL as a build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve static files
FROM node:20-alpine

RUN npm install -g serve

WORKDIR /app
COPY --from=builder /app/dist ./dist

EXPOSE 8080

CMD ["serve", "-s", "dist", "-l", "8080"]
```

### Frontend — `frontend/.dockerignore`

```
node_modules/
dist/
.git/
.gitignore
README.md
```

### Update `frontend/src/api/client.js`

The API base URL needs to support the `VITE_API_URL` build argument:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
```

---

## Step 4 — Test Locally with Docker Desktop

Before pushing to the cloud, verify the Docker images work on your local machine.

> [!NOTE]
> Make sure **Docker Desktop** is running on your machine before starting.

### Build and Run the Backend

```bash
cd backend

# Build the backend image
docker build -t interview-backend .

# Run it locally (uses your existing .env file)
docker run -d --name interview-backend \
  -p 8080:8080 \
  --env-file .env \
  interview-backend

cd ..
```

Verify: open [http://localhost:8080/docs](http://localhost:8080/docs) — you should see the Swagger UI.

### Build and Run the Frontend

```bash
cd frontend

# Build with the local backend URL
docker build \
  --build-arg VITE_API_URL=http://localhost:8080/api/v1 \
  -t interview-frontend .

# Run it locally
docker run -d --name interview-frontend \
  -p 3000:8080 \
  interview-frontend

cd ..
```

Verify: open [http://localhost:3000](http://localhost:3000) — the app should load and be able to start an interview.

### Clean Up Local Containers

Once you've confirmed both containers work:

```bash
docker stop interview-backend interview-frontend
docker rm interview-backend interview-frontend
```

---

## Step 5 — Open Cloud Shell

1. Click the **Cloud Shell** icon (terminal icon, top-right of the GCP Console)
2. A browser-based terminal opens at the bottom of the screen
3. Clone the repo:

```bash
git clone https://github.com/260501-GenAI/interview-app.git
cd interview-app
```

---

## Step 6 — Build and Push the Backend Image

In Cloud Shell:

```bash
# Set your project ID
export PROJECT_ID=$(gcloud config get-value project)
export REGION=us-central1

# Configure Docker to push to Artifact Registry
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build the backend image
cd backend
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/backend:latest .

# Push to Artifact Registry
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/backend:latest
cd ..
```

---

## Step 7 — Deploy the Backend to Cloud Run

1. Go to **Cloud Run** in the GCP Console
2. Click **Create Service**
3. Select **Deploy one revision from an existing container image**
4. Click **Select** and navigate to:
   - `us-central1-docker.pkg.dev/YOUR_PROJECT_ID/interview-app/backend:latest`
5. Configure the service:

| Setting | Value |
|---------|-------|
| **Service name** | `interview-backend` |
| **Region** | `us-central1` |
| **Authentication** | Allow unauthenticated invocations |
| **Container port** | `8080` |
| **Memory** | `1 GiB` |

6. Under **Container, Volumes, Networking, Security → Variables & Secrets**, add:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | `sk-your-key-here` |
| `CORS_ORIGINS` | `*` (update after frontend is deployed) |
| `MAX_FOLLOW_UPS` | `1` |
| `CHROMA_PERSIST_DIR` | `./chroma_db` |

7. Click **Create**

8. Once deployed, **copy the backend service URL** from the Cloud Run dashboard (e.g., `https://interview-backend-xxxxx-uc.a.run.app`)

---

## Step 8 — Build and Push the Frontend Image

Back in Cloud Shell:

```bash
cd frontend

# Build with the backend URL baked in
# Replace the URL below with your actual backend Cloud Run URL from Step 7
docker build \
  --build-arg VITE_API_URL=https://interview-backend-xxxxx-uc.a.run.app/api/v1 \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/frontend:latest .

# Push to Artifact Registry
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/frontend:latest
cd ..
```

> [!IMPORTANT]
> The `VITE_API_URL` is baked into the JavaScript bundle at **build time**. If the backend URL changes, you must rebuild and redeploy the frontend image.

---

## Step 9 — Deploy the Frontend to Cloud Run

1. Go to **Cloud Run** → **Create Service**
2. Select the frontend image:
   - `us-central1-docker.pkg.dev/YOUR_PROJECT_ID/interview-app/frontend:latest`
3. Configure:

| Setting | Value |
|---------|-------|
| **Service name** | `interview-frontend` |
| **Region** | `us-central1` |
| **Authentication** | Allow unauthenticated invocations |
| **Container port** | `8080` |

4. Click **Create**

---

## Step 10 — Update Backend CORS

Now that you have the frontend URL, update the backend's CORS to be specific:

1. Go to **Cloud Run** → `interview-backend` → **Edit & Deploy New Revision**
2. Under **Variables & Secrets**, update:

| Variable | New Value |
|----------|-----------|
| `CORS_ORIGINS` | `https://interview-frontend-xxxxx-uc.a.run.app` |

3. Click **Deploy**

---

## Step 11 — Verify Deployment

| Service | URL |
|---------|-----|
| Backend API Docs | `https://interview-backend-xxxxx-uc.a.run.app/docs` |
| Frontend | `https://interview-frontend-xxxxx-uc.a.run.app` |

1. Open the **Backend** URL + `/docs` — confirm Swagger UI loads
2. Open the **Frontend** URL — confirm the app loads
3. Start an interview — confirm the frontend can reach the backend

---

## How It Works

```
Browser → Frontend (Cloud Run)       → serves static JS/CSS/HTML
         Frontend JS (in browser)    → calls Backend URL directly (CORS)
         Backend (Cloud Run)         → processes requests, returns JSON
```

- The frontend is a static Vite build served by `serve`
- `client.js` uses `VITE_API_URL` (baked in at build time) to call the backend directly
- The backend allows the frontend's origin via `CORS_ORIGINS`
- No proxy or nginx needed — the browser handles cross-origin requests via CORS

---

## Redeploying Updates

When code changes are pushed to GitHub:

### Backend

```bash
cd interview-app/backend
git pull
docker build -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/backend:latest .
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/backend:latest
```

Then in Cloud Run → `interview-backend` → **Edit & Deploy New Revision** → **Deploy**

### Frontend

```bash
cd interview-app/frontend
git pull
docker build \
  --build-arg VITE_API_URL=https://interview-backend-xxxxx-uc.a.run.app/api/v1 \
  -t ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/frontend:latest .
docker push ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/frontend:latest
```

Then in Cloud Run → `interview-frontend` → **Edit & Deploy New Revision** → **Deploy**

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Verify `CORS_ORIGINS` on backend matches the frontend URL exactly (including `https://`) |
| Frontend loads but API fails | Check browser dev tools → Network tab. Verify `VITE_API_URL` was set correctly at build time |
| 502/503 errors | Check Cloud Run logs: Cloud Run → service → **Logs** tab |
| Image not found | Verify the image was pushed: Artifact Registry → `interview-app` repo |
| API key error | Verify `OPENAI_API_KEY` is set in backend service env vars |
