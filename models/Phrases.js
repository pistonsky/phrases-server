const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const phrasesSchema = new Schema({
  user_id: String,
  dictionary: String,
  language: String,
  original: String,
  translated: String,
  uri: String
});

mongoose.model('phrases', phrasesSchema);
