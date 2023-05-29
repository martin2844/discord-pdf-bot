const express = require('express');
const router = express.Router();
const db = require('../services/db.js');

router.get('/', (req, res) => {
  db.all('SELECT * FROM books ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.render('index', { books: rows });
  });
});

module.exports = router;
