require('dotenv').config();
const axios = require('axios');
const PDFParser = require('pdf-parse');
const Discord = require('discord.js');
const client = new Discord.Client({ intents: [1, 512] });
const db = require('./db.js');

const token = process.env.BOT_TOKEN;

const init = async () => {
  console.log('Initializing discord client');
  await client.login(token); // Replace with your bot token
};

const getAllBooks = () => {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM books', [], (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const getBooksWithoutDetails = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT books.id, books.file
      FROM books
      LEFT JOIN book_details ON books.id = book_details.book_id
      WHERE book_details.book_id IS NULL
      `,
      [],
      (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      },
    );
  });
};

const getAllBooksAndDetails = () => {
  return new Promise((resolve, reject) => {
    db.all(
      `
      SELECT *
      FROM books
      INNER JOIN uploaders ON books.uploader_id = uploaders.uploader_id
      INNER JOIN book_details ON books.id = book_details.book_id
      ORDER BY date DESC`,
      [],
      (err, rows) => {
        if (err) {
          console.log(err);
          reject(err);
        } else {
          resolve(rows);
        }
      },
    );
  });
};

const refreshBooks = async () => {
  console.log('refreshing');
  // Check if the client is ready
  if (!client.readyAt) {
    console.log('Client is not ready yet, waiting for client to become ready');
    await new Promise((resolve) => client.once('ready', resolve));
  }

  console.log(`Ready! Logged in as ${client.user.tag}`);

  client.guilds.cache.forEach(async (guild) => {
    console.log(`Guild name: ${guild.name}, Guild ID: ${guild.id}`);
    const channelId = '805973548924403722';
    const channel = client.channels.cache.get(channelId);
    console.log(channel.name);

    // Get the latest date from the database
    db.get(
      'SELECT date FROM books ORDER BY date DESC LIMIT 1',
      [],
      async (err, row) => {
        if (err) {
          console.error(err.message);
          return;
        }

        // If there's no row, set it to the unix epoch
        let lastTimestamp = row ? new Date(row.date).getTime() : 0;
        let lastId;

        const fetchMessages = async () => {
          const options = { limit: 100 };
          if (lastId) {
            options.before = lastId;
          }

          const messages = await channel.messages.fetch(options);
          if (messages.size === 0) {
            return;
          }

          let olderMessageFound = false;

          messages.forEach((msg) => {
            // If the message is older or the same as the latest in the database, stop fetching
            if (msg.createdTimestamp <= lastTimestamp) {
              olderMessageFound = true;
              return;
            }

            console.log(`Message from ${msg.author.tag}: ${msg.content}`);
            if (msg.attachments.size > 0) {
              msg.attachments.forEach((attachment) => {
                if (attachment.name.endsWith('.pdf')) {
                  getAndSaveAvatar(client, msg.author.id, msg.author.tag);
                  const stmt = db.prepare(
                    'INSERT INTO books (uploader_id, date, file) VALUES (?, ?, ?)',
                  );
                  stmt.run(
                    msg.author.id,
                    msg.createdAt.toISOString(),
                    attachment.url,
                  );
                  stmt.finalize();
                  console.log('The book was inserted into the database!');
                }
              });
            }
          });

          if (olderMessageFound) {
            return;
          }

          lastId = messages.last().id;
          await fetchMessages();
        };

        await fetchMessages();
      },
    );
  });
};

const getAndSaveAvatar = async (client, uploaderId, uploader_name) => {
  try {
    // Fetch the user from the client's cache
    const user = await client.users.fetch(uploaderId);
    if (!user) {
      console.error(`User with ID ${uploaderId} not found.`);
      return;
    }

    // Get the user's avatar URL. Discord.js provides the User.displayAvatarURL() method for this.
    const avatarUrl = user.displayAvatarURL();

    // Insert the user's ID and avatar URL into the uploaders table
    const stmt = db.prepare(
      'INSERT OR IGNORE INTO uploaders (uploader_id, name, avatar) VALUES (?, ?, ?)',
    );
    stmt.run(uploaderId, uploader_name, avatarUrl);
    stmt.finalize();
    console.log(`Avatar URL for ${uploaderId} saved to the database.`);
  } catch (error) {
    console.error(`Error getting avatar for ${uploaderId}: ${error}`);
  }
};

const getMetaDataFromPdf = async (url) => {
  try {
    // Download the PDF file from the URL
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
    });
    const pdfBuffer = response.data;

    // Parse PDF data
    const pdf = await PDFParser(pdfBuffer);
    const { info } = pdf;
    const author = info.Author;
    const title = info.Title;
    return {
      file: url,
      author,
      title,
    };
  } catch (error) {
    console.log(error);
  }
};

const saveBookDetails = async (bookId, title, author, subject, keywords) => {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO book_details (book_id, title, author, subject, keywords)
      VALUES (?, ?, ?, ?, ?)
      `,
      [bookId, title, author, subject, keywords],
      function (err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.lastID);
        }
      },
    );
  });
};

// getMetaDataFromPdf(
//   'https://cdn.discordapp.com/attachments/805973548924403722/994247168196087838/Python_Tricks_A_Buffet_of_Awesome_Python_Features.pdf',
// );

module.exports = {
  refreshBooks,
  getAllBooks,
  getAllBooksAndDetails,
  getBooksWithoutDetails,
  getMetaDataFromPdf,
  saveBookDetails,
  getMetaDataFromPdf,
  init,
};
