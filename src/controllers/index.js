const booksController = require('./books');
const viewsController = require('./views');
const dbController = require('./db');

module.exports = [
  {
    path: '/api/books',
    handler: booksController,
  },
  {
    path: '/api/db',
    handler: dbController,
  },
  {
    path: '/',
    handler: viewsController,
  },
];
