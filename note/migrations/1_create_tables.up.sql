-- name: notes
CREATE TABLE notes (
  uuid TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT NOT NULL
);
