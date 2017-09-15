const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const usersSchema = new Schema({
  user_id: String,
  facebook_user_id: String
});

mongoose.model('users', usersSchema);
