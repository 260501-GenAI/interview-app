# Weekly Knowledge Check: Artifact Registry

> MCQ and True/False covering Artifact Registry concepts, image management, and CI/CD integration

---

## Part 1: Multiple Choice

### 1. What is the primary purpose of Artifact Registry in GCP?
- [ ] A) Running container applications
- [ ] B) Building Docker images from source code
- [ ] C) Storing and managing container images and language packages
- [ ] D) Monitoring application performance

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Storing and managing container images and language packages

**Explanation:** Artifact Registry is GCP's universal artifact management service. It stores Docker images, npm packages, Maven artifacts, Python packages, and more, with fine-grained IAM controls and vulnerability scanning.
- **Why others are wrong:**
  - A) Running containers is the job of Cloud Run or GKE.
  - B) Building images is handled by Cloud Build.
  - D) Monitoring is handled by Cloud Monitoring and Cloud Logging.
</details>

---

### 2. What is the correct image path format for Artifact Registry?
- [ ] A) `gcr.io/PROJECT/IMAGE:TAG`
- [ ] B) `docker.io/PROJECT/IMAGE:TAG`
- [ ] C) `REGION.gcr.io/PROJECT/IMAGE:TAG`
- [ ] D) `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG`

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) `REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG`

**Explanation:** Artifact Registry uses the `pkg.dev` domain with a region prefix. The path includes the project, repository name, image name, and tag. This differs from the legacy Container Registry which used `gcr.io`.
- **Why others are wrong:**
  - A) `gcr.io` is the legacy Container Registry path format.
  - B) `docker.io` is Docker Hub, not GCP.
  - C) `REGION.gcr.io` is the legacy multi-regional Container Registry format.
</details>

---

### 3. Which command configures Docker to authenticate with Artifact Registry?
- [ ] A) `gcloud auth configure-docker REGION-docker.pkg.dev`
- [ ] B) `docker login REGION-docker.pkg.dev`
- [ ] C) `gcloud docker auth REGION`
- [ ] D) `gcloud auth login --docker`

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) `gcloud auth configure-docker REGION-docker.pkg.dev`

**Explanation:** This command updates Docker's credential configuration to use `gcloud` as the credential helper for the specified Artifact Registry hostname. It modifies `~/.docker/config.json`.
- **Why others are wrong:**
  - B) `docker login` works but requires manual token generation; `gcloud auth configure-docker` is the recommended approach.
  - C) `gcloud docker auth` is not a valid command.
  - D) `gcloud auth login` authenticates gcloud itself, not Docker.
</details>

---

### 4. Why is using the `latest` tag in production deployments considered a bad practice?
- [ ] A) The `latest` tag is slower to pull
- [ ] B) The `latest` tag is mutable and makes deployments non-reproducible
- [ ] C) The `latest` tag is not supported by Artifact Registry
- [ ] D) The `latest` tag requires additional permissions

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) The `latest` tag is mutable and makes deployments non-reproducible

**Explanation:** The `latest` tag is overwritten each time a new image is pushed. This means you cannot guarantee which version of the image is running, and rollbacks become difficult because the previous `latest` image is gone.
- **Why others are wrong:**
  - A) Pull speed is unrelated to the tag name.
  - C) `latest` is fully supported; it is just not recommended for production.
  - D) Tags do not affect IAM permissions.
</details>

---

### 5. What GCP feature automatically scans container images for security vulnerabilities?
- [ ] A) Cloud Armor
- [ ] B) Security Command Center
- [ ] C) Container Analysis (Artifact Analysis)
- [ ] D) Cloud IAM

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Container Analysis (Artifact Analysis)

**Explanation:** Container Analysis integrates with Artifact Registry to automatically scan pushed images for known CVEs (Common Vulnerabilities and Exposures) in OS packages and language dependencies.
- **Why others are wrong:**
  - A) Cloud Armor is a DDoS protection and WAF service for load balancers.
  - B) Security Command Center aggregates security findings but does not perform image scanning itself.
  - D) Cloud IAM manages access control, not vulnerability scanning.
</details>

---

## Part 2: True/False

### 6. Artifact Registry supports storing Python packages in addition to Docker images.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Artifact Registry supports multiple formats including Docker, npm, Maven, Gradle, Python (pip), APT, YUM, and Helm charts.
</details>

---

### 7. Container Registry and Artifact Registry are the same service with different names.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Artifact Registry is the successor to Container Registry with significant improvements: repository-level IAM, multi-format support, regional storage options, and better security features. Container Registry is deprecated.
</details>

---

### 8. IAM permissions in Artifact Registry can be set at the individual repository level.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Unlike Container Registry (which used bucket-level permissions), Artifact Registry supports fine-grained IAM at the repository level. You can grant different teams access to different repositories within the same project.
</details>

---

### 9. You must create an Artifact Registry repository before pushing images to it.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Unlike Container Registry (which auto-created storage buckets), Artifact Registry requires you to explicitly create a repository first using `gcloud artifacts repositories create` or the console.
</details>

---

### 10. Artifact Registry images are only accessible from within the same GCP project.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Images can be accessed across projects by granting the appropriate IAM roles (e.g., `roles/artifactregistry.reader`) to service accounts or users from other projects. This enables shared image repositories across teams.
</details>

---
