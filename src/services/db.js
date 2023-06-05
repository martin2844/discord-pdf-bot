const sqlite3 = require('sqlite3').verbose();
const path = require('path');
let db;

const init = () => {
  db = new sqlite3.Database(
    path.resolve(__dirname, '../../books.db'),
    sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    (err) => {
      if (err) {
        console.error(err.message);
      }
      console.log('Connected to the books database.');
    },
  );
  // Create table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS uploaders (
  name TEXT PRIMARY KEY,
  uploader_id TEXT NOT NULL,
  avatar TEXT NOT NULL
)`);

  db.run(`CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uploader_id TEXT NOT NULL,
  date TEXT NOT NULL,
  file TEXT NOT NULL,
  FOREIGN KEY(uploader_id) REFERENCES uploaders(uploader_id)
)`);

  db.run(`CREATE TABLE IF NOT EXISTS book_details (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  subject TEXT,
  keywords TEXT,
  FOREIGN KEY(book_id) REFERENCES books(id)
)`);
};

init();
module.exports = db;
