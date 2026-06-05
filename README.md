# Offline Biometric Authentication & Liveness Detection (Datalake 3.0)

This repository contains the technical proposal, architecture diagrams, benchmark plans, and code outlines for the Datalake 3.0 offline facial recognition and liveness detection module.

The system is designed to verify field users on standard mobile devices without internet access, storing encrypted logs locally and syncing them to AWS when connectivity returns.

<p align="center">
  <img src="https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native"/>
  <img src="https://img.shields.io/badge/TensorFlow%20Lite-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow Lite"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/SQLCipher-1E293B?style=for-the-badge&logo=sqlite&logoColor=4E9F3D" alt="SQLCipher"/>
  <img src="https://img.shields.io/badge/AWS-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=FF9900" alt="AWS"/>
  <img src="https://img.shields.io/badge/Platforms-Android%20%7C%20iOS-3DDC84?style=for-the-badge&logo=android&logoColor=white" alt="Platforms"/>
</p>

---

## Directory Structure

*   `proposal.md` — Main technical proposal detailing the architecture, model sizes, and sync logic.
*   `diagrams/` — Architectural SVG diagrams.
    *   `system_architecture.svg` — Device runtime boundaries and network division.
    *   `ml_pipeline.svg` — Face detection, quality assessment, and liveness steps.
    *   `sync_purge_flow.svg` — Local queue state transitions and ACK flow.
*   `benchmark_plan/` — Metrics and device testing configurations.
    *   `benchmark_plan.md` — Latency targets, accuracy thresholds, and testing scenarios.
    *   `metrics_template.csv` — Logging template for benchmarking runs.
*   `source_outline/` — Code layout and TypeScript stubs.
    *   `src/ml/DecisionEngine.ts` — Sliding-window voting logic for face match results.
    *   `src/storage/schema.sql` — Database schemas for local event queues and templates.
    *   `src/sync/SyncManager.ts` — Upload queue execution stub.

---

## Technical Stack

*   **Framework:** React Native (Android 8+ / iOS 12+)
*   **Camera:** `react-native-vision-camera` with JSI frame processors for direct, zero-copy frame access.
*   **Inference Engine:** `react-native-fast-tflite` (TensorFlow Lite).
*   **On-Device Models:** BlazeFace (Detection), MobileFaceNet INT8 (Embeddings), MiniFASNet (Passive Liveness).
*   **Storage:** SQLCipher (256-bit AES encrypted SQLite database) backed by Keystore/Keychain.
*   **Cloud Backend:** AWS API Gateway, AWS Lambda, Amazon DynamoDB, and Amazon S3.

---

## Key Constraints and Targets

*   **Offline-First:** Face checks, embedding generation, and event logging must run entirely on the device without internet access.
*   **Model Size Budget:** Combined on-device model files must not exceed 20 MB.
*   **Latency Target:** Total passive verification (detection through liveness) must take less than 1 second.
*   **Verification Accuracy:** Biometric matching accuracy must be above 95% after calibration.
*   **Data Durability:** Local database logs are signed with an HMAC to detect tampering and are only deleted after a successful server sync acknowledgment (ACK).

---

## Architectural Highlights

### On-Device Machine Learning Pipeline
Camera frames are processed in-memory. The pipeline runs face detection, checks image quality (blur and exposure), aligns landmarks, extracts embeddings, and runs texture-based liveness checks. If the liveness score is borderline, the system prompts the user with a randomized active challenge (such as blinking or smiling) to prevent spoofing.

### Local Security and Integrity
Face images are never saved to disk. Instead, the application generates a 128-dimensional template encrypted using keys generated in the device's hardware-backed Keystore or Keychain. Every local log entry is signed with a unique HMAC to prevent manual database tampering.

---

## Architecture and Pipeline Visualizations

### System Architecture
The high-level boundary showing camera integration, local model execution, secure storage, and the remote backend connection:

![System Architecture](diagrams/system_architecture.svg)

### Machine Learning Pipeline
The detailed flow of frame ingestion, quality estimation, alignment, parallel face recognition and liveness detection, and the decision engine rules:

![ML Verification Pipeline](diagrams/ml_pipeline.svg)

### Offline Sync and Purge Flow
The transactional sequence for capturing events offline, bulk sync post-connection recovery, and server-acknowledgement driven purge execution:

![Offline Sync and Purge Flow](diagrams/sync_purge_flow.svg)
