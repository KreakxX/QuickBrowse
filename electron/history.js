import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'history.db');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    url TEXT NOT NULL,
    favicon TEXT,
    timestamp INTEGER
  )
`).run();


export function saveHistory(url, favicon = null) {
  db.prepare(`
    INSERT INTO history (url, favicon, timestamp)
    VALUES (?, ?, ?)
  `).run(url, favicon, Date.now());
}

export function loadHistory(){
 return db.prepare(`SELECT * FROM history`).all();
}

export function deleteHistory(){
  const dbStatement =  db.prepare(`DELETE FROM history`);
  dbStatement.run()
}