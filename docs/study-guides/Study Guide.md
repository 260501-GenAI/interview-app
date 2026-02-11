# GCP (Google Cloud Platform)

What is GCP? What are its core service categories? (Compute, Storage, AI/ML, Databases, Networking)
What is a GCP Project? Why is it the fundamental organizational unit?

What is the gcloud CLI and how do you interact with GCP from a terminal?
	Know the common commands:
	gcloud auth login
	gcloud config set project PROJECT_ID
	gcloud services enable SERVICE_NAME
	gcloud run deploy
	gcloud builds submit

What is IAM? How does it work in GCP?
	Be able to explain identities, roles, and permissions
	What is the principle of least privilege?
	What is a Service Account and when do you use one?

What is CI/CD? What is the main goal of a CI/CD pipeline?
	Be able to differentiate Continuous Integration vs Continuous Delivery vs Continuous Deployment
	What is environment promotion? (dev -> staging -> production)
	Why does each stage have progressively stricter validation?

Compare Cloud Build and GitHub Actions for CI/CD on GCP
	When would you choose one over the other?
	What are the trade-offs around native integration vs platform agnosticism?


# Compute Engine (Cloud Engine)

What is Compute Engine? What cloud service model does it represent? (IaaS)
	How does IaaS differ from PaaS, SaaS, and FaaS?
	What level of control do you have over the OS, runtime, and applications?

Know the machine type families and when to use each:
	E2 (General-Purpose)
	C2 (Compute-Optimized)
	M2 (Memory-Optimized)
	A2 (Accelerator-Optimized -- for GPU workloads)
	What are custom machine types and when would you use them?

What are Spot VMs (preemptible instances)?
	What is the cost benefit? (up to 60-90% discount)
	What is the trade-off? (can be reclaimed at any time)
	What workloads are they best suited for?

When would you choose Compute Engine over Cloud Run?
	Be able to describe scenarios: GPU workloads, long-running processes, custom OS requirements


# Cloud Run

What is Cloud Run? What makes it a "serverless" container platform?
	How does it differ from Compute Engine, App Engine, and Cloud Functions?
	What does "fully managed" mean in this context?

How do you deploy a container to Cloud Run?
	Know the gcloud command: gcloud run deploy SERVICE --image IMAGE_URL
	Where does the container image typically come from? (Artifact Registry)

Know the key configuration settings:
	What is the default port? (8080 via the PORT environment variable)
	What is concurrency? (simultaneous requests per instance, default 80)
	What are min instances and max instances?
	What is the request timeout?

What is scale-to-zero?
	What happens when a service receives no traffic and min instances is 0?
	What is a cold start and how does it affect latency?
	When would you set min instances above 0?

How does Cloud Run handle HTTPS/TLS?
	Are certificates managed automatically?
	What URL format does each deployed service receive?

What is CORS and why does it matter for Cloud Run services?
	Be able to describe a cross-origin scenario (frontend on one domain, API on another)
	How do you configure CORS headers?

What are revisions in Cloud Run?
	How does traffic splitting work?
	How do you perform a canary deployment?
	How do you roll back to a previous revision?


# Artifact Registry

What is Artifact Registry? How does it differ from the deprecated Container Registry?
	What formats does it support beyond Docker? (npm, Maven, Python, Helm, etc.)
	What is repository-level IAM and why is it an improvement?

Know the image path format:
	REGION-docker.pkg.dev/PROJECT/REPO/IMAGE:TAG
	Be able to compare this to the legacy gcr.io format

How do you authenticate Docker with Artifact Registry?
	Know the command: gcloud auth configure-docker REGION-docker.pkg.dev
	What does this command modify? (Docker credential configuration)

What are image tags and why does the "latest" tag cause problems in production?
	Be able to explain mutability and non-reproducible deployments
	What is a better tagging strategy? (commit SHA, semantic versioning)

What is Container Analysis (Artifact Analysis)?
	How does vulnerability scanning work?
	What are CVEs (Common Vulnerabilities and Exposures)?

Do you need to create a repository before pushing images?
	How does this differ from Container Registry's auto-creation behavior?

How do you share images across GCP projects?
	What IAM role is needed? (roles/artifactregistry.reader)


# Vertex AI

What is Vertex AI? What does it cover across the ML lifecycle?
	Data preparation, model training, evaluation, deployment, monitoring
	What are foundation models and how do you access them? (Model Garden, Gemini, PaLM)
	Compare AutoML vs custom model training

What is a swappable model provider interface?
	Why would you want to switch between LLM providers without changing business logic?
	Be able to name common providers: OpenAI, Vertex AI (Gemini), Anthropic (Claude), Ollama (local)

Know the design patterns used in swappable provider design:
	Factory Pattern
		What does it do? (centralizes provider creation based on configuration)
		How does it use environment variables like MODEL_PROVIDER?
	Adapter Pattern
		What does it do? (wraps a provider's native API into a common interface)
		How does an adapter translate between SDK-specific calls and the common contract?
	Dependency Inversion Principle
		Why should business logic depend on the interface, not the concrete provider?
		How does this prevent vendor lock-in?

What does a typical provider interface look like?
	What method would you expect? (generate(prompt) or similar)
	Why do training, deployment, and dataset methods NOT belong in the common interface?

How do you switch providers at runtime?
	What environment variable controls the active provider? (LLM_PROVIDER)
	What configuration changes are needed? (credentials, model names, endpoint URLs)

What authentication does a Vertex AI provider require?
	GCP project ID, region, service account or application default credentials
	How does this compare to OpenAI's API key approach?

What is the best practice for provider failure handling?
	Retry with exponential backoff
	Fallback to an alternative provider
	Why is silently returning empty results a bad approach?
