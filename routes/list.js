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

/* 전체상품조회 */
router.get('/', function(req, res, next) {
	
	pool.getConnection(function (err, connection) {
	  if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT * FROM product";
	  connection.query(sqlForSelectList, function (err, rows) {
		  if(err) console.error(err);
		  // console.log("rows : " + JSON.stringify(rows));
		  
		  res.render('list_all', {username:req.session.username, title: '전체 글 조회', rows: rows});
		  connection.release();  
	  });
	});
});
router.get('/machine', function(req, res, next) {
	
	pool.getConnection(function (err, connection) {
	  if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT * FROM product where category='0'";
	  connection.query(sqlForSelectList, function (err, rows) {
		  if(err) console.error(err);
		  // console.log("rows : " + JSON.stringify(rows));
		  
		  res.render('list_machine', {username:req.session.username, title: '운동기구 조회', rows: rows});
		  connection.release();  
	  });
	});
});

router.get('/:id', function(req, res, next) {
	
	pool.getConnection(function (err, connection) {
	  if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT * FROM product";
	  connection.query(sqlForSelectList, function (err, rows) {
		  if(err) console.error(err);
		  // console.log("rows : " + JSON.stringify(rows));
		  
		  res.render('showitem', {username:req.session.username, title: '전체 글 조회', rows: rows, id:req.params.id});
		  connection.release();  
	  });
	});
});


module.exports = router;
