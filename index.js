var express = require('express');

var app = express();

app.use(require('./routes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT);
