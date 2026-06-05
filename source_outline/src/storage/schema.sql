CREATE TABLE IF NOT EXISTS user_templates (
  user_id TEXT PRIMARY KEY,
  embedding BLOB NOT NULL,
  embedding_dim INTEGER NOT NULL,
  model_version TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_events (
  event_id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  device_id TEXT NOT NULL,
  recognition_score REAL,
  liveness_score REAL,
  sync_status TEXT NOT NULL DEFAULT 'PENDING',
  retry_count INTEGER NOT NULL DEFAULT 0,
  hmac_signature TEXT NOT NULL
);
