const { parentPort } = require('worker_threads');
const { getPdfDetailsForAllBooks } = require('../services/books');

(async () => {
  console.log('RUNNING CRON FOR PDF DETAILS');
  //Get all Books.
  try {
    await getPdfDetailsForAllBooks();
  } catch (error) {
    console.log(error);
  }
  //For each book that does not have a book_details entry, extract metadata and save it to the database.
  //If book has no PDF metadata create an empty row, this will mark it so that we dont check it again.
  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
