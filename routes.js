var express = require('express');
var fs = require('fs');
var url = require('url');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

/* POST saveblog router. */
router.post('/upload', upload.any(), function(req, res, next) {
  res.json(req.files);
});

router.get('/phrase/(:id)', function(req, res) {
  const uri = 'uploads/' + req.params.id;
  fs.access(uri, e => {
    if (e) {
      res.status(404).send();
    } else {
      res.set({ 'Content-Type': 'audio/mpeg' });
      var readStream = fs.createReadStream(uri);
      readStream.pipe(res);
    }
  });
});

router.get('/share', function(req, res) {
  const query = url.parse(req.url).query;
  res.redirect('exp://exp.host/@pistonsky/phrases/+' + query);
});

module.exports = router;
