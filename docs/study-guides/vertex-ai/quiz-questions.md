# Weekly Knowledge Check: Vertex AI

> MCQ and True/False covering Vertex AI platform and swappable model provider design patterns

---

## Part 1: Multiple Choice

### 1. Vertex AI is primarily used for:
- [ ] A) Building, training, and deploying ML models
- [ ] B) Web hosting
- [ ] C) Managing DNS records
- [ ] D) Version control

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) Building, training, and deploying ML models

**Explanation:** Vertex AI is GCP's unified ML platform that covers the full ML lifecycle: data preparation, model training (custom and AutoML), evaluation, deployment to endpoints, and monitoring. It also provides API access to Google's foundation models.
- **Why others are wrong:**
  - B) Web hosting is handled by Cloud Run, App Engine, or Compute Engine.
  - C) DNS management is handled by Cloud DNS.
  - D) Version control is handled by Cloud Source Repositories or external services like GitHub.
</details>

---

### 2. What is the main purpose of a swappable model provider interface?
- [ ] A) To make models run faster
- [ ] B) To allow switching between LLM providers without changing business logic
- [ ] C) To reduce the size of ML models
- [ ] D) To encrypt API calls

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) To allow switching between LLM providers without changing business logic

**Explanation:** A swappable provider interface defines a common contract that all providers implement. The application code depends on this interface, not on any specific provider, enabling seamless switching between OpenAI, Vertex AI, local models, etc.
- **Why others are wrong:**
  - A) Provider interfaces do not affect model performance or speed.
  - C) Model size is determined by the model itself, not the interface pattern.
  - D) Encryption is a transport-layer concern, not an abstraction pattern concern.
</details>

---

### 3. In a swappable provider system, a Factory pattern is used to:
- [ ] A) Train ML models
- [ ] B) Encrypt provider API keys
- [ ] C) Centralize the creation of the correct provider based on configuration
- [ ] D) Monitor provider performance

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Centralize the creation of the correct provider based on configuration

**Explanation:** The Factory pattern reads a configuration value (e.g., environment variable) and instantiates the appropriate provider class. This keeps provider-selection logic in one place rather than scattered throughout the codebase.
- **Why others are wrong:**
  - A) Model training is unrelated to the Factory pattern.
  - B) Key management is a separate security concern.
  - D) Monitoring is a separate operational concern.
</details>

---

### 4. Which of the following is required for a provider to be swappable?
- [ ] A) It must use the OpenAI SDK
- [ ] B) It must be deployed on GCP
- [ ] C) It must support GPU inference
- [ ] D) It must implement a common interface with consistent method signatures

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) It must implement a common interface with consistent method signatures

**Explanation:** Swappability requires all providers to conform to the same interface: same method names, parameter types, and return types. This is what allows calling code to work with any provider interchangeably.
- **Why others are wrong:**
  - A) The whole point is to be SDK-agnostic; each provider uses its own SDK internally.
  - B) Local providers and providers on other clouds must also be swappable.
  - C) GPU support is a capability concern, not an interface requirement.
</details>

---

### 5. A local LLM provider typically refers to:
- [ ] A) A model running on your own hardware (e.g., via Ollama)
- [ ] B) A model hosted on Google Cloud
- [ ] C) A model stored in Cloud Storage
- [ ] D) A model accessed through the OpenAI API

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) A model running on your own hardware (e.g., via Ollama)

**Explanation:** A local provider runs the model on the developer's machine or on-premise server, using tools like Ollama or llama.cpp. This avoids API costs and keeps data private during development.
- **Why others are wrong:**
  - B) Google Cloud-hosted models are cloud providers, not local.
  - C) Storing a model in Cloud Storage does not make it a local provider.
  - D) OpenAI API is a cloud-based provider.
</details>

---

### 6. When swapping from OpenAI to Vertex AI, which part of the system usually changes?
- [ ] A) The entire application codebase
- [ ] B) The provider implementation and configuration (credentials, model names)
- [ ] C) The database schema
- [ ] D) The frontend UI

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) The provider implementation and configuration (credentials, model names)

**Explanation:** Only the provider class (SDK calls) and environment configuration (API keys, project IDs, model names) change. The business logic, calling code, and interface contract remain unchanged.
- **Why others are wrong:**
  - A) If the entire codebase changes, the provider is not truly swappable.
  - C) Database schema is unrelated to LLM provider changes.
  - D) The frontend does not interact with the LLM provider directly.
