import mongoose from 'mongoose';

const { Schema } = mongoose;

const usersSchema = new Schema({
  user_id: String,
  facebook_user_id: String,
});

mongoose.model('users', usersSchema);
