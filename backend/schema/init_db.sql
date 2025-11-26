-- Optional manual DB initialization if you prefer to run SQL yourself
CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  position INTEGER DEFAULT 0,
  heading TEXT,
  type TEXT DEFAULT 'text',
  text TEXT,
  last_feedback INTEGER,
  FOREIGN KEY(document_id) REFERENCES documents(id)
);

CREATE TABLE IF NOT EXISTS refinements (
  id TEXT PRIMARY KEY,
  section_id INTEGER,
  prompt TEXT,
  revised_text TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(section_id) REFERENCES sections(id)
);

CREATE TABLE IF NOT EXISTS comments (
  id TEXT PRIMARY KEY,
  section_id INTEGER,
  comment TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(section_id) REFERENCES sections(id)
);

CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  section_id INTEGER,
  liked INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY(section_id) REFERENCES sections(id)
);
