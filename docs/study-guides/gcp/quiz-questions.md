# Weekly Knowledge Check: GCP (Google Cloud Platform)

> MCQ and True/False covering core GCP concepts, CI/CD, and environment promotion

---

## Part 1: Multiple Choice

### 1. Which service is commonly used to deploy containerized ML apps in GCP?
- [ ] A) BigQuery
- [ ] B) Compute Engine
- [ ] C) Cloud Run
- [ ] D) Cloud Functions

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Cloud Run

**Explanation:** Cloud Run is GCP's fully managed container platform that automatically scales containerized applications. It is the standard choice for deploying containerized ML apps because it handles scaling, HTTPS, and infrastructure management.
- **Why others are wrong:**
  - A) BigQuery is a data warehouse for analytics, not app deployment.
  - B) Compute Engine provides raw VMs, not managed container orchestration.
  - D) Cloud Functions is for small event-driven functions, not full containerized apps.
</details>

---

### 2. The main goal of CI/CD pipelines is to:
- [ ] A) Automate building, testing, and deploying code
- [ ] B) Replace manual testing entirely
- [ ] C) Eliminate the need for version control
- [ ] D) Run applications in containers

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) Automate building, testing, and deploying code

**Explanation:** CI/CD pipelines automate the software delivery process. Continuous Integration builds and tests code on every commit, while Continuous Delivery/Deployment automates releasing validated changes.
- **Why others are wrong:**
  - B) CI/CD augments testing but does not replace manual/exploratory testing.
  - C) CI/CD depends on version control (e.g., Git); it does not eliminate it.
  - D) Containerization is a deployment strategy, not the goal of CI/CD itself.
</details>

---

### 3. Environment promotion typically refers to:
- [ ] A) Increasing the number of environments
- [ ] B) Upgrading server hardware
- [ ] C) Promoting team members to new roles
- [ ] D) Moving code through dev, staging, and production stages

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) Moving code through dev, staging, and production stages

**Explanation:** Environment promotion is the practice of progressively moving validated code or artifacts from lower environments (dev) through testing environments (staging) to production. Each stage adds confidence through additional testing and validation.
- **Why others are wrong:**
  - A) Adding environments is scaling infrastructure, not promoting code through stages.
  - B) Hardware upgrades are infrastructure changes, not deployment pipeline concepts.
  - C) This is an HR concept, not a DevOps concept.
</details>

---

### 4. Which GCP service is purpose-built for building container images from source code?
- [ ] A) Cloud Run
- [ ] B) Cloud Build
- [ ] C) Artifact Registry
- [ ] D) Compute Engine

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) Cloud Build

**Explanation:** Cloud Build is a serverless CI/CD platform that executes builds on GCP infrastructure. It can build Docker container images from a Dockerfile and push them directly to Artifact Registry.
- **Why others are wrong:**
  - A) Cloud Run runs containers, it does not build them.
  - C) Artifact Registry stores images, it does not build them.
  - D) Compute Engine runs VMs; while you could build images on a VM, it is not the purpose-built service.
</details>

---

### 5. What is the relationship between a GCP Project and billing?
- [ ] A) Billing is global and not tied to projects
- [ ] B) Projects do not incur costs
- [ ] C) Billing is handled at the organization level only
- [ ] D) Each project is linked to a billing account that pays for its resources

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) Each project is linked to a billing account that pays for its resources

**Explanation:** Every GCP project must be linked to a billing account to create billable resources. The billing account is charged for all resources consumed within that project. This provides clear cost attribution per project.
- **Why others are wrong:**
  - A) Billing is always tied to specific projects through billing accounts.
  - B) Any provisioned resource (VMs, storage, Cloud Run services) incurs costs.
  - C) While organizations can have centralized billing, the link is at the project level.
</details>

---

### 6. Which `gcloud` command sets the active GCP project for your CLI session?
- [ ] A) `gcloud config set project PROJECT_ID`
- [ ] B) `gcloud project set PROJECT_ID`
- [ ] C) `gcloud init project PROJECT_ID`
- [ ] D) `gcloud set-project PROJECT_ID`

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) `gcloud config set project PROJECT_ID`

**Explanation:** The `gcloud config set project` command configures the default project for all subsequent `gcloud` commands in the current configuration. This avoids needing to pass `--project` on every command.
- **Why others are wrong:**
  - B) The correct subcommand path is `config set project`, not `project set`.
  - C) `gcloud init` runs the full interactive setup wizard, not a targeted project switch.
  - D) `set-project` is not a valid gcloud command.
</details>

---

## Part 2: True/False

### 7. GCP Cloud Build can be triggered automatically when code is pushed to a Git repository.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Cloud Build supports triggers that automatically start builds when changes are pushed to connected repositories (GitHub, Bitbucket, or Cloud Source Repositories).
</details>

---

### 8. A CI/CD pipeline eliminates the need for any manual testing.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** CI/CD automates repetitive testing (unit tests, integration tests, linting), but manual testing (exploratory testing, UX review, edge case validation) remains important for catching issues that automated tests cannot cover.
</details>

---

### 9. In GCP, all resources must belong to exactly one project.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Every GCP resource is scoped to a single project. Projects serve as the organizational boundary for resources, billing, and IAM policies.
</details>

---

### 10. Environment promotion means all environments run identical infrastructure configurations.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** While environments should be as similar as possible, they often differ in scale, data, and configuration. For example, production may have more replicas, real databases, and stricter IAM policies compared to dev or staging.
</details>

---
