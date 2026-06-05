# Benchmark Plan

## Goals
Validate that the offline authentication pipeline meets model-size, latency, accuracy, liveness, and sync/purge requirements on mid-range Android and iOS devices.

## Device Matrix
| Device Class | Minimum Target | Notes |
|---|---|---|
| Android low/mid | Android 8+, 3GB RAM, Snapdragon 6xx | CPU path must work |
| Android mid | Snapdragon 7xx, 4-6GB RAM | NNAPI optional |
| iOS baseline | iOS 12+, A12-class | CPU/Metal optional |

## Test Scenarios
1. Indoor normal light.
2. Outdoor harsh sunlight.
3. Shadow/backlight.
4. Low light.
5. User with glasses/cap/beard.
6. Print photo spoof.
7. Phone screen spoof.
8. Video replay spoof.
9. Offline queue of 100+ events.
10. Network restoration and AWS sync/purge.

## Metrics
- Model asset size in MB.
- Detection latency.
- Embedding latency.
- Passive liveness latency.
- Total passive verification latency.
- Active challenge completion time.
- Verification FAR/FRR and accuracy.
- Liveness false accept/reject rates.
- Offline event storage size.
- Sync success rate and purge confirmation.

## Acceptance Targets
| Metric | Target |
|---|---:|
| Model assets | <20 MB |
| Passive verification | <1 second |
| Recognition accuracy | >95% after calibration |
| Local event loss | 0 during offline mode |
| Purge | Only after server ACK |
