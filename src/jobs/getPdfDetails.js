const { parentPort } = require('worker_threads');
const {
  getBooksWithoutDetails,
  getMetaDataFromPdf,
  saveBookDetails,
} = require('../services/books');

(async () => {
  console.log('RUNNING CRON FOR PDF DETAILS');
  //Get all Books.
  try {
    const booksWithoutDetails = await getBooksWithoutDetails();
    for (const book of booksWithoutDetails) {
      const metadata = await getMetaDataFromPdf(book.file);
      await saveBookDetails(
        book.id,
        metadata.title,
        metadata.author,
        '',
        'keywords',
      );
    }
  } catch (error) {
    console.log(error);
  }
  //For each book that does not have a book_details entry, extract metadata and save it to the database.
  //If book has no PDF metadata create an empty row, this will mark it so that we dont check it again.
  if (parentPort) parentPort.postMessage('done');
  else process.exit(0);
})();
