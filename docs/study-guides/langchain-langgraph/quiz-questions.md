# Weekly Knowledge Check: LangChain and LangGraph

> MCQ and True/False covering LangChain components, prompt templates, chains, output parsing, and LangGraph

---

## Part 1: Multiple Choice

### 1. Which of the following is NOT a core component of LangChain?
- [ ] A) Prompt Templates
- [ ] B) Document Loaders
- [ ] C) Neural Network Layers
- [ ] D) Output Parsers

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Neural Network Layers

**Explanation:** LangChain is a framework for orchestrating LLM-powered applications, not for building neural networks. Its core components include Prompt Templates, Document Loaders, Output Parsers, Chains, and Agents. Neural network layers belong to deep learning frameworks like PyTorch or TensorFlow.
- **Why others are wrong:**
  - A) Prompt Templates are a core component for dynamic prompt construction.
  - B) Document Loaders are a core component for ingesting external data.
  - D) Output Parsers are a core component for structured response handling.
</details>

---

### 2. LangChain is primarily used to:
- [ ] A) Train deep learning models from scratch
- [ ] B) Build applications powered by LLMs with external data and tools
- [ ] C) Design database schemas
- [ ] D) Create frontend user interfaces

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) Build applications powered by LLMs with external data and tools

**Explanation:** LangChain provides the framework for connecting LLMs with data sources, tools, memory, and workflows. It does not train models; it orchestrates existing models into functional applications.
- **Why others are wrong:**
  - A) Model training is handled by frameworks like PyTorch, TensorFlow, or platforms like Vertex AI.
  - C) Database schema design is a data engineering task.
  - D) Frontend development uses frameworks like React, Vue, or Angular.
</details>

---

### 3. What is the main purpose of Prompt Templates in LangChain?
- [ ] A) To fine-tune LLMs
- [ ] B) To cache LLM responses
- [ ] C) To deploy models
- [ ] D) To dynamically construct prompts with variables

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) To dynamically construct prompts with variables

**Explanation:** Prompt Templates define reusable prompt structures with placeholders (e.g., `{topic}`, `{context}`) that are filled in at runtime. This separates prompt logic from prompt content, making prompts testable, maintainable, and reusable.
- **Why others are wrong:**
  - A) Fine-tuning is a model training process, not a prompt management feature.
  - B) Caching is a performance optimization, not a template function.
  - C) Deployment is an infrastructure concern.
</details>

---

### 4. Which problem does output parsing solve in LangChain?
- [ ] A) Converting unstructured LLM responses into structured data formats
- [ ] B) Slow model response times
- [ ] C) Reducing API costs
- [ ] D) Managing conversation history

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) Converting unstructured LLM responses into structured data formats

**Explanation:** Output parsers transform free-form text LLM responses into structured formats like JSON, Pydantic objects, or typed lists. They add format instructions to prompts and validate/parse the response, handling retries if the output does not conform.
- **Why others are wrong:**
  - B) Response speed is a model/infrastructure concern, not an output parsing concern.
  - C) API cost reduction involves caching, prompt optimization, or model selection.
  - D) Conversation history is managed by memory components and checkpointers.
</details>

---

### 5. Which LangChain component is responsible for loading external data sources?
- [ ] A) Output Parsers
- [ ] B) Prompt Templates
- [ ] C) Document Loaders
- [ ] D) LLM Chains

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Document Loaders

**Explanation:** Document Loaders ingest data from external sources (PDFs, web pages, databases, APIs) and convert them into LangChain `Document` objects for use in retrieval, summarization, and other workflows.
- **Why others are wrong:**
  - A) Output Parsers handle LLM response formatting, not data ingestion.
  - B) Prompt Templates manage prompt construction, not data loading.
  - D) LLM Chains combine prompts and models for execution, not data loading.
</details>

---

### 6. Multi-query retrieval mainly helps to:
- [ ] A) Speed up vector search
- [ ] B) Generate multiple rephrased queries to improve recall
- [ ] C) Reduce the number of API calls
- [ ] D) Compress document sizes

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) Generate multiple rephrased queries to improve recall

