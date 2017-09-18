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

router.get('/connect_facebook', function(req, res) {
  const { facebook_token, user_id } = req.query;
  graph.get('me?access_token=' + facebook_token, (err, { name, id }) => {
    if (user_id) {
      // add this facebook account to the current user
      Users.find({ user_id }).then(users => {
        if (users.length === 1) {
          let user = users[0];
          user.facebook_user_id = id;
          user.save();
          res.json({ user_id });
        } else {
          new Users({
            user_id,
            facebook_user_id: id
          }).save().then(result => res.json({ user_id }));
        }
      });
    } else {
      // login with facebook
      Users.find({ facebook_user_id: id }).then(users => {
        if (users.length === 1) {
          res.json({ user_id: users[0].user_id });
        } else {
          // no user with this facebook account - create one
          const new_user_id = Math.random()
            .toString(36)
            .slice(2);
          new Users({
            user_id: new_user_id,
            facebook_user_id: id
          })
            .save()
            .then(result => res.json({ user_id: new_user_id }));
        }
      });
    }
  });
});

router.get('/', function(req, res) {
  const { user_id } = req.query;
  Users.find({ user_id }).then(users => {
    if (users.length === 0) {
      new Users({ user_id }).save();
    }
    Phrase.find({ user_id }).then(function(phrases) {
      res.send(
        phrases.map(item => {
          return Object.assign({ id: item._id }, item._doc);
        })
      );
    });
  });
});

router.post('/', function(req, res) {
  const {
    user_id,
    dictionary,
    language,
    original,
    translated,
    uri
  } = req.query;
  Users.find({ user_id }).then(users => {
    if (users.length === 0) {
      new Users({ user_id }).save();
    }
    new Phrase({
      user_id: req.query.user_id,
      dictionary: req.query.dictionary || 'general',
      language: req.query.language,
      original: req.query.original,
      translated: req.query.translated,
      uri: req.query.uri
    })
      .save()
      .then(function(result) {
        res.json(result);
      });
  });
});

router.delete('/', function(req, res) {
  const { id } = req.query;
  Phrase.deleteOne({ _id: id }, function(err) {
    if (err) res.json(err);
    else res.json({});
  });
});

router.get('/share', function(req, res) {
  const query = url.parse(req.url).query;
  res.redirect('exp://exp.host/@pistonsky/phrases/+' + query);
});

module.exports = router;
