-- PhoneBay database schema (SQLite)
-- Applied automatically on server startup by src/server/db.ts.
-- Written as idempotent DDL so it's safe to run on every boot.

CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  email               TEXT NOT NULL UNIQUE,
  password_hash       TEXT NOT NULL,
  full_name           TEXT NOT NULL,
  phone               TEXT,
  avatar_url          TEXT,
  bio                 TEXT,
  city                TEXT,
  role                TEXT NOT NULL DEFAULT 'USER', -- USER | SHOP | ADMIN
  shop_id             TEXT REFERENCES shop_profiles(id) ON DELETE SET NULL,
  email_verified      INTEGER NOT NULL DEFAULT 0,
  phone_verified      INTEGER NOT NULL DEFAULT 0,
  trust_score         REAL NOT NULL DEFAULT 7.5,
  is_blocked          INTEGER NOT NULL DEFAULT 0,
  blocked_reason      TEXT,
  blocked_at          TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS shop_profiles (
  id                    TEXT PRIMARY KEY,
  shop_name             TEXT NOT NULL,
  shop_email            TEXT NOT NULL UNIQUE,
  verified              INTEGER NOT NULL DEFAULT 0,
  verification_status   TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  services              TEXT NOT NULL DEFAULT '',
  verification_notes    TEXT,
  verified_at           TEXT,
  verified_by_admin_id  TEXT REFERENCES users(id) ON DELETE SET NULL,
  is_active             INTEGER NOT NULL DEFAULT 1,
  created_at            TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
  id             TEXT PRIMARY KEY,
  seller_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  brand          TEXT NOT NULL,
  model          TEXT NOT NULL,
  storage        TEXT NOT NULL,
  color          TEXT,
  condition      TEXT NOT NULL,
  price          INTEGER NOT NULL,
  negotiable     INTEGER NOT NULL DEFAULT 1,
  city           TEXT NOT NULL,
  area           TEXT,
  description    TEXT,
  status         TEXT NOT NULL DEFAULT 'pending', -- active|pending|sold|draft|paused
  battery_health INTEGER,
  repair_history TEXT,
  photo_count    INTEGER NOT NULL DEFAULT 0,
  image_urls     TEXT NOT NULL DEFAULT '[]',
  verified       INTEGER NOT NULL DEFAULT 0,
  score          REAL,
  views          INTEGER NOT NULL DEFAULT 0,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_shop_id ON users(shop_id);

CREATE TABLE IF NOT EXISTS saved_listings (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, listing_id)
);

CREATE TABLE IF NOT EXISTS verification_requests (
  id            TEXT PRIMARY KEY,
  listing_id    TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  technician_id TEXT REFERENCES users(id),
  status        TEXT NOT NULL DEFAULT 'pending', -- pending|in_progress|completed
  requested_at  TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at  TEXT,
  score         REAL,
  test_results  TEXT -- JSON string
);

CREATE INDEX IF NOT EXISTS idx_verification_listing ON verification_requests(listing_id);

CREATE TABLE IF NOT EXISTS certificates (
  id                  TEXT PRIMARY KEY,
  listing_id          TEXT NOT NULL UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
  overall_score       REAL NOT NULL,
  battery_health      INTEGER NOT NULL,
  display_score       REAL NOT NULL,
  camera_score        REAL NOT NULL,
  performance_score   REAL NOT NULL,
  physical_condition  REAL NOT NULL,
  tested_by           TEXT NOT NULL,
  issued_at           TEXT NOT NULL DEFAULT (datetime('now')),
  valid_until         TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id         TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price      INTEGER NOT NULL,
  status     TEXT NOT NULL DEFAULT 'processing', -- processing|shipped|delivered|cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id);

CREATE TABLE IF NOT EXISTS conversations (
  id         TEXT PRIMARY KEY,
  listing_id TEXT REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id  TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (listing_id, buyer_id, seller_id)
);

CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id);

CREATE TABLE IF NOT EXISTS messages (
  id              TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  text            TEXT NOT NULL,
  read            INTEGER NOT NULL DEFAULT 0,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

CREATE TABLE IF NOT EXISTS reviews (
  id               TEXT PRIMARY KEY,
  author_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id       TEXT REFERENCES listings(id) ON DELETE SET NULL,
  rating           INTEGER NOT NULL,
  comment          TEXT NOT NULL,
  created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_seller_id);

-- Admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id            TEXT PRIMARY KEY,
  admin_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT NOT NULL,
  changes       TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_admin ON admin_audit_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON admin_audit_logs(entity_type, entity_id);
