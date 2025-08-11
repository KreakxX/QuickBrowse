import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'SavedTabs.db');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS savedTabs (
    id INTEGER PRIMARY KEY ,
    url TEXT NOT NULL,
    favicon TEXT,
    timestamp INTEGER
  )
`).run();


export function addSavedTab(url, favicon = null,id) {
  db.prepare(`
    INSERT INTO savedTabs (id,url, favicon, timestamp)
    VALUES (?, ?, ?,?)
  `).run(id,url, favicon, Date.now());
}

export function loadAllSavedTabs(){
 return db.prepare(`SELECT * FROM savedTabs`).all();
}

export function deleteSavedTab(id){
 db.prepare(`DELETE FROM savedTabs where id like ${id} `);
}
 