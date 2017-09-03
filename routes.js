var express = require('express');
var fs = require('fs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

/* POST saveblog router. */
router.post('/upload', upload.any(), function(req, res, next) {
  res.json(req.files);
});

router.get('/phrase/(:id)', function(req, res) {
  res.set({ 'Content-Type': 'audio/mpeg' });
  var readStream = fs.createReadStream('uploads/' + req.params.id);
  readStream.pipe(res);
});

module.exports = router;
