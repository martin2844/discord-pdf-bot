require('dotenv').config();
const Discord = require('discord.js');
const client = new Discord.Client({ intents: [1, 512] });
const db = require('./db.js');

const token = process.env.BOT_TOKEN;

const init = async () => {
  console.log('Initializing discord client');
  await client.login(token); // Replace with your bot token
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
                  const stmt = db.prepare(
                    'INSERT INTO books (uploader, date, file) VALUES (?, ?, ?)',
                  );
                  stmt.run(
                    msg.author.tag,
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

module.exports = {
  refreshBooks,
  init,
};
