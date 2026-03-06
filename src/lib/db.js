import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'cuthere.db');

let db;

export function getDb() {
    if (!db) {
        // Ensure the data directory exists
        const dir = path.dirname(DB_PATH);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        db = new Database(DB_PATH);
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');

        // Create tables if they don't exist
        db.exec(`
      CREATE TABLE IF NOT EXISTS events (
        id          INTEGER PRIMARY KEY AUTOINCREMENT,
        title       TEXT NOT NULL,
        description TEXT,
        date        TEXT,
        time        TEXT,
        location    TEXT,
        image_url   TEXT,
        source_url  TEXT UNIQUE,
        source_platform TEXT DEFAULT 'instagram',
        created_at  TEXT DEFAULT (datetime('now')),
        updated_at  TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS rsvps (
        id        INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id  INTEGER NOT NULL,
        user_name TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
        UNIQUE(event_id, user_name)
      );
    `);
    }
    return db;
}
