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


export function saveTab(id,url,favicon){
  db.prepare(`
    INSERT INTO Tabs (id,url,favicon,timestamp)
    VALUES (?, ?, ?, ?)
    `
  ).run(id,url,favicon,Date.now())
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