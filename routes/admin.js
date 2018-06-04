var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'malid.cgvtbxiixr2x.ap-northeast-2.rds.amazonaws.com',
	user: 'MALID',
	database: 'SE',
	password: '1234qwer'
});

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(session({
  secret: '1q2w3e4r',
  resave: false,
  saveUninitialized: true
}));

/* GET main page. */
router.get('/', function(req, res, next) {
	pool.getConnection(function (err, connection) {
	  if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT * FROM product";
	  connection.query(sqlForSelectList, function (err, rows) {
		  if(err) console.error(err);
		  console.log("rows : " + JSON.stringify(rows));
		  
		  res.render('admin', {username:req.session.username, title: '관리자용', rows: rows, admin:req.session.admin});
		  connection.release();  
	  });
	});
		  //res.render('admin', {username:req.session.username, title: '관리자용', admin:req.session.admin});
});


module.exports = router;
