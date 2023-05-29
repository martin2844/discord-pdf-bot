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
  db.run(`CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uploader TEXT NOT NULL,
  date TEXT NOT NULL,
  file TEXT NOT NULL
)`);
};

init();
module.exports = db;
