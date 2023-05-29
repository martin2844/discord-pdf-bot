const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/download', function (req, res) {
  const dbPath = path.resolve(__dirname, '../../books.db'); // replace with your actual db path
  console.log(path.resolve(__dirname, '../../books.db'));
  res.download(dbPath); // Set disposition and send it.
});

module.exports = router;
