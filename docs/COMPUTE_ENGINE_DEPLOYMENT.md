# Compute Engine Deployment Guide

Deploy the Interview Prep Application to a **GCP Compute Engine** Debian instance — entirely from the browser with **no local SDK required**.

---

## Prerequisites

- Google Cloud account with billing enabled
- OpenAI API key
- A modern browser (all steps use the GCP Console)

---

## Step 1 — Create a Compute Engine VM

1. Open the [GCP Console](https://console.cloud.google.com/).
2. Navigate to **Compute Engine → VM instances** (enable the API if prompted).
3. Click **Create Instance** and configure:

| Setting | Value |
|---------|-------|
| **Name** | `interview-app` |
| **Region / Zone** | `us-central1-a` (or your preference) |
| **Machine type** | `e2-medium` (2 vCPU, 4 GB) |
| **Boot disk** | Debian 12 (Bookworm), 10 GB balanced persistent disk |
| **Firewall** | Check **Allow HTTP traffic** and **Allow HTTPS traffic** |

4. Under **Advanced options → Networking → Network tags**, add `interview-app`.
5. Click **Create**.

---

## Step 2 — Open Firewall Ports

The app runs on ports **8000** (backend) and **5173** (frontend dev) or **80** (production).

1. Go to **VPC network → Firewall** in the GCP Console.
2. Click **Create Firewall Rule**:

| Setting | Value |
|---------|-------|
| **Name** | `allow-interview-app` |
| **Target tags** | `interview-app` |
| **Source IP ranges** | `0.0.0.0/0` |
| **Protocols and ports** | `all` |

3. Click **Create**.

---

## Step 3 — SSH into the VM

1. On the **VM instances** page, click **SSH** next to your `interview-app` instance.
2. A browser-based terminal opens — no local setup needed.

---

## Step 4 — Install System Dependencies

Run the following commands in the SSH terminal:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install uv (fast Python package manager)
curl -LsSf https://astral.sh/uv/install.sh | sh
source $HOME/.local/bin/env

# Install Python venv support 
# NOTE: Check what the above command outputs, some had python3.11-venv instead of python3.13-venv
sudo apt install -y python3.13-venv

# Install Node.js and npm
sudo apt install -y npm

# Install Git
sudo apt install -y git

# Verify installations
python3 --version
node --version
npm --version
git --version
```

---

## Step 5 — Clone and Set Up the Backend

```bash
# Clone the repo (replace with your actual repo URL)
git clone https://github.com/260501-GenAI/interview-app.git
cd interview-app/backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
```

Edit the `.env` file with your keys:

```bash
nano .env
```

Set these values:

```env
OPENAI_API_KEY=sk-your-key-here
CORS_ORIGINS=http://YOUR_VM_EXTERNAL_IP:5173,http://YOUR_VM_EXTERNAL_IP
MAX_FOLLOW_UPS=1
CHROMA_PERSIST_DIR=./chroma_db
```

> [!TIP]
> Find your VM's external IP on the **VM instances** page in the GCP Console.

---

## Step 6 — Set Up the Frontend

```bash
cd ~/interview-app/frontend

# Install Node dependencies
npm install
```

Update `vite.config.js` to bind to all interfaces and proxy API requests to the backend:

```bash
nano vite.config.js
```

Update the config to:

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0',   // Allow external access on Compute Engine
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true
            }
        }
    }
});
```

> [!NOTE]
> The Vite dev server proxies all `/api` requests to the backend on port 8000, so the frontend code just calls `/api/v1/...` and the proxy handles the rest — same as local development.

---

## Step 7 — Run the Application

### Start the Backend

```bash
cd ~/interview-app/backend
source .venv/bin/activate

# Run in the background (persists after SSH disconnect)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 &
```

### Start the Frontend

```bash
cd ~/interview-app/frontend

# Dev mode (host is already set to 0.0.0.0 in vite.config.js)
npm run dev 
```

---

## Step 8 — Verify Deployment

| Service | URL |
|---------|-----|
| Backend API Docs | `http://YOUR_VM_EXTERNAL_IP:8000/docs` |
| Frontend | `http://YOUR_VM_EXTERNAL_IP:5173` |

Open both URLs in your browser to confirm everything is running.

---
