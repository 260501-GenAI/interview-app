# Interview Questions: GCP (Google Cloud Platform)

> Foundational GCP concepts, project structure, CI/CD, and environment promotion

---

## Beginner (Foundational)

### Q1: What is Google Cloud Platform (GCP) and what are its core service categories?
**Keywords:** Cloud Computing, IaaS, PaaS, Serverless, Managed Services
<details>
<summary>Click to Reveal Answer</summary>

GCP is Google's suite of cloud computing services. Its core categories include **Compute** (Compute Engine, Cloud Run, GKE), **Storage** (Cloud Storage, Persistent Disks), **AI/ML** (Vertex AI, AutoML), **Databases** (Cloud SQL, Firestore), and **Networking** (VPC, Load Balancing). It follows a pay-as-you-go model and supports IaaS, PaaS, and serverless paradigms.
</details>

---

### Q2: What is a GCP Project and why is it important?
**Keywords:** Resource Container, Billing, IAM, Isolation
<details>
<summary>Click to Reveal Answer</summary>

A GCP Project is the fundamental organizational unit in Google Cloud. It groups related resources together, provides billing boundaries, and acts as the scope for IAM (Identity and Access Management) policies. Every GCP resource belongs to exactly one project. Projects are identified by a unique project ID and can be organized under folders and an organization node.
</details>

---

### Q3: What is the `gcloud` CLI and what are common commands you would use?
**Keywords:** CLI, Configuration, Authentication, Deployment
**Hint:** Think about how you interact with GCP from a terminal.
<details>
<summary>Click to Reveal Answer</summary>

`gcloud` is the command-line interface for GCP. Common commands include:
- `gcloud auth login` — authenticate your account
- `gcloud config set project PROJECT_ID` — set the active project
- `gcloud services enable SERVICE_NAME` — enable an API
- `gcloud run deploy` — deploy to Cloud Run
- `gcloud compute instances list` — list Compute Engine VMs
- `gcloud builds submit` — trigger a Cloud Build
</details>

---

### Q4: What is the main goal of CI/CD pipelines?
**Keywords:** Automation, Continuous Integration, Continuous Delivery, Testing, Deployment
<details>
<summary>Click to Reveal Answer</summary>

The main goal of CI/CD pipelines is to **automate the process of integrating code changes, running tests, and deploying applications**. Continuous Integration (CI) ensures code is automatically built and tested on every commit. Continuous Delivery/Deployment (CD) automates releasing validated code to staging or production environments, reducing manual errors and accelerating delivery cycles.
</details>

---

### Q5: What does "environment promotion" mean in a CI/CD context?
**Keywords:** Dev, Staging, Production, Pipeline, Promotion
<details>
<summary>Click to Reveal Answer</summary>

Environment promotion refers to **moving code or artifacts through successive deployment stages** — typically from Development to Staging to Production. Each stage has progressively stricter validation. Code is "promoted" to the next environment only after passing the tests and checks of the current one. This ensures that only thoroughly tested code reaches production.
</details>

---

## Intermediate (Application)

### Q6: You need to deploy a containerized ML application on GCP. Walk through the key GCP services involved in the pipeline.
**Keywords:** Artifact Registry, Cloud Build, Cloud Run, CI/CD
**Hint:** Think about the journey from code to running container.
<details>
<summary>Click to Reveal Answer</summary>

The pipeline typically involves:
1. **Cloud Build** (or GitHub Actions) — builds the Docker image from source code
2. **Artifact Registry** — stores the built container image
3. **Cloud Run** — deploys and runs the container as a serverless service
4. **IAM** — manages permissions for each service to access resources
5. **Cloud Logging / Monitoring** — observability for the running service

Optionally, **Cloud Deploy** can manage environment promotion from staging to production.
</details>

---

### Q7: How does IAM work in GCP and what is the principle of least privilege?
**Keywords:** Roles, Permissions, Service Accounts, Least Privilege
<details>
<summary>Click to Reveal Answer</summary>

GCP IAM lets you control **who** (identity) has **what access** (role) to **which resource**. Identities can be users, groups, or service accounts. Roles are collections of permissions (e.g., `roles/run.admin`). The principle of least privilege means granting only the minimum permissions necessary for a task. For example, a Cloud Run service account should only have permissions to read from its specific Cloud Storage bucket, not all buckets in the project.
</details>

---

### Q8: Compare Cloud Build and GitHub Actions for CI/CD on GCP. When would you choose one over the other?
**Keywords:** Native Integration, Triggers, Flexibility, Vendor Lock-in
<details>
<summary>Click to Reveal Answer</summary>

**Cloud Build** is GCP-native, integrates tightly with Artifact Registry, Cloud Run, and GKE, and runs within your GCP project (no external credentials needed). Best when your entire stack is on GCP. **GitHub Actions** is platform-agnostic, has a large marketplace of actions, and works across multiple clouds. Best for multi-cloud or open-source projects. Choose Cloud Build for deep GCP integration and GitHub Actions for flexibility and cross-platform workflows.
</details>

---

## Advanced (Deep Dive)

### Q9: SCENARIO — Your CI/CD pipeline deploys to Cloud Run but you need zero-downtime deployments with the ability to roll back. How do you architect this?
<details>
<summary>Click to Reveal Answer</summary>

Use Cloud Run's **revision-based deployment** model:
1. Each deployment creates a new revision. The previous revision remains available.
2. Use **traffic splitting** to gradually shift traffic (canary deployment): `gcloud run services update-traffic --to-revisions=NEW=10,OLD=90`
3. Monitor error rates and latency via Cloud Monitoring during the rollout.
4. If issues arise, roll back instantly by routing 100% traffic to the previous revision.
5. Integrate this into CI/CD by having the pipeline deploy to a "no-traffic" revision first, run smoke tests, then shift traffic programmatically.
</details>

---
