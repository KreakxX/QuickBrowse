import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'Tabs.db');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS Tabs (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL,
    favicon TEXT,
    title TEXT,
    timestamp INTEGER
  )
`).run();


export function saveTab(url,favicon){
   const row = db.prepare(`
    SELECT id + 1 AS nextId
    FROM Tabs
    WHERE (id + 1) NOT IN (SELECT id FROM Tabs)
    ORDER BY id
    LIMIT 1
  `).get();

  const nextId = row?.nextId || 1; 

  db.prepare(`
    INSERT INTO Tabs (id, url, favicon, timestamp)
    VALUES (?, ?, ?, ?)
  `).run(nextId, url, favicon, Date.now());
}

export function loadTabs(){
  return db.prepare(`
    SELECT * from Tabs
    `).all()
}

export function deleteTab(id){
  db.prepare(`DELETE FROM Tabs where id = ?`).run(id)
}

export function updateTabURL(id, url){
   db.prepare(`
    UPDATE Tabs
    SET url = ?
    WHERE id = ?
  `).run(url, id);
}

export function updateTabTItle(id, title){
   db.prepare(`
    UPDATE Tabs
    SET title = ?
    WHERE id = ?
  `).run(title, id);
}