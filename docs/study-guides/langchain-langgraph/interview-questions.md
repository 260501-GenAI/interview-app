# Interview Questions: LangChain and LangGraph

> Foundational concepts: LangChain components, prompt templates, chains, output parsing, and LangGraph

---

## Beginner (Foundational)

### Q1: What is LangChain and what is it primarily used for?
**Keywords:** Framework, LLMs, Chaining, Applications, Orchestration
<details>
<summary>Click to Reveal Answer</summary>

LangChain is a framework for building applications powered by large language models (LLMs). It is primarily used to **connect LLMs with external data sources, tools, and workflows** through composable components. It provides abstractions for prompt management, output parsing, document loading, retrieval, chains, and agent orchestration. The goal is to make LLM-powered applications more structured, reliable, and maintainable.
</details>

---

### Q2: What is the main purpose of Prompt Templates in LangChain?
**Keywords:** Dynamic, Variables, Reusable, Formatting, Parameterized
<details>
<summary>Click to Reveal Answer</summary>

Prompt Templates allow you to **dynamically construct prompts with variables** rather than hardcoding strings. They define the prompt structure with placeholders (e.g., `{topic}`, `{context}`) that are filled in at runtime. This makes prompts reusable, testable, and maintainable. Example: a template like `"Explain {topic} in simple terms"` can be reused for any topic by passing different variable values.
</details>

---

### Q3: What does an LLMChain do?
**Keywords:** Prompt, Model, Execution, Chain, Combination
<details>
<summary>Click to Reveal Answer</summary>

An LLMChain is the simplest chain in LangChain. It **combines a prompt template with an LLM and executes them together**. You pass input variables, the chain formats the prompt using the template, sends it to the LLM, and returns the response. It encapsulates the prompt-to-response workflow into a single reusable unit.
</details>

---

### Q4: Which LangChain component is responsible for loading external data sources?
**Keywords:** Document Loaders, Data Ingestion, PDF, Web, Database
<details>
<summary>Click to Reveal Answer</summary>

**Document Loaders** are responsible for loading external data sources into LangChain. They support a wide variety of formats: PDFs, web pages, CSV files, databases, APIs, Google Drive, Notion, and more. Each loader converts the source data into LangChain `Document` objects with content and metadata, which can then be used for retrieval-augmented generation (RAG) or other workflows.
</details>

---

### Q5: Which problem does output parsing solve in LangChain?
**Keywords:** Structured Output, JSON, Validation, Formatting, Reliability
<details>
<summary>Click to Reveal Answer</summary>

Output parsing solves the problem of **converting unstructured LLM text responses into structured, predictable data formats**. LLMs return free-form text by default, but applications often need structured data (JSON, lists, typed objects). Output parsers define the expected format, add format instructions to the prompt, and parse the LLM's response into the desired structure, handling validation and retry logic if the output does not conform.
</details>

---

## Intermediate (Application)

### Q6: What is multi-query retrieval and how does it improve RAG performance?
**Keywords:** Multiple Queries, Diverse Results, Recall, Rephrasing
**Hint:** Think about what happens when a single query misses relevant documents.
<details>
<summary>Click to Reveal Answer</summary>

Multi-query retrieval generates **multiple rephrased versions of the user's query** using an LLM, then runs each rephrased query against the vector store separately. The results from all queries are merged and deduplicated. This mainly helps to **improve recall** — a single query might miss relevant documents due to phrasing differences, but multiple query variants are more likely to surface all relevant results. It addresses the limitation that embedding similarity is sensitive to exact wording.
</details>

---

### Q7: Which chain executes steps one after another, using outputs as inputs?
**Keywords:** Sequential, Pipeline, Output-to-Input, Chaining
<details>
<summary>Click to Reveal Answer</summary>

The **SequentialChain** executes steps in order, passing the output of each step as the input to the next. This creates a pipeline where step 1's result feeds into step 2, step 2's result feeds into step 3, and so on. Example: a research chain might first summarize a document, then extract key topics from the summary, then generate quiz questions from the topics. Each step's output becomes the next step's input.
</details>

---

### Q8: What is the difference between LangChain and LangGraph in terms of focus?
**Keywords:** Linear Chains, Graph Workflows, State, Cyclical, Control Flow
<details>
<summary>Click to Reveal Answer</summary>

**LangChain** focuses on composable chains and agents — linear or branching sequences of LLM calls, tool use, and data processing. **LangGraph** focuses more on **stateful, graph-based workflows** with nodes, edges, conditional routing, and cyclical execution. LangGraph provides explicit state management, human-in-the-loop patterns, and the ability to build complex multi-step processes with loops, branches, and persistent memory. Use LangChain for simpler chain-based tasks and LangGraph for complex orchestration requiring fine-grained control flow.
</details>

---

## Advanced (Deep Dive)

### Q9: SCENARIO — You are building a RAG pipeline that sometimes retrieves irrelevant documents. Design an approach using LangChain components to improve relevance.
<details>
<summary>Click to Reveal Answer</summary>

Multi-layered approach:
1. **Multi-query retrieval** — generate multiple query variants to improve recall.
2. **Contextual compression** — use `ContextualCompressionRetriever` to filter and compress retrieved documents, removing irrelevant passages.
3. **Re-ranking** — apply a cross-encoder or LLM-based re-ranker to score relevance of each retrieved document against the original query.
4. **Metadata filtering** — add metadata to documents during indexing and filter by category, date, or source during retrieval.
5. **Prompt engineering** — instruct the LLM to acknowledge when retrieved context is not relevant: "If the documents do not contain the answer, say so clearly."
6. **Evaluation** — use LangSmith to trace retrieval results and identify failure patterns.
</details>

---
