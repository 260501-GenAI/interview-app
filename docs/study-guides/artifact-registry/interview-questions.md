# Interview Questions: Artifact Registry

> Container image management, repository types, authentication, and CI/CD integration

---

## Beginner (Foundational)

### Q1: What is Artifact Registry and what types of artifacts can it store?
**Keywords:** Container Images, Package Management, Docker, npm, Maven, Python
<details>
<summary>Click to Reveal Answer</summary>

Artifact Registry is GCP's universal package management service. It stores:
- **Docker container images** (most common for ML deployments)
- **Language packages** — npm (Node.js), Maven/Gradle (Java), pip (Python)
- **OS packages** — APT, YUM
- **Helm charts** for Kubernetes

It replaces the legacy Container Registry and provides fine-grained IAM, vulnerability scanning, and regional/multi-regional storage.
</details>

---

### Q2: How does Artifact Registry differ from the legacy Container Registry?
**Keywords:** IAM, Multi-format, Regional, Fine-grained, Deprecation
<details>
<summary>Click to Reveal Answer</summary>

Key differences:
- **IAM integration** — Artifact Registry uses standard GCP IAM roles (e.g., `roles/artifactregistry.reader`), while Container Registry used Cloud Storage bucket permissions.
- **Multi-format** — Artifact Registry supports Docker, npm, Maven, pip, and more. Container Registry only supported Docker images.
- **Repository-level control** — permissions can be set per-repository, not just per-project.
- **Regional storage** — Artifact Registry supports specific regions (e.g., `us-central1`), while Container Registry used multi-regional buckets (e.g., `gcr.io`).
Container Registry is deprecated in favor of Artifact Registry.
</details>

---

### Q3: What command authenticates Docker to push images to Artifact Registry?
**Keywords:** gcloud, auth, configure-docker, Credential Helper
**Hint:** Think about how Docker knows to use your GCP credentials.
<details>
<summary>Click to Reveal Answer</summary>

The command is:
```
gcloud auth configure-docker REGION-docker.pkg.dev
```
For example: `gcloud auth configure-docker us-central1-docker.pkg.dev`

This configures Docker's credential helper to use your `gcloud` credentials when interacting with Artifact Registry. It updates your `~/.docker/config.json` file with the appropriate credential helper entry.
</details>

---

### Q4: What is the image naming convention for Artifact Registry?
**Keywords:** Region, Project ID, Repository, Image Name, Tag
<details>
<summary>Click to Reveal Answer</summary>

The full image path follows this pattern:
```
REGION-docker.pkg.dev/PROJECT_ID/REPOSITORY/IMAGE_NAME:TAG
```
Example: `us-central1-docker.pkg.dev/my-project/ml-models/inference-api:v1.2`

Each component:
- **REGION** — where the repository is hosted (e.g., `us-central1`)
- **PROJECT_ID** — the GCP project
- **REPOSITORY** — a logical grouping within the project
- **IMAGE_NAME** — the container image name
- **TAG** — version identifier (e.g., `v1.2`, `latest`)
</details>

---

### Q5: What is image tagging and why is using `latest` in production considered risky?
**Keywords:** Tag, Digest, Immutability, Reproducibility, Versioning
<details>
<summary>Click to Reveal Answer</summary>

Tags are mutable labels pointing to a specific image digest (SHA256 hash). The `latest` tag is problematic in production because:
1. It is overwritten on every push, so `latest` today is different from `latest` yesterday.
2. You cannot reproduce a deployment — there is no guarantee of which image was running.
3. Rollbacks are difficult without a known good version tag.

Best practice: use **semantic version tags** (e.g., `v1.2.3`) or **Git commit SHAs** as tags. Reference images by **digest** (`@sha256:abc123...`) for absolute immutability.
</details>

---

## Intermediate (Application)

### Q6: SCENARIO — You want your CI/CD pipeline (Cloud Build) to build a Docker image and push it to Artifact Registry. Walk through the steps.
**Keywords:** Cloud Build, cloudbuild.yaml, Permissions, Service Account
**Hint:** Think about the build configuration file and IAM.
<details>
<summary>Click to Reveal Answer</summary>

Steps:
1. **Create an Artifact Registry repository**: `gcloud artifacts repositories create REPO --repository-format=docker --location=REGION`
2. **Write a `cloudbuild.yaml`**:
   ```yaml
   steps:
     - name: 'gcr.io/cloud-builders/docker'
       args: ['build', '-t', 'REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:$SHORT_SHA', '.']
     - name: 'gcr.io/cloud-builders/docker'
       args: ['push', 'REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:$SHORT_SHA']
   ```
3. **Grant permissions** — the Cloud Build service account needs `roles/artifactregistry.writer` on the repository.
4. **Set up a trigger** — connect the Git repo and configure Cloud Build to trigger on push events.
5. **Deploy** — add a subsequent step to deploy to Cloud Run using the newly pushed image.
</details>

---

### Q7: How do you implement vulnerability scanning in Artifact Registry and why is it important?
**Keywords:** Scanning, CVE, Container Analysis, Policy, Base Images
<details>
<summary>Click to Reveal Answer</summary>

Artifact Registry integrates with **Container Analysis** (also called Artifact Analysis) to scan images for known vulnerabilities (CVEs). Configuration:
1. Enable the Container Scanning API.
2. Images are automatically scanned on push.
3. View results in the console or via `gcloud artifacts docker images list --show-occurrences`.
4. Set up **Binary Authorization** policies to block deployment of images with critical vulnerabilities.

This is important because container images often contain OS-level packages with known security issues. Regular scanning and patching of base images is essential for production security.
</details>

---

## Advanced (Deep Dive)

### Q8: SCENARIO — Your team manages 50+ container images across multiple environments. Design a cleanup and retention strategy for Artifact Registry.
<details>
<summary>Click to Reveal Answer</summary>

Strategy:
1. **Cleanup policies** — configure Artifact Registry cleanup policies to automatically delete images older than N days or keep only the latest N versions per image.
2. **Tag convention** — enforce semantic versioning (`v1.2.3`) plus Git SHA tags. Never rely solely on `latest`.
3. **Environment-specific repositories** — separate `dev`, `staging`, `prod` repositories. Only promote tested images from dev to prod.
4. **Digest pinning** — production deployments reference images by digest, not tag, to prevent mutable tag surprises.
5. **Automation** — schedule cleanup jobs via Cloud Scheduler + Cloud Functions to delete untagged images and images with critical unpatched vulnerabilities.
6. **Cost management** — monitor storage costs via billing reports; older images in low-access repositories can be moved to cheaper storage classes.
</details>

---
