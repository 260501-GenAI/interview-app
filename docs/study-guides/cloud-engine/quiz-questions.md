# Weekly Knowledge Check: Cloud Engine (Compute Engine)

> MCQ and True/False covering Compute Engine fundamentals, VM types, and scaling

---

## Part 1: Multiple Choice

### 1. What type of cloud service model does Compute Engine represent?
- [ ] A) SaaS (Software as a Service)
- [ ] B) PaaS (Platform as a Service)
- [ ] C) IaaS (Infrastructure as a Service)
- [ ] D) FaaS (Function as a Service)

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) IaaS (Infrastructure as a Service)

**Explanation:** Compute Engine provides virtual machines where you manage the OS, runtime, and applications. This is the defining characteristic of IaaS — the provider manages the physical hardware and virtualization layer while you control everything above.
- **Why others are wrong:**
  - A) SaaS provides fully managed applications (e.g., Gmail, Google Docs).
  - B) PaaS manages the runtime and OS for you (e.g., App Engine).
  - D) FaaS runs individual functions on demand (e.g., Cloud Functions).
</details>

---

### 2. Which machine type family should you choose for ML model training with GPUs?
- [ ] A) E2 (General-Purpose)
- [ ] B) C2 (Compute-Optimized)
- [ ] C) M2 (Memory-Optimized)
- [ ] D) A2 (Accelerator-Optimized)

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) A2 (Accelerator-Optimized)

**Explanation:** A2 machine types are designed for GPU workloads, including ML training and inference. They come with attached NVIDIA GPUs and high-bandwidth networking optimized for parallel processing.
- **Why others are wrong:**
  - A) E2 instances are cost-effective general workloads without GPU support.
  - B) C2 instances optimize CPU performance but do not include GPUs.
  - C) M2 instances provide large memory but are not GPU-focused.
</details>

---

### 3. What happens to data on a local SSD when a Compute Engine instance is stopped?
- [ ] A) Data is lost
- [ ] B) Data is automatically backed up to Cloud Storage
- [ ] C) Data persists until the instance is deleted
- [ ] D) Data is moved to a persistent disk

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** A) Data is lost

**Explanation:** Local SSDs are physically attached to the host machine and provide high-performance ephemeral storage. When the VM is stopped, terminated, or preempted, all data on local SSDs is permanently lost. For durable storage, use persistent disks.
- **Why others are wrong:**
  - B) There is no automatic backup mechanism for local SSDs.
  - C) Data does not persist past the VM's running lifecycle.
  - D) There is no automatic migration to persistent disks.
</details>

---

### 4. What is the primary benefit of using Spot VMs (preemptible instances)?
- [ ] A) Guaranteed availability
- [ ] B) Significantly lower cost (up to 60-90% discount)
- [ ] C) Higher performance than standard VMs
- [ ] D) Built-in HA (High Availability)

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** B) Significantly lower cost (up to 60-90% discount)

**Explanation:** Spot VMs use excess Compute Engine capacity at steep discounts. The trade-off is that Google can reclaim them at any time with a 30-second warning. They are ideal for fault-tolerant batch processing and ML training workloads with checkpointing.
- **Why others are wrong:**
  - A) Spot VMs have no availability guarantee; they can be preempted at any time.
  - C) Performance is identical to standard VMs of the same machine type.
  - D) Spot VMs are the opposite of HA; they require you to build fault tolerance.
</details>

---

### 5. What does a Managed Instance Group (MIG) use to automatically replace failed VMs?
- [ ] A) Cloud Scheduler
- [ ] B) Cloud Functions triggers
- [ ] C) Health checks and autohealing
- [ ] D) Manual admin intervention

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** C) Health checks and autohealing

**Explanation:** MIGs use configurable health checks (HTTP, HTTPS, or TCP) to monitor instance status. When an instance fails a health check, the MIG's autohealing policy automatically deletes and recreates it from the instance template.
- **Why others are wrong:**
  - A) Cloud Scheduler is for cron-like job scheduling, not instance management.
  - B) Cloud Functions are event-driven compute, not instance monitoring.
  - D) MIG autohealing is automatic, not manual.
</details>

---

### 6. Which scenario is best suited for Compute Engine rather than Cloud Run?
- [ ] A) A stateless REST API with variable traffic
- [ ] B) A webhook handler that processes 10 requests per day
- [ ] C) A containerized microservice with automatic scaling
- [ ] D) A GPU-accelerated ML training job running for 72 hours

<details>
<summary><b>Click for Solution</b></summary>

**Correct Answer:** D) A GPU-accelerated ML training job running for 72 hours

**Explanation:** Cloud Run does not support GPU attachment and has request timeout limits. Long-running GPU workloads require Compute Engine where you can attach GPUs, configure CUDA drivers, and run processes without timeout restrictions.
- **Why others are wrong:**
  - A) Stateless REST APIs with variable traffic are ideal for Cloud Run's auto-scaling.
  - B) Low-traffic webhooks benefit from Cloud Run's scale-to-zero to avoid paying for idle VMs.
  - C) Containerized microservices with auto-scaling is exactly what Cloud Run is designed for.
</details>

---

## Part 2: True/False

### 7. Compute Engine persistent disks can be attached to multiple VMs simultaneously in read-only mode.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** Persistent disks support multi-reader mode, where a single disk can be attached to multiple VMs in read-only mode. This is useful for sharing datasets or static assets across instances.
</details>

---

### 8. An instance template can be modified after creation.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Instance templates are immutable. To change the configuration, you must create a new template version and update the MIG to use it (via a rolling update).
</details>

---

### 9. Compute Engine VMs always run Linux operating systems.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** False

**Explanation:** Compute Engine supports both Linux (Debian, Ubuntu, CentOS, etc.) and Windows Server images. You can also use custom images with other operating systems.
</details>

---

### 10. Autoscaling in a MIG can be based on custom Cloud Monitoring metrics, not just CPU utilization.
<details>
<summary><b>Click for Solution</b></summary>

**Answer:** True

**Explanation:** MIG autoscaling policies can use CPU utilization, HTTP load balancing capacity, Pub/Sub queue depth, or any custom Cloud Monitoring metric. This allows scaling based on application-specific signals like queue length or active sessions.
</details>

---
