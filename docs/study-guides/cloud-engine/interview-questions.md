# Interview Questions: Cloud Engine (Compute Engine)

> GCP Compute Engine concepts, VM management, and when to use VMs vs serverless

---

## Beginner (Foundational)

### Q1: What is Google Compute Engine?
**Keywords:** Virtual Machines, IaaS, Custom Hardware, Scalability
<details>
<summary>Click to Reveal Answer</summary>

Google Compute Engine is GCP's Infrastructure-as-a-Service (IaaS) offering. It provides virtual machines (VMs) that run on Google's infrastructure. You have full control over the operating system, installed software, and network configuration. Compute Engine is suitable for workloads that require specific OS configurations, GPU access, or persistent long-running processes.
</details>

---

### Q2: What are the main VM machine type families in Compute Engine?
**Keywords:** General-Purpose, Compute-Optimized, Memory-Optimized, Accelerator
<details>
<summary>Click to Reveal Answer</summary>

Compute Engine offers several machine type families:
- **General-Purpose (E2, N2, N2D)** — balanced CPU/memory for most workloads
- **Compute-Optimized (C2, C2D)** — high per-core performance for compute-intensive tasks
- **Memory-Optimized (M2, M3)** — large memory for in-memory databases and analytics
- **Accelerator-Optimized (A2, G2)** — attached GPUs for ML training and inference

Custom machine types also allow you to specify exact vCPU and memory combinations.
</details>

---

### Q3: What is a Compute Engine instance template?
**Keywords:** Template, Reusability, Configuration, Instance Groups
**Hint:** Think about how you would create multiple identical VMs.
<details>
<summary>Click to Reveal Answer</summary>

An instance template is a reusable resource that defines the properties of a VM instance: machine type, boot disk image, network settings, startup scripts, and metadata. Templates are used to create individual instances or managed instance groups (MIGs). They ensure consistency across deployments and are immutable — to change configuration, you create a new template version.
</details>

---

### Q4: What is the difference between a persistent disk and a local SSD in Compute Engine?
**Keywords:** Durability, Performance, Lifecycle, Attachment
<details>
<summary>Click to Reveal Answer</summary>

**Persistent Disks** are network-attached storage that survive VM deletion. They can be resized, snapshotted, and attached to other VMs. They come in standard (HDD), balanced, and SSD tiers. **Local SSDs** are physically attached to the host machine with much higher IOPS but are ephemeral — data is lost when the VM stops or is deleted. Use persistent disks for durable data and local SSDs for temporary high-performance scratch storage.
</details>

---

### Q5: What is a machine image and how does it differ from a disk snapshot?
**Keywords:** Full Backup, Snapshot, Configuration, Restore
<details>
<summary>Click to Reveal Answer</summary>

A **machine image** captures the entire VM configuration: disks, machine type, metadata, network interfaces, and IAM permissions. It is a complete backup used to recreate an identical VM. A **disk snapshot** captures only the contents of a single disk at a point in time. Snapshots are incremental and cheaper for regular backups, while machine images are better for full VM cloning or disaster recovery.
</details>

---

## Intermediate (Application)

### Q6: When should you choose Compute Engine over Cloud Run for deploying an application?
**Keywords:** Control, GPU, Long-Running, Stateful, Custom OS
**Hint:** Think about what Cloud Run cannot do.
<details>
<summary>Click to Reveal Answer</summary>

Choose Compute Engine when you need:
- **GPU or TPU access** for ML training
- **Custom OS or kernel-level configuration** (e.g., specific Linux distributions)
- **Long-running processes** that exceed Cloud Run's timeout limits
- **Stateful applications** with persistent local storage
- **Full network control** (custom firewall rules, VPN, static IPs)
- **Windows workloads** or legacy applications that cannot be containerized

Choose Cloud Run when your workload is stateless, containerized, and benefits from automatic scaling to zero.
</details>

---

### Q7: SCENARIO — You need to train an ML model that requires 4 GPUs and will run for 48 hours. How do you configure this on Compute Engine?
**Keywords:** Accelerator, Preemptible, Startup Script, Monitoring
<details>
<summary>Click to Reveal Answer</summary>

1. Create an instance with an **accelerator-optimized machine type** (A2 family) or attach GPUs to an N1 instance.
2. Select a **GPU-compatible image** (e.g., Deep Learning VM) with pre-installed CUDA drivers.
3. Consider using **Spot VMs** (preemptible) to reduce cost by up to 60-90%, but implement **checkpointing** in your training script since Spot VMs can be reclaimed.
4. Use a **startup script** to pull training code and data from Cloud Storage.
5. Configure **Cloud Monitoring** alerts for GPU utilization and instance health.
6. Attach a **persistent disk** to store model checkpoints that survive preemption.
</details>

---

### Q8: What is a Managed Instance Group (MIG) and how does autoscaling work?
**Keywords:** MIG, Autoscaling, Health Check, Load Balancer
<details>
<summary>Click to Reveal Answer</summary>

A Managed Instance Group (MIG) is a collection of identical VM instances created from an instance template. MIGs support:
- **Autoscaling** — automatically adds or removes instances based on CPU utilization, request rate, or custom metrics
- **Autohealing** — recreates unhealthy instances based on health check results
- **Rolling updates** — gradually replaces instances with a new template version
- **Load balancing integration** — distributes traffic across instances

You configure autoscaling policies with minimum/maximum instance counts and target utilization thresholds.
</details>

---

## Advanced (Deep Dive)

### Q9: SCENARIO — Your Compute Engine VM running a critical ML inference service goes down. Design a high-availability architecture to prevent this.
<details>
<summary>Click to Reveal Answer</summary>

High-availability architecture for Compute Engine:
1. **Regional MIG** — deploy instances across multiple zones within a region for zone-level fault tolerance.
2. **HTTP(S) Load Balancer** — distributes traffic and performs health checks. Unhealthy instances are removed from rotation automatically.
3. **Autohealing** — MIG recreates failed instances automatically based on health check responses.
4. **Instance template versioning** — enables rollback if a new version introduces instability.
5. **Persistent Disk snapshots** — scheduled snapshots for data recovery.
6. **Cloud Monitoring + Alerting** — PagerDuty or Slack alerts on instance failures, high error rates, or resource exhaustion.
7. Consider whether Cloud Run would be a better fit for stateless inference workloads, as it provides built-in HA without this configuration overhead.
</details>

---
