# Vertex AI Setup Guide

Switch the Interview Prep Application from OpenAI to **Google Vertex AI** — using a mix of Gemini models, each chosen for its strengths.

---

## How the Swappable Provider Pattern Works

A single environment variable switches ALL models between providers:

```
LLM_PROVIDER=openai   → OpenAI GPT models (default)
LLM_PROVIDER=vertex   → Vertex AI (Gemini Models)
```

When set to `vertex`, each node uses a different model family optimized for its task:

| Node Role | Model | Family | Why |
|-----------|-------|--------|-----|
| Context analysis | gemini-2.0-flash | Google Gemini | Fast, cheap — great for summarization |
| Question generation | gemini-2.0-flash | Google Gemini | Fast, high-quality instruction following |
| Answer assessment | gemini-3.0-pro-preview | Google Gemini | Advanced reasoning for complex evaluation |


---

## Step 1 — Enable the Vertex AI API

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Enable APIs and Services**
3. Search for and enable **Vertex AI API**

---

## Step 2 — Grant Permissions

The Cloud Run service account needs access to Vertex AI. **If testing locally with your user account**, you also need this role.

1. Go to **IAM & Admin → IAM**
2. Find the default Compute service account (e.g., `PROJECT_NUMBER-compute@developer.gserviceaccount.com`)
3. Click **Edit** (pencil icon) → Add role: **Vertex AI User** (`roles/aiplatform.user`)
4. **ALSO:** Find your own user account (`you@example.com`)
5. Click **Edit** → Add role: **Vertex AI User**
6. Click **Save**

---

## Step 3 — Set Environment Variables

### On Cloud Run

1. Go to **Cloud Run** → `interview-backend` → **Edit & Deploy New Revision**
2. Under **Variables & Secrets**, add/update:

| Variable | Value |
|----------|-------|
| `LLM_PROVIDER` | `vertex` |
| `GCP_PROJECT_ID` | `your-project-id` |
| `GCP_LOCATION` | `us-central1` |

3. You can **remove** `OPENAI_API_KEY` — Vertex AI authenticates via the service account
4. Click **Deploy**

### For Local Development (Recommended)

Google recommends using **Application Default Credentials (ADC)** instead of downloading long-lived service account keys.

1. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install)
2. Login with your user account:
   ```bash
   gcloud auth application-default login
   ```
   (This saves temporary credentials to a well-known location on your machine)

3. Update your `.env`:
   ```env
   LLM_PROVIDER=vertex
   GCP_PROJECT_ID=your-project-id
   GCP_LOCATION=us-central1
   ```

### Using ADC with Docker (The JSON Method)
 
Instead of mounting files (which can be tricky with permissions on different OSes), we will pass the credentials as a JSON string environment variable.
 
#### 1. Get your Credentials JSON
 
Run one of the following commands to get your `application_default_credentials.json` content as a **minified single-line string**. Copy the output.
 
**PowerShell (Windows):**
```powershell
Get-Content "$env:APPDATA\gcloud\application_default_credentials.json" -Raw | ConvertFrom-Json | ConvertTo-Json -Compress
```
 
**Bash (Mac/Linux/Git Bash):**
```bash
# If you have 'jq' installed:
cat ~/.config/gcloud/application_default_credentials.json | jq -c .
 
# Or using Python (standard on most systems):
python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin)))" < ~/.config/gcloud/application_default_credentials.json
```
 
#### 2. Update your `.env`
 
Paste the copied JSON string into your `.env` file:
 
```env
LLM_PROVIDER=vertex
GCP_PROJECT_ID=your-project-id
GCP_LOCATION=us-central1
GOOGLE_CREDENTIALS_JSON='{"client_id":"...","client_secret":"..."}'
```
*(Note: Wrap the JSON in single quotes `'` to avoid shell parsing issues)*
 
---
 
## Step 4 — Build & Run Locally
 
Because we modified dependencies and code, you **must rebuild the image**:
 
```bash
cd backend
docker build -t interview-backend .
```
 
### Run the Backend Container
 
Now you can run the container without complex volume mounts:
 
```bash
docker run -d --name interview-backend -p 8080:8080 --env-file .env interview-backend
```

### Run the Frontend Container

```bash
docker run -d --name interview-frontend -p 3000:8080 interview-frontend
```

_(Access at `http://localhost:3000`)_

---

## Step 5 — Verify

1. Start an interview
2. Confirm questions are generated and answers are assessed
3. The logs will show which provider is being used based on your `LLM_PROVIDER` setting.

---

---
 
## Step 6 — Build and Push the Backend Image
 
In your local terminal:
 
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
 
## Step 7 — Deploy to Cloud Run
 
**Option A: Cloud Console (Recommended)**
 
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/run).
2.  Click on your service: **interview-backend**.
3.  Click **EDIT & DEPLOY NEW REVISION** (top center).
4.  **Container Image URL**: Click **SELECT** and browse to the image you just pushed (`interview-backend` in Artifact Registry).
5.  Scroll down to **Variables & Secrets** tab.
6.  Ensure the following Environment Variables are set:
    *   `LLM_PROVIDER` = `vertex`
    *   `GCP_PROJECT_ID` = *your-project-id*
    *   `GCP_LOCATION` = `us-central1`
7.  Click **DEPLOY**.
 
<details>
<summary><strong>Option B: Terminal Command</strong></summary>
 
```bash
gcloud run deploy interview-backend --image ${REGION}-docker.pkg.dev/${PROJECT_ID}/interview-app/backend:latest --region ${REGION} --set-env-vars LLM_PROVIDER=vertex,GCP_PROJECT_ID=${PROJECT_ID},GCP_LOCATION=${REGION} --allow-unauthenticated
```
</details>
 
---
 
## Summary of Changes
 
To enable this integration, the following files were modified:
 
### `backend/requirements.txt`
 
Added the unified Google GenAI SDK (replacing `langchain-google-vertexai`, see [migration discussion](https://github.com/langchain-ai/langchain-google/discussions/1422)):
```text
+ langchain-google-genai
```
 
### `backend/app/config.py`
 
Added settings for the LLM provider and Google credentials:
```python
class Settings(BaseSettings):
    # ...
    # ── Model Provider (Swappable Pattern) ──
    llm_provider: str = "openai"  # "openai" or "vertex"
 
    # GCP Settings
    gcp_project_id: str = ""
    gcp_location: str = "us-central1"
    google_credentials_json: str = ""  # For ADC authentication
 
    def setup_gcp_auth(self):
        """Parses GOOGLE_CREDENTIALS_JSON and sets GOOGLE_APPLICATION_CREDENTIALS"""
        # ... logic to write JSON to temp file ...
```
 
### `backend/app/agents/supervisor.py`
 
Updated `MODEL_MAP` to use the new `LLM_PROVIDER` logic and unified `ChatGoogleGenerativeAI` class:
```python
# Swappable Model Provider Pattern
MODEL_MAP = {
    "vertex": {
        "context": "gemini-2.0-flash",
        "question": "gemini-2.0-flash",
        "assessment": "gemini-3.0-pro-preview",
    },
}
 
def get_model(role: str):
    settings = get_settings()
    provider = settings.llm_provider
    # ...
    if provider == "vertex":
        return ChatGoogleGenerativeAI(
            model=model_name,
            vertexai=True,
            project=settings.gcp_project_id,
            location=settings.gcp_location,
            temperature=0
        )
```

## Switching Back to OpenAI

Set `LLM_PROVIDER=openai` (or remove the variable — OpenAI is the default). No code changes needed.
