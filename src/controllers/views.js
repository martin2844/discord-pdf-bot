const express = require('express');
const router = express.Router();
const db = require('../services/db.js');

router.get('/', (req, res) => {
  const sql = `
  SELECT *
  FROM books
  INNER JOIN uploaders ON books.uploader_id = uploaders.uploader_id
  INNER JOIN book_details ON books.id = book_details.book_id
  ORDER BY date DESC 
  `;

  db.all(sql, [], (err, rows) => {
    if (err) {
      throw err;
    }
    res.render('index', { books: rows });
  });
});

module.exports = router;
