# Offline Facial Recognition and Liveness Detection for Datalake 3.0

## 1. Executive Summary
We are building an offline‑first React Native mobile authentication module for remote field locations. The system performs face detection, face recognition, and liveness verification fully on-device without internet connectivity. We store only encrypted biometric templates and attendance/authentication events locally, then sync verified records to AWS once connectivity is restored and purge successfully synced local logs.

We are combining a lightweight TFLite edge‑AI pipeline with MobileFaceNet‑style face embeddings, MiniFASNet/Silent‑FAS‑style passive anti‑spoofing, randomized active liveness prompts, encrypted SQLite/SQLCipher storage, and ACK‑based AWS sync/purge.

## 2. Problem Understanding
Our field personnel need to authenticate in zero‑network zones. The system must run on standard mid‑range Android and iOS devices, avoid high‑end GPU requirements, remain lightweight, and integrate smoothly with the existing React Native Datalake 3.0 app.

Key constraints we are targeting:
- React Native compatibility for Android and iOS.
- Fully offline inference and offline local data capture.
- AI model footprint around 20 MB or below.
- Recognition + passive liveness decision below 1 second.
- Recognition accuracy above 95% after calibration.
- Open‑source technology preference.
- Sync local data to AWS after network restoration, then purge local synced records.

## 3. Recommended Solution
We are implementing a modular offline biometric verification pipeline:

1. Capture camera frame using React Native Vision Camera.
2. Process frames using JSI frame processors/native inference to avoid bridge copies.
3. Detect face using BlazeFace or UltraLight Face Detector.
4. Check face quality: blur, brightness, face size, pose, and occlusion.
5. Align face using a 5‑point landmark model or FaceMesh where needed.
6. Generate 128D embedding using MobileFaceNet INT8.
7. Run passive liveness using MiniFASNet/Silent‑FAS style texture anti‑spoofing.
8. Trigger randomized active challenge when required: blink, smile, or head turn.
9. Apply multi‑frame voting and calibrated thresholds.
10. Store encrypted event locally.
11. Sync pending events to AWS when online; purge after server ACK.

## 4. Proposed Tech Stack
| Layer | We are using | Backup / Alternative |
|---|---|---|
| App Framework | React Native | Existing Datalake 3.0 shell |
| Camera | react-native-vision-camera | Custom native camera module |
| Frame Processing | JSI frame processors | Custom native bridge |
| ML Runtime | TFLite / react-native-fast-tflite | ONNX Runtime React Native |
| Face Detection | BlazeFace / UltraLight FD | RetinaFace Mobile |
| Face Recognition | MobileFaceNet INT8, 128D embedding | GhostFaceNet-lite / ShuffleFaceNet |
| Passive Liveness | MiniFASNet / Silent-FAS style model | Binary texture CNN |
| Active Liveness | Blink, smile, head turn via landmarks | FaceMesh / head pose estimator |
| Local DB | SQLCipher / encrypted SQLite | Encrypted Realm |
| Key Storage | Android Keystore, iOS Keychain | SecureStore for small secrets |
| Sync Backend | API Gateway + Lambda + DynamoDB/S3 | AWS Amplify DataStore pattern |

## 5. Model Footprint Calculation
Our conservative model‑asset budget:

| Component | Estimated Size |
|---|---:|
| Face detector | 1-2 MB |
| Landmark/alignment model | 0.5-2 MB |
| MobileFaceNet INT8 | 2-4 MB |
| Passive liveness model | 0.5-2 MB |
| Config/preprocessing assets | 0.5 MB |
| Estimated total | 4.5-10.5 MB |

With FaceMesh where required, we remain around 6–14 MB. We are keeping total model assets below 20 MB.

## 6. Performance Budget
We are targeting device class: Android 8+, iOS 12+, 3 GB RAM, Snapdragon 6xx/7xx or equivalent, iPhone XR/A12‑class baseline.

Estimated passive verification path:

| Stage | Target Latency |
|---|---:|
| Face detection | 30-50 ms |
| Crop, resize, normalize | 10-20 ms |
| Landmark/alignment | 5-15 ms |
| Face embedding | 50-100 ms |
| Passive liveness | 30-70 ms |
| Similarity comparison | 1-5 ms |
| Decision logic | 1-3 ms |
| Estimated total | 127-263 ms |

With multi‑frame voting at 10–15 FPS, our perceived passive verification time is around 0.5–0.8 seconds. Active challenge‑response adds only user interaction time and is used for high‑security or ambiguous cases.

