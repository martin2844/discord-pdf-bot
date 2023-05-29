const express = require('express');
const router = express.Router();

const db = require('../services/db.js');
const { refreshBooks } = require('../services/books.js');

router.get('/all', (req, res) => {
  db.all(
    `
    SELECT books.id, books.date, books.file, uploaders.name, uploaders.avatar
    FROM books
    INNER JOIN uploaders ON books.uploader_id = uploaders.uploader_id
    ORDER BY date DESC`,
    [],
    (err, rows) => {
      if (err) {
        throw err;
      }
      res.send(rows);
    },
  );
});

router.get('/refresh', async (req, res) => {
  await refreshBooks();
  res.send('Books refreshed');
});

module.exports = router;
