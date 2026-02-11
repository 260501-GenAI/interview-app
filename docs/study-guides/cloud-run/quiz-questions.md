# Weekly Knowledge Check: Cloud Run

> MCQ and True/False covering Cloud Run deployment, scaling, containers, and configuration

---

## Part 1: Multiple Choice

### 1. Which service is commonly used to deploy containerized ML apps in GCP?
- [ ] A) Compute Engine
- [ ] B) BigQuery
- [ ] C) Cloud Functions
- [ ] D) Cloud Run

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) Cloud Run

**Explanation:** Cloud Run is designed for running containerized applications with automatic scaling, HTTPS, and infrastructure management. It is the standard choice for deploying ML inference services and APIs packaged as Docker containers.
- **Why others are wrong:**
  - A) Compute Engine provides VMs, requiring manual container orchestration.
  - B) BigQuery is a data analytics warehouse, not an app deployment platform.
  - C) Cloud Functions runs small functions, not full containerized applications.
</details>

---

### 2. What is the default port that Cloud Run expects your container to listen on?
- [ ] A) 3000
- [ ] B) 80
- [ ] C) 8080
- [ ] D) 5000

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) 8080

**Explanation:** Cloud Run sets the `PORT` environment variable to `8080` by default and routes incoming HTTP traffic to that port. Your application should read from the `PORT` environment variable rather than hardcoding a value.
- **Why others are wrong:**
  - A) 3000 is a common default for Node.js development servers, not Cloud Run.
  - B) 80 is the standard HTTP port, but Cloud Run uses 8080 internally and handles external HTTPS on 443.
  - D) 5000 is a common default for Flask, not Cloud Run.
</details>

---

### 3. What happens when a Cloud Run service receives no traffic and min instances is set to 0?
- [ ] A) The service scales to zero instances
- [ ] B) Instances keep running but idle
- [ ] C) The service is deleted
- [ ] D) An error is returned to the next request

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) The service scales to zero instances

**Explanation:** Cloud Run's scale-to-zero feature shuts down all container instances when there is no traffic, eliminating costs during idle periods. When new traffic arrives, a new instance is started (cold start).
- **Why others are wrong:**
  - B) Keeping idle instances running is what happens when min instances is set above 0.
  - C) The service definition is preserved; only running instances are removed.
  - D) The next request triggers a new instance startup; it does not error (though it may be slower due to cold start).
</details>

---

### 4. Which `gcloud` command deploys a container image to Cloud Run?
- [ ] A) `gcloud compute deploy`
- [ ] B) `gcloud run deploy SERVICE --image IMAGE_URL`
- [ ] C) `gcloud containers run IMAGE_URL`
- [ ] D) `gcloud app deploy`

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) `gcloud run deploy SERVICE --image IMAGE_URL`

**Explanation:** The `gcloud run deploy` command creates or updates a Cloud Run service with the specified container image. The image is typically stored in Artifact Registry.
- **Why others are wrong:**
  - A) `gcloud compute deploy` is not a valid command.
  - C) `gcloud containers run` is not a valid command.
  - D) `gcloud app deploy` is for App Engine, a different GCP compute platform.
</details>

---

### 5. How does Cloud Run handle HTTPS/TLS certificates?
- [ ] A) You must manually upload certificates
- [ ] B) You must use a third-party certificate provider
- [ ] C) HTTPS is not supported
- [ ] D) Certificates are automatically provisioned and managed

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) Certificates are automatically provisioned and managed

**Explanation:** Cloud Run automatically provisions and renews TLS certificates for all services, including custom domains. There is no manual certificate management required.
- **Why others are wrong:**
  - A) Manual certificate management is not required for Cloud Run's default domain.
  - B) Google manages certificates natively; no third party is needed.
  - C) HTTPS is the only protocol Cloud Run supports for external traffic.
</details>

---

### 6. What is the "concurrency" setting in Cloud Run?
- [ ] A) The number of services that can run simultaneously
- [ ] B) The number of CPU cores allocated
- [ ] C) The maximum number of deployments per day
- [ ] D) The number of simultaneous requests a single instance can handle

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) The number of simultaneous requests a single instance can handle

**Explanation:** Concurrency controls how many requests are routed to a single container instance at the same time (default: 80, max: 1000). When all instances are at their concurrency limit, Cloud Run spins up new instances.
- **Why others are wrong:**
  - A) Concurrency is per-instance, not per-service.
  - B) CPU cores are configured separately via the CPU allocation setting.
  - C) There is no daily deployment limit related to concurrency.
</details>

---

## Part 2: True/False

### 7. Cloud Run can only run Docker containers built from a Dockerfile.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Cloud Run can run any OCI-compliant container image, regardless of how it was built. You can use Docker, Buildpacks, Jib, or any tool that produces a valid container image.
</details>

---

### 8. Cloud Run services receive a unique HTTPS URL automatically upon deployment.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Each deployed Cloud Run service receives an auto-generated URL in the format `https://SERVICE-HASH-REGION.a.run.app`. Custom domains can also be mapped.
</details>

---

### 9. Cloud Run supports WebSocket connections.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Cloud Run supports WebSocket connections, HTTP/2, and gRPC in addition to standard HTTP/1.1 requests.
</details>

---

### 10. Setting min instances to 0 is always the best practice for production services.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** While scale-to-zero saves cost, it introduces cold starts that increase latency for the first request. For latency-sensitive production services, setting min instances to 1 or higher ensures at least one warm instance is always ready.
</details>

---