</details>

---

### 7. Which of the following best describes the Adapter pattern in this context?
- [ ] A) A pattern that speeds up API calls
- [ ] B) A pattern for caching model responses
- [ ] C) A wrapper that translates a provider's native API into the common interface
- [ ] D) A pattern for load balancing across providers

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) A wrapper that translates a provider's native API into the common interface

**Explanation:** The Adapter pattern wraps a provider's unique SDK (e.g., OpenAI's `ChatCompletion.create()`, Vertex AI's `GenerativeModel.generate_content()`) and exposes it through the application's common `ModelProvider` interface. Each adapter handles the translation between the common contract and the provider-specific implementation.
- **Why others are wrong:**
  - A) Adapters do not affect call speed.
  - B) Caching is a separate concern (e.g., Redis, in-memory cache).
  - D) Load balancing distributes traffic; adapters translate interfaces.
</details>

---

### 8. What method would you expect in a generic model provider interface?
- [ ] A) `train_model()`
- [ ] B) `deploy_endpoint()`
- [ ] C) `create_dataset()`
- [ ] D) `generate(prompt)`

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) `generate(prompt)`

**Explanation:** A generic provider interface abstracts the core LLM capability: text generation from a prompt. Methods like `generate()`, `complete()`, or `predict()` are the standard contract. Training, deployment, and dataset management are platform-specific operations that do not belong in the common interface.
- **Why others are wrong:**
  - A) Model training is a platform-specific operation, not a common provider method.
  - B) Endpoint deployment is infrastructure management, not inference.
  - C) Dataset creation is a data pipeline operation.
</details>

---

### 9. Which environment variable might be used to select the active model provider?
- [ ] A) `MODEL_PROVIDER`
- [ ] B) `DATABASE_URL`
- [ ] C) `PORT`
- [ ] D) `LOG_LEVEL`

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) `MODEL_PROVIDER`

**Explanation:** An environment variable like `MODEL_PROVIDER` (with values like `openai`, `vertex`, `local`) is the standard way to configure which provider the factory creates at runtime. This allows different environments to use different providers without code changes.
- **Why others are wrong:**
  - B) `DATABASE_URL` configures database connections, not LLM providers.
  - C) `PORT` configures the HTTP listen port.
  - D) `LOG_LEVEL` configures logging verbosity.
</details>

---

### 10. If a provider fails at runtime, the best practice is to:
- [ ] A) Crash the application immediately
- [ ] B) Ignore the error and return empty results
- [ ] C) Retry with backoff, then fall back to an alternative provider
- [ ] D) Switch to a different programming language

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Retry with backoff, then fall back to an alternative provider

**Explanation:** Robust error handling for provider failures includes retrying transient errors with exponential backoff, then switching to a fallback provider if retries are exhausted. This provides resilience without downtime.
- **Why others are wrong:**
  - A) Crashing provides no resilience; users experience total failure.
  - B) Silently returning empty results misleads users and hides problems.
  - D) This is not a viable runtime response to an API failure.
</details>

---

### 11. A Vertex AI provider implementation would most likely require:
- [ ] A) An OpenAI API key
- [ ] B) A GCP project ID and authentication credentials
- [ ] C) A Docker container
- [ ] D) A local GPU

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) A GCP project ID and authentication credentials

**Explanation:** Vertex AI requires a GCP project ID, a region (e.g., `us-central1`), and authentication via a service account or application default credentials (`GOOGLE_APPLICATION_CREDENTIALS`). These are provider-specific configuration details encapsulated within the `VertexAIProvider` class.
- **Why others are wrong:**
  - A) OpenAI API keys are for the OpenAI provider, not Vertex AI.
  - C) Docker is for containerization, not for making API calls to Vertex AI.
  - D) Vertex AI runs inference on Google's infrastructure; no local GPU is needed.
</details>

---

### 12. In a swappable provider design, the business logic should depend on:
- [ ] A) The OpenAI SDK directly
- [ ] B) The database layer
- [ ] C) The frontend framework
- [ ] D) The abstract interface, not any specific provider

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) The abstract interface, not any specific provider

**Explanation:** This is the Dependency Inversion Principle. Business logic imports and depends on the `ModelProvider` interface (abstraction), never on concrete implementations like `OpenAIProvider` or `VertexAIProvider`. This keeps the business logic decoupled and testable.
- **Why others are wrong:**
  - A) Depending on a specific SDK creates vendor lock-in and breaks swappability.
  - B) The database layer is unrelated to LLM provider abstraction.
  - C) The frontend framework is a presentation concern.
</details>

---

### 13. Which of the following ensures two providers behave the same from the app's perspective?
- [ ] A) Both implementing the same interface with identical method signatures and return types
- [ ] B) Using the same programming language
- [ ] C) Deploying both on the same cloud
- [ ] D) Using the same API key

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) Both implementing the same interface with identical method signatures and return types

**Explanation:** Interface conformance is the mechanism that guarantees behavioral consistency. If both providers implement `generate(prompt: str) -> str` with the same signature and return type, the calling code cannot tell them apart, which is the goal of the abstraction.
- **Why others are wrong:**
  - B) Language choice does not guarantee behavioral consistency.
  - C) Cloud platform is irrelevant to interface conformance.
  - D) Different providers have different authentication mechanisms; API keys are provider-specific.
</details>

---

### 14. Swappable model providers are beneficial because they:
- [ ] A) Make models more accurate
- [ ] B) Reduce the number of lines of code
- [ ] C) Prevent vendor lock-in and enable flexibility in choosing the best provider
- [ ] D) Automatically train models

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Prevent vendor lock-in and enable flexibility in choosing the best provider

**Explanation:** The primary benefit is organizational flexibility: you can switch providers based on cost, quality, latency, or compliance requirements without rewriting application code. Additional benefits include easier testing (use local provider in dev) and resilience (fallback to another provider on failure).
- **Why others are wrong:**
  - A) Model accuracy depends on the model, not the abstraction layer.
  - B) The abstraction may add a small amount of code for the interface and factory.
  - D) Training is not part of the provider interface contract.
</details>

---

### 15. When switching from a local model to a cloud provider like OpenAI, the code change is usually:
- [ ] A) Rewriting the entire application
- [ ] B) Changing an environment variable or configuration value
- [ ] C) Switching to a different programming language
- [ ] D) Rebuilding the database

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) Changing an environment variable or configuration value

**Explanation:** In a well-designed swappable provider system, switching providers requires only a configuration change (e.g., `MODEL_PROVIDER=openai` instead of `MODEL_PROVIDER=local`) and setting the appropriate credentials. No code changes are needed.
- **Why others are wrong:**
  - A) If a full rewrite is needed, the provider is not truly swappable.
  - C) Language has nothing to do with provider switching.
  - D) The database is unrelated to LLM provider configuration.
</details>

---

### 16. Which of the following is NOT a typical step in implementing a swappable provider?
- [ ] A) Define a common interface
- [ ] B) Implement adapter classes for each provider
- [ ] C) Use a factory to instantiate the correct provider
- [ ] D) Hardcode the provider selection in business logic

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) Hardcode the provider selection in business logic

**Explanation:** Hardcoding provider selection defeats the purpose of a swappable design. The correct approach is to use configuration (environment variables) and a factory pattern to select the provider at runtime.
- **Why others are wrong:**
  - A) Defining a common interface is the foundational step.
  - B) Adapter classes translate each provider's native API into the common interface.
  - C) A factory centralizes provider instantiation based on configuration.
</details>

---

## Part 2: True/False

### 17. Vertex AI can only be used for custom model training, not for accessing pre-trained foundation models.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Vertex AI provides access to Google's foundation models (Gemini, PaLM) via the Model Garden and Generative AI APIs, in addition to custom model training and AutoML capabilities.
</details>

---

### 18. In a swappable provider design, each provider class should encapsulate its own authentication logic.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Provider-specific details like API keys, service account credentials, and endpoint URLs should be handled internally by each provider class. The calling code should not need to know how authentication works for any specific provider.
</details>

---

### 19. The Adapter pattern and the Factory pattern serve the same purpose in swappable provider design.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** They serve complementary but different purposes. The **Adapter pattern** translates a provider's native API into the common interface. The **Factory pattern** selects and instantiates the correct provider based on configuration. Both are needed for a complete swappable design.
</details>

---

### 20. A swappable provider system requires all providers to use the same underlying model architecture.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Providers can use completely different model architectures (GPT, Gemini, Llama, etc.). The swappable interface only requires that the input/output contract is the same. The internal implementation details are hidden behind the abstraction.
</details>

---
