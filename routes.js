var express = require('express');
var url = require('url');
var mongoose = require('mongoose');
var graph = require('fbgraph');
var config = require('./config/keys');
var router = express.Router();

require('./models/Phrases');
require('./models/Users');

mongoose.connect(config.mongoURI);

const Phrase = mongoose.model('phrases');
const Users = mongoose.model('users');

async function sendPhrases({ user_id, res }) {
  const users = await Users.find({ user_id });
  if (users.length === 0) {
    await new Users({ user_id }).save();
  }
  const phrases = await Phrase.find({ user_id });
  res.json({
    user_id,
    phrases: phrases.map(item => {
      return Object.assign({ id: item._id }, item._doc);
    })
  });
}

router.get('/connect_facebook', function(req, res) {
  const { facebook_token, user_id } = req.query;
  graph.get('me?access_token=' + facebook_token, async (err, { name, id }) => {
    let users;
    if (user_id) {
      // add this facebook account to the current user
      // if this facebook account is already used, then merge both accounts into current and delete the old one
      const linked_users = await Users.find({ facebook_user_id: id });
      if (linked_users.length === 0) {
        // no accounts linked yet
        users = await Users.find({ user_id });
        if (users.length === 1) {
          let user = users[0];
          user.facebook_user_id = id;
          user.save();
          await sendPhrases({ user_id, res });
        } else {
          await new Users({
            user_id,
            facebook_user_id: id
          }).save();
          await sendPhrases({ user_id, res });
        }
      } else {
        // there is one or more linked accounts already
        // add all phrases of linked accounts to the current user and remove all other users
        for (let linked_user of linked_users) {
          await Phrase.updateMany(
            { user_id: linked_user.user_id },
            { user_id }
          );
          if (linked_user.user_id !== user_id) {
            await linked_user.remove();
          }
        }
        const user = await Users.find({ user_id });
        if (user.length > 0) {
          await Users.updateMany({ user_id }, { facebook_user_id: id });
        } else {
          await new Users({
            user_id,
            facebook_user_id: id
          }).save();
        }
        await sendPhrases({ user_id, res });
      }
    } else {
      // login with facebook
      users = await Users.find({ facebook_user_id: id });
      if (users.length > 0) {
        const final_user_id = users[0].user_id; // merge all users into first one
        await Phrase.updateMany(
          { user_id: { $in: users.map(e => e.user_id) } },
          { user_id: final_user_id }
        );
        // remove all other users
        await Users.deleteMany({
          facebook_user_id: id,
          user_id: { $ne: final_user_id }
        });
        await sendPhrases({ user_id: final_user_id, res });
      } else {
        // no user with this facebook account - create one
        const new_user_id = Math.random()
          .toString(36)
          .slice(2);
        await new Users({
          user_id: new_user_id,
          facebook_user_id: id
        }).save();
        res.json({ user_id: new_user_id, phrases: [] });
      }
    }
  });
});

router.get('/', async (req, res) => {
  const { user_id } = req.query;
  await sendPhrases({ user_id, res });
});

router.post('/', async (req, res) => {
  const {
    user_id,
    dictionary,
    language,
    original,
    translated,
    uri
  } = req.query;
  const users = Users.find({ user_id });
  if (users.length === 0) {
    await new Users({ user_id }).save();
  }
  const result = await new Phrase({
    user_id: req.query.user_id,
    dictionary: req.query.dictionary || 'general',
    language: req.query.language,
    original: req.query.original,
    translated: req.query.translated,
    uri: req.query.uri
  }).save();
  res.json(result);
});

router.delete('/', async (req, res) => {
  const { uri } = req.query;
  const err = await Phrase.deleteOne({ uri });
  if (err) res.json(err);
  else res.json({});
});

router.get('/share', function(req, res) {
  const query = url.parse(req.url).query;
  res.redirect('phrazesapp://+' + query);
});

module.exports = router;
