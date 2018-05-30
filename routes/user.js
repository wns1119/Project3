var express = require('express');
var router = express.Router();

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'malid.cgvtbxiixr2x.ap-northeast-2.rds.amazonaws.com',
	user: 'MALID',
	database: 'SE',
	password: '1234qwer'
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  var sql="Select email, date, username, address, phone, gender from user where email=?";
  console.log(req.session);
	pool.getConnection(function (err, connection) {
	  if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
		  if(err) console.error(err);

		  console.log("rows : " + JSON.stringify(rows));
		  
		  res.render('user', {username:req.session.username, title: '회원정보 조회', rows: rows});
		  connection.release();  
	  });
	});
});

router.get('/modify', function(req, res, next) {
  res.render('modify', {username:req.session.username});
});

router.post('/modify', function(req, res, next) {

});
module.exports = router;
