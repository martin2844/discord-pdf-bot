const path = require('path');
module.exports = {
  jobs: [
    {
      name: 'PDF Metadata Extraction',
      //   cron: '0 9 * * *', // Cron schedule (runs every day at 9:00 AM)
      interval: '12h',
      timeout: '20m',
      path: path.join(__dirname, './getPdfDetails.js'), // Path to your script for extracting metadata
    },
  ],
  root: false,
};
