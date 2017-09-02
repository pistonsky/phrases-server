var express = require('express');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var router = express.Router();

/* POST saveblog router. */
router.post('/upload', upload.any(), function(req, res, next) {
  res.json(req.files);
});

module.exports = router;