**Explanation:** Multi-query retrieval uses an LLM to generate several rephrased versions of the original query, runs each against the vector store, and merges the results. This improves recall by capturing documents that match different phrasings of the same intent.
- **Why others are wrong:**
  - A) Multi-query actually increases search time since multiple queries are run.
  - C) It increases API calls (one per generated query variant).
  - D) Document compression is handled by compression retrievers, not multi-query.
</details>

---

### 7. What does an LLMChain do?
- [ ] A) Trains an LLM on new data
- [ ] B) Stores LLM responses in a database
- [ ] C) Monitors LLM performance metrics
- [ ] D) Combines a prompt template with an LLM and executes them together

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) Combines a prompt template with an LLM and executes them together

**Explanation:** An LLMChain is the most basic chain. It takes input variables, formats them into a prompt using a template, sends the formatted prompt to an LLM, and returns the response. It encapsulates the standard prompt-to-response workflow.
- **Why others are wrong:**
  - A) LLMChain performs inference, not training.
  - B) Response storage is a persistence concern, not a chain function.
  - C) Performance monitoring is handled by tracing tools like LangSmith.
</details>

---

### 8. Which chain executes steps one after another using outputs as inputs?
- [ ] A) ParallelChain
- [ ] B) RouterChain
- [ ] C) SequentialChain
- [ ] D) TransformChain

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) SequentialChain

**Explanation:** SequentialChain runs steps in order, passing each step's output as the input to the next step. This creates a pipeline where results flow through multiple processing stages.
- **Why others are wrong:**
  - A) ParallelChain would run steps concurrently, not sequentially.
  - B) RouterChain directs input to different chains based on conditions.
  - D) TransformChain applies a transformation function to data, not sequential execution.
</details>

---

### 9. LangGraph is mainly designed for:
- [ ] A) Building stateful, graph-based agent workflows
- [ ] B) Training graph neural networks
- [ ] C) Visualizing data as charts
- [ ] D) Managing Git repositories

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) Building stateful, graph-based agent workflows

**Explanation:** LangGraph extends LangChain by providing a framework for building agent workflows as directed graphs with nodes (processing steps), edges (transitions), and state management. It supports cycles, conditional routing, and human-in-the-loop patterns.
- **Why others are wrong:**
  - B) Graph neural networks are a deep learning concept, not related to LangGraph.
  - C) Data visualization is handled by libraries like Matplotlib or Plotly.
  - D) Git management is handled by Git clients and platforms.
</details>

---

### 10. Compared to LangChain, LangGraph focuses more on:
- [ ] A) Simpler chain-based workflows
- [ ] B) Database operations
- [ ] C) Frontend rendering
- [ ] D) Explicit state management and cyclical graph-based workflows

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) Explicit state management and cyclical graph-based workflows

**Explanation:** While LangChain focuses on composable chains and agents, LangGraph emphasizes fine-grained control flow through graph structures with explicit state, conditional edges, cycles (loops), and human-in-the-loop capabilities. LangGraph gives developers more control over complex orchestration patterns.
- **Why others are wrong:**
  - A) Simpler chain-based workflows are LangChain's focus, not LangGraph's.
  - B) Database operations are not a primary focus of either framework.
  - C) Frontend rendering is outside the scope of both frameworks.
</details>

---

## Part 2: True/False

### 11. LangChain can only work with the OpenAI API.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** LangChain supports many LLM providers including OpenAI, Google (Vertex AI/Gemini), Anthropic (Claude), Ollama (local models), Hugging Face, and more. Provider support is modular through separate integration packages (e.g., `langchain-openai`, `langchain-google-genai`).
</details>

---

### 12. Output Parsers in LangChain can add format instructions to the prompt automatically.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Output Parsers provide a `get_format_instructions()` method that returns text describing the expected output format. This text is injected into the prompt to guide the LLM's response structure.
</details>

---

### 13. A SequentialChain requires all steps to use the same LLM.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Each step in a SequentialChain can use a different LLM, tool, or processing function. Steps are independent units that only need compatible input/output formats to connect.
</details>

---

### 14. LangGraph requires LangChain as a dependency.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** LangGraph is built on top of LangChain and uses its core abstractions (messages, tools, models). The `langgraph` package depends on `langchain-core` components.
</details>

---
