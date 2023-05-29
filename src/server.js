const path = require('path');
const express = require('express');
require('dotenv').config();
const app = express();

const controllers = require('./controllers');

controllers.forEach((c) => app.use(c.path, c.handler));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is running on port ${port}`));
