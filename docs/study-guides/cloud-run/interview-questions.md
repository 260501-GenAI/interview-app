# Interview Questions: Cloud Run

> Deploying containerized applications, scaling, CORS, and multi-service architectures on Cloud Run

---

## Beginner (Foundational)

### Q1: What is Cloud Run and how does it differ from traditional VM-based hosting?
**Keywords:** Serverless, Container, Auto-scaling, Scale-to-Zero, Managed
<details>
<summary>Click to Reveal Answer</summary>

Cloud Run is a fully managed serverless platform that runs stateless containers. Unlike Compute Engine VMs, Cloud Run automatically handles scaling (including scaling to zero when idle), load balancing, HTTPS certificates, and infrastructure management. You only pay for actual request processing time. The key constraint is that workloads must be containerized and stateless.
</details>

---

### Q2: What is a Dockerfile and why is it needed for Cloud Run?
**Keywords:** Container Image, Build Instructions, Base Image, Layers
<details>
<summary>Click to Reveal Answer</summary>

A Dockerfile is a text file containing instructions to build a Docker container image. It specifies the base image (e.g., `python:3.11-slim`), copies application code, installs dependencies, and defines the startup command. Cloud Run requires a container image, so the Dockerfile defines how your application is packaged into a runnable container. Example structure: `FROM`, `WORKDIR`, `COPY`, `RUN pip install`, `CMD`.
</details>

---

### Q3: What port does Cloud Run expect your container to listen on by default?
**Keywords:** PORT, Environment Variable, 8080, HTTP
**Hint:** Think about how Cloud Run sends traffic to your container.
<details>
<summary>Click to Reveal Answer</summary>

Cloud Run injects a `PORT` environment variable (default `8080`) and routes HTTP traffic to that port. Your application must listen on `0.0.0.0:$PORT`. Hardcoding a different port will cause health checks to fail and the service will not receive traffic. The port can be configured in the service settings, but best practice is to read from the `PORT` environment variable.
</details>

---

### Q4: What is a Cloud Run "revision" and how does it relate to deployments?
**Keywords:** Immutable, Version, Traffic Splitting, Rollback
<details>
<summary>Click to Reveal Answer</summary>

A revision is an immutable snapshot of a Cloud Run service configuration, including the container image, environment variables, CPU/memory settings, and scaling parameters. Every deployment creates a new revision. Previous revisions are retained, enabling instant rollback by redirecting traffic. You can also split traffic between revisions for canary deployments.
</details>

---

### Q5: What is the Cloud Run service URL and how is HTTPS handled?
**Keywords:** Auto-generated URL, TLS, Custom Domain, Certificate
<details>
<summary>Click to Reveal Answer</summary>

When you deploy a Cloud Run service, it automatically receives a unique HTTPS URL in the format `https://SERVICE_NAME-HASH-REGION.a.run.app`. Cloud Run provisions and manages TLS certificates automatically. You can also map custom domains. All traffic is encrypted in transit by default with no additional configuration needed.
</details>

---

## Intermediate (Application)

### Q6: SCENARIO — You have a frontend (React) and backend (FastAPI) that both need to be on Cloud Run. How do you handle CORS?
**Keywords:** CORS, Origins, Preflight, Headers, Separate Services
**Hint:** Think about what happens when the frontend makes API calls to a different domain.
<details>
<summary>Click to Reveal Answer</summary>

Each Cloud Run service gets a unique URL, so the frontend and backend are on different origins, triggering CORS. Solutions:
1. **Backend CORS middleware** — configure FastAPI's `CORSMiddleware` with `allow_origins` set to the frontend's Cloud Run URL.
2. **Environment variables** — pass the frontend URL as an env var to the backend so CORS origins are configurable per environment.
3. **Preflight requests** — ensure the backend handles `OPTIONS` requests for complex requests.
4. **Alternative:** Use a load balancer with URL path mapping to serve both from the same domain, eliminating CORS entirely.
</details>

---

### Q7: How does Cloud Run autoscaling work and what are the key configuration parameters?
**Keywords:** Min Instances, Max Instances, Concurrency, Cold Start
<details>
<summary>Click to Reveal Answer</summary>

Cloud Run scales based on incoming request volume:
- **Min instances** — set to 0 (scale to zero, saves cost) or higher (avoids cold starts)
- **Max instances** — upper limit to control cost and downstream resource pressure
- **Concurrency** — number of simultaneous requests per instance (default 80, max 1000)
- **CPU allocation** — "request-based" (CPU only during requests) or "always allocated" (for background processing)

When all instances are at max concurrency, Cloud Run spins up new instances. When traffic drops, it scales down. Cold starts occur when scaling from zero.
</details>

---

### Q8: SCENARIO — Your Cloud Run service takes 15 seconds to respond on the first request after idle periods. What is causing this and how do you fix it?
**Keywords:** Cold Start, Min Instances, Startup Optimization, Lazy Loading
<details>
<summary>Click to Reveal Answer</summary>

This is a **cold start** problem. When scaled to zero, the first request must spin up a new container instance, load the application, and initialize connections. Fixes:
1. **Set min instances to 1+** — keeps at least one instance warm (increases cost).
2. **Optimize container startup** — use smaller base images (e.g., `python:3.11-slim`), reduce dependency install time.
3. **Lazy-load heavy resources** — load ML models or large datasets on first use, not at startup.
4. **Reduce image size** — smaller images download faster on cold start.
5. **Use startup CPU boost** — Cloud Run allocates extra CPU during container startup.
</details>

---

## Advanced (Deep Dive)

### Q9: SCENARIO — Design a multi-service architecture on Cloud Run for an ML interview application with separate frontend, backend API, and model inference services. How do you handle service-to-service authentication?
<details>
<summary>Click to Reveal Answer</summary>

Architecture:
1. **Frontend service** — serves static React app, configured as `--allow-unauthenticated` (public).
2. **Backend API service** — handles business logic, can be public or authenticated.
3. **Model inference service** — runs GPU-free inference, configured as `--no-allow-unauthenticated` (internal only).

Service-to-service authentication:
- The backend calls the inference service using an **ID token** obtained from the metadata server or a service account.
- Grant the backend's service account the `roles/run.invoker` role on the inference service.
- Use the `google-auth` library to fetch tokens: `google.auth.transport.requests.Request()` with the inference service URL as the audience.
- Alternative: use **Cloud Run's VPC connector** and internal-only ingress to restrict the inference service to VPC traffic only.
</details>

---
