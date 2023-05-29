const express = require('express');
const router = express.Router();

const db = require('../services/db.js');
const { refreshBooks } = require('../services/books.js');

router.get('/all', (req, res) => {
  db.all('SELECT * FROM books', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.send(rows);
  });
});

router.get('/refresh', async (req, res) => {
  await refreshBooks();
  res.send('Books refreshed');
});

module.exports = router;
