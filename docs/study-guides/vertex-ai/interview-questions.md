# Interview Questions: Vertex AI

> Vertex AI platform, swappable model provider design, Factory/Adapter patterns, and provider configuration

---

## Beginner (Foundational)

### Q1: What is Vertex AI and what is it primarily used for?
**Keywords:** ML Platform, Training, Deployment, Managed, Google Cloud
<details>
<summary>Click to Reveal Answer</summary>

Vertex AI is Google Cloud's unified ML platform for building, training, and deploying machine learning models. It provides managed services for the entire ML lifecycle: data preparation, model training (custom and AutoML), model evaluation, deployment to endpoints, and monitoring. It also provides access to Google's foundation models (PaLM, Gemini) via APIs for generative AI applications.
</details>

---

### Q2: What is a swappable model provider interface and why is it important?
**Keywords:** Abstraction, Interface, Decoupling, Flexibility, Vendor Lock-in
<details>
<summary>Click to Reveal Answer</summary>

A swappable model provider interface is an abstraction layer that defines a common contract (interface) for interacting with different LLM providers (e.g., OpenAI, Vertex AI, local models). It is important because it **decouples business logic from a specific provider**, allowing you to switch between providers without changing application code. This prevents vendor lock-in, enables cost optimization, and supports testing with local models before deploying with cloud providers.
</details>

---

### Q3: What method would you expect in a generic model provider interface?
**Keywords:** generate, predict, complete, Standard Method, Contract
<details>
<summary>Click to Reveal Answer</summary>

A generic model provider interface would typically include methods like:
- `generate(prompt: str) -> str` — the primary method for text generation
- `generate_with_config(prompt: str, config: dict) -> str` — generation with provider-specific parameters
- `stream(prompt: str) -> Iterator[str]` — streaming token-by-token responses

The exact method names vary, but the key is that **all providers implement the same interface**, so calling code uses the same method regardless of which provider is active behind the abstraction.
</details>

---

### Q4: What is a local LLM provider?
**Keywords:** Local, On-device, Ollama, Self-hosted, Privacy
<details>
<summary>Click to Reveal Answer</summary>

A local LLM provider refers to running a language model on your own hardware (laptop, on-premise server) rather than calling a cloud API. Common tools include **Ollama**, **llama.cpp**, and **vLLM**. Local providers are used for development and testing (no API costs), working with sensitive data (no data leaves the network), offline environments, and rapid prototyping without API rate limits. Trade-off: local models are generally smaller and less capable than cloud-hosted options.
</details>

---

### Q5: What is the main purpose of a swappable model provider interface?
**Keywords:** Abstraction, Flexibility, Provider Independence, Single Interface
<details>
<summary>Click to Reveal Answer</summary>

The main purpose is to allow the application to **interact with any LLM provider through a single, consistent interface**. This means the business logic does not need to know or care whether it is talking to OpenAI, Vertex AI, Anthropic, or a local model. Benefits include easier testing, cost flexibility, provider migration, and the ability to choose the best model for each use case without rewriting application code.
</details>

---

## Intermediate (Application)

### Q6: How does the Factory pattern apply to swappable model providers?
**Keywords:** Factory, Instantiation, Configuration, Runtime Selection
**Hint:** Think about centralizing how provider objects are created.
<details>
<summary>Click to Reveal Answer</summary>

In a swappable provider system, the Factory pattern **centralizes the creation of provider instances**. Instead of application code directly instantiating `OpenAIProvider()` or `VertexAIProvider()`, a factory function reads a configuration value (e.g., environment variable) and returns the appropriate provider instance. Example:
```python
def get_provider(provider_name: str) -> ModelProvider:
    if provider_name == "openai":
        return OpenAIProvider(api_key=os.getenv("OPENAI_API_KEY"))
    elif provider_name == "vertex":
        return VertexAIProvider(project=os.getenv("GCP_PROJECT"))
    elif provider_name == "local":
        return OllamaProvider(base_url="http://localhost:11434")
```
The calling code only needs: `provider = get_provider(os.getenv("MODEL_PROVIDER"))`.
</details>

---

