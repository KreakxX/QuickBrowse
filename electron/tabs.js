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


export function saveTab(id,url,favicon,title){
  db.prepare(`
    INSERT INTO Tabs (id,url,favicon,title,timestamp)
    VALUES (?, ?, ?, ?)
    `
  ).run(id,url,favicon,title,new Date())
}

export function loadTabs(){
  return db.prepare(`
    SELECT * from Tabs
    `).all()
}

export function deleteTab(id){
  db.prepare(`DELETE FROM Tabs where id = ?`).run(id)
}