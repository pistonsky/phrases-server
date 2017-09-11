var express = require('express');
var url = require('url');
var mongoose = require('mongoose');
var config = require('./config/keys');
var router = express.Router();

require('./models/Phrases');
mongoose.connect(config.mongoURI);
const Phrase = mongoose.model('phrases');

router.get('/', function(req, res) {
  Phrase.find({ user_id: req.query.user_id })
    .then(function(phrases) {
      res.send(
        phrases.map(item => {
          return Object.assign({ id: item._id }, item._doc);
        })
      );
    });
});

router.post('/', function(req, res) {
  let phrase = new Phrase({
    user_id: req.query.user_id,
    dictionary: req.query.dictionary || 'general',
    language: req.query.language,
    original: req.query.original,
    translated: req.query.translated,
    uri: req.query.uri
  });
  phrase.save().then(function(result) {
    res.json(result);
  });
});

router.get('/share', function(req, res) {
  const query = url.parse(req.url).query;
  res.redirect('exp://exp.host/@pistonsky/phrases/+' + query);
});

module.exports = router;
