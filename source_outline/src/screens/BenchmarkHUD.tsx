export type BenchmarkMetrics = {
  detectionMs: number;
  embeddingMs: number;
  livenessMs: number;
  totalMs: number;
  delegate: 'CPU' | 'NNAPI' | 'Metal';
  modelVersion: string;
};