## 7. Accuracy and Robustness Strategy
We are targeting >95% verification accuracy after threshold calibration.

We are using:
- ArcFace/MobileFaceNet‑style embedding model.
- 3–5 enrollment samples per user with averaged templates.
- Multi‑frame voting during verification.
- Face alignment before embedding.
- Blur/brightness/pose quality checks.
- Lighting preprocessing such as CLAHE/histogram normalization where beneficial.
- Threshold calibration using ROC/DET curves.
- Indian‑demographic validation and optional consent‑based fine‑tuning.
- Quantization‑aware training to minimize INT8 accuracy loss.

## 8. Liveness and Anti-Spoofing Strategy
We use layered liveness protection:

1. Passive anti‑spoofing model to detect print/screen/replay texture cues.
2. Randomized active challenges such as blink, smile, and head turn.
3. Frame sequence analysis to avoid one‑frame decisions.
4. Confidence threshold gating.
5. Attempt limits and audit event logging.
6. Optional rPPG slow‑path only when liveness confidence is ambiguous.

Decision policy we apply:
- If passive liveness confidence is high and recognition passes: accept.
- If passive confidence is ambiguous: trigger randomized active challenge.
- If passive confidence is low: reject.

## 9. Local Storage and Security
We store embeddings, not raw face images. Local data is encrypted at rest.

We keep:
- User ID and encrypted face template.
- Model/template version.
- Authentication event ID.
- Timestamp, device ID, location if permitted.
- Recognition and liveness confidence scores.
- Sync status and retry count.
- HMAC signature for tamper detection.

Security controls we use:
- SQLCipher/encrypted SQLite for structured local data.
- Android Keystore and iOS Keychain for encryption keys.
- HMAC‑signed offline event records.
- Idempotency key per event.
- Attempt limiting to reduce brute‑force/spoof attempts.
- Purge of synced events only after server acknowledgement.

## 10. Offline Sync and Purge
Our sync flow:
1. Save verification events locally as PENDING.
2. Detect network restoration.
3. Batch upload PENDING records via HTTPS.
4. AWS Lambda validates HMAC, JWT/device identity, and idempotency key.
5. Store accepted records in DynamoDB, optional S3 audit archive.
6. Return ACK for accepted records.
7. Mark ACKED locally and purge synced records.
8. Retry failed records using exponential backoff with jitter.

## 11. Benchmark Plan
We will report:
- Model asset size.
- APK/IPA size note separately from model size.
- Face detection latency.
- Embedding latency.
- Liveness latency.
- End‑to‑end passive verification time.
- Active challenge completion time.
- Verification accuracy, FAR, FRR, ROC/DET curve.
- Liveness false accept/reject rates for print and screen attacks.
- Offline event storage size and sync success rate.
- Battery/thermal observation for repeated sessions.

We will test on:
- Low/mid Android with 3 GB RAM.
- Mid Android Snapdragon 6xx/7xx.
- iOS A12‑class device.

## 12. Source Code Structure Outline
```text
mobile-app/
  src/
    screens/
      EnrollmentScreen.tsx
      VerificationScreen.tsx
      OfflineQueueScreen.tsx
      BenchmarkHUD.tsx
    ml/
      FaceDetector.ts
      FaceAligner.ts
      FaceEmbedder.ts
      LivenessDetector.ts
      DecisionEngine.ts
      ModelRegistry.ts
    storage/
      SecureDatabase.ts
      EmbeddingRepository.ts
      EventQueueRepository.ts
    sync/
      NetworkMonitor.ts
      SyncManager.ts
      AwsSyncClient.ts
      PurgeManager.ts
    security/
      KeyManager.ts
      EventSigner.ts
  android/
    native-tflite-frame-processor/
  ios/
    native-tflite-frame-processor/
  models/
    face_detector.tflite
    mobilefacenet_int8.tflite
    minifasnet_int8.tflite
```

## 13. Risks and Mitigation
| Risk | Our mitigation |
|---|---|
| Accuracy drops after quantization | Use QAT and threshold recalibration |
| Low‑light performance issues | Face quality scoring, preprocessing, multi‑frame averaging |
| Active liveness false rejection | Trigger only when needed; tune thresholds |
| iOS TFLite integration complexity | ONNX Runtime fallback or CoreML conversion if necessary |
| Model package grows too large | INT8 quantization, pruning, remove unused models |
| Sync duplicates | Event UUID and idempotency key |
| Local tampering | SQLCipher and HMAC signatures |

### This is the approach we are taking for the prototype and final submission.