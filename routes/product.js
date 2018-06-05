var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var multer = require('multer');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/image/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now()+file.originalname)
  }
})

var upload = multer({ storage: storage });

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'malid.cgvtbxiixr2x.ap-northeast-2.rds.amazonaws.com',
	user: 'MALID',
	database: 'SE',
	password: '1234qwer'
});


router.get('/', function(req, res) {
  if(!req.session.sale)res.redirect('/main');
  res.render('product', {username:req.session.username, admin:req.session.admin, sale:req.session.sale});
});

router.post('/', upload.single('img'), function(req, res, next) {
    var data = [req.session.username, req.body.name, req.body.category, req.body.price, req.body.spec, req.body.stock, req.file.filename];
    pool.getConnection(function(err, connection) {
      var sql = "INSERT INTO product(seller, name, category, price, spec, stock, image) " +
        "VALUES((select email from user where username=?), ?, ?, ?, ?, ?, ?)";
      connection.query(sql, data, function (err, result) {
        if (err) console.error(err);
        res.redirect('/');
        connection.release();
      });
    });
});
module.exports = router;