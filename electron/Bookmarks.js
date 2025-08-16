import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'Bookmarks.db');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    favicon TEXT,
    timestamp INTEGER
  )
`).run();


export function addBookmark(url, favicon = null) {
  db.prepare(`
    INSERT INTO bookmarks (url, favicon, timestamp)
    VALUES (?, ?, ?)
  `).run(url, favicon, Date.now());
}

export function loadBookmarks(){
 return db.prepare(`SELECT * FROM bookmarks`).all();
}

