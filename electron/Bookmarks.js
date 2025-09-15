import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'Bookmarks.db');
const db = new Database(dbPath);

db.prepare(`
  CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL,
    favicon TEXT,
    timestamp INTEGER
  )
`).run();


export function addBookmark(url, favicon = null,id) {
  db.prepare(`
    INSERT INTO bookmarks (id,url, favicon, timestamp)
    VALUES (?,?, ?, ?)
  `).run(id,url, favicon, Date.now());
}

export function removeBookMark(id){
 const dbStatement =  db.prepare(`DELETE FROM bookmarks where id = ? `);
  dbStatement.run(id)
}

export function loadBookmarks(){
 return db.prepare(`SELECT * FROM bookmarks`).all();
}



