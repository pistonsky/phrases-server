var express = require('express');
var url = require('url');

var router = express.Router();

router.get('/share', function(req, res) {
  const query = url.parse(req.url).query;
  res.redirect('exp://exp.host/@pistonsky/phrases/+' + query);
});

module.exports = router;
