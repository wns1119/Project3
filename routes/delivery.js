var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/delivery', function(req, res, next) {
  res.render('delivery', { title: 'Express' });
});

module.exports = router;