### Q7: When swapping from OpenAI to Vertex AI, which part of the system usually changes?
**Keywords:** Provider Implementation, Configuration, API Keys, Endpoint
**Hint:** Think about what stays the same vs. what is different.
<details>
<summary>Click to Reveal Answer</summary>

The parts that change are:
1. **Provider implementation class** — different SDK calls (OpenAI SDK vs. Google Cloud AI Platform SDK)
2. **Configuration/credentials** — API keys for OpenAI vs. GCP project ID + service account for Vertex AI
3. **Environment variables** — e.g., `OPENAI_API_KEY` replaced with `GOOGLE_APPLICATION_CREDENTIALS`
4. **Model names** — e.g., `gpt-4` vs. `gemini-1.5-pro`

What stays the same: the **interface contract**, the **business logic**, the **calling code**, and the **factory/selector mechanism**. This is the entire point of the abstraction.
</details>

---

### Q8: SCENARIO — You want to test your application locally with Ollama but deploy to production with Vertex AI. How would you design this?
**Keywords:** Environment Variable, Factory, Interface, Configuration
<details>
<summary>Click to Reveal Answer</summary>

Design:
1. **Define a `ModelProvider` interface** with `generate()` and `stream()` methods.
2. **Implement two providers**: `OllamaProvider` (calls localhost Ollama API) and `VertexAIProvider` (calls Vertex AI SDK).
3. **Use an environment variable** like `MODEL_PROVIDER=local` for development and `MODEL_PROVIDER=vertex` for production.
4. **Factory function** reads the env var and returns the appropriate provider.
5. **Business logic** only depends on the `ModelProvider` interface, never on a specific implementation.
6. In local `.env`: `MODEL_PROVIDER=local`, in Cloud Run env vars: `MODEL_PROVIDER=vertex`.

This setup means zero code changes between environments — only configuration changes.
</details>

---

### Q9: What is required for a provider to be swappable?
**Keywords:** Common Interface, Method Signature, Return Type, Consistent Contract
<details>
<summary>Click to Reveal Answer</summary>

For a provider to be swappable, it must:
1. **Implement the same interface** (abstract base class or protocol) as all other providers
2. **Use the same method signatures** — same parameter names and types
3. **Return the same output format** — consistent return types across providers
4. **Handle configuration internally** — provider-specific setup (API keys, endpoints, model names) must be encapsulated within the provider class, not leaked to calling code
5. **Throw consistent exceptions** — error handling should follow a common pattern

If any provider has unique methods or return types not shared by others, the abstraction breaks.
</details>

---

### Q10: If a provider fails at runtime, what is the best practice for error handling?
**Keywords:** Fallback, Retry, Logging, Graceful Degradation, Circuit Breaker
<details>
<summary>Click to Reveal Answer</summary>

Best practices:
1. **Retry with backoff** — transient errors (network, rate limits) should be retried with exponential backoff.
2. **Fallback provider** — if the primary provider is down, automatically switch to a backup (e.g., Vertex AI primary, OpenAI fallback).
3. **Circuit breaker pattern** — after N consecutive failures, stop calling the failing provider and switch to the fallback to avoid cascading failures.
4. **Structured logging** — log the error details, provider name, and request context for debugging.
5. **Graceful degradation** — return a helpful error message to the user rather than crashing.
6. **Alert on failures** — notify the team via monitoring/alerting when a provider starts failing.
</details>

---

## Advanced (Deep Dive)

### Q11: SCENARIO — In a swappable provider design, the business logic depends on which layer? Explain the dependency inversion principle in this context.
<details>
<summary>Click to Reveal Answer</summary>

The business logic should depend on the **abstraction (interface)**, not on any concrete provider implementation. This is the **Dependency Inversion Principle** — high-level modules (business logic) should not depend on low-level modules (provider implementations); both should depend on abstractions.

In practice:
- `app.py` imports `ModelProvider` (interface) — never `OpenAIProvider` or `VertexAIProvider` directly.
- The factory function handles instantiation and returns the interface type.
- Business logic calls `provider.generate(prompt)` without knowing the underlying implementation.
- This enables testing with mock providers, swapping providers without code changes, and parallel development of new providers.
</details>

---
