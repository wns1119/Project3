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
	if(req.session.admin==undefined || req.session.admin!=1)
		res.redirect('/');
	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT * FROM product";
	  connection.query(sqlForSelectList, function (err, rows) {
	  	if(err) console.error(err);
	  	console.log("rows : " + JSON.stringify(rows));

	  sqlForSelectList = "SELECT product_code, amount FROM order_";
	  connection.query(sqlForSelectList, function (err, rows2) {
		  if(err) console.error(err);
		  console.log("rows2 : " + JSON.stringify(rows2));
		  connection.release();
res.render('admin', {username:req.session.username, title: '관리자용', rows: rows, rows2: rows2, admin:req.session.admin, sale:req.session.sale});		  
	  });
	  
	});
	});
	
});

router.get('/salereqmanage', function(req, res, next) {
	if(req.session.admin==undefined || req.session.admin!=1)
		res.redirect('/');
	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT idx, email, company, manager, phone1 FROM SaleAuthReq where permitted=0";
	  connection.query(sqlForSelectList, function (err, rows) {
	  	if(err) console.error(err);
	  	console.log("rows : " + JSON.stringify(rows));

	  	res.render('salereqmanage', {username:req.session.username, title: '관리자용', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();  
	  });
	});
});

router.get('/salereqmanage/:idx', function(req, res, next){
	if(req.session.admin==undefined || req.session.admin!=1)
		res.redirect('/');
	pool.getConnection(function(err, connection){
		var sql="select * from SaleAuthReq where permitted=0 and idx=?";
		connection.query(sql,[req.params.idx], function(err, rows){
			if(err) console.error(err);
			//console.log("1개 글 조회 결과 확인 : ", row);
			res.render('salereqmanageread', {username:req.session.username, title: '관리자용', rows: rows, admin:req.session.admin, sale:req.session.sale});
			connection.release();		
		});
	});
});

router.post('/salepermit/:idx', function(req, res, next) {
	
	var sql="update SaleAuthReq set permitted=1 where idx=?";
	console.log(req.body);
	pool.getConnection(function (err, connection) {
		if (err) throw err;

		connection.query(sql,[req.params.idx], function (err, rows) {
			if(err) console.error(err);
		});

		sql="select email from SaleAuthReq where idx=?";
		connection.query(sql,[req.params.idx], function (err, rows) {
			if(err) console.error(err);
			sql="update user set sale=1 where email=?"
			connection.query(sql,[rows[0].email], function (err, rows) {
				if(err) console.error(err);
				connection.release();
			});
		});
	});
	res.redirect('/admin/salereqmanage');
});

router.get('/sellerinfo', function(req, res, next) {
	if(req.session.admin==undefined || req.session.admin!=1)
		res.redirect('/');
	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT idx, email, company, manager, phone1 FROM SaleAuthReq where permitted=1";
	  connection.query(sqlForSelectList, function (err, rows) {
	  	if(err) console.error(err);
	  	console.log("rows : " + JSON.stringify(rows));

	  	res.render('sellerinfo', {username:req.session.username, title: '관리자용', rows: rows, admin:req.session.admin, sale:req.session.sale});
	  	connection.release();  
	  });
	});
});

router.get('/sellerinfo/:idx', function(req, res, next){
	if(req.session.admin==undefined || req.session.admin!=1)
		res.redirect('/');
	pool.getConnection(function(err, connection){
		var sql="select * from SaleAuthReq where permitted=1 and idx=?";
		connection.query(sql,[req.params.idx], function(err, rows){
			if(err) console.error(err);
			//console.log("1개 글 조회 결과 확인 : ", row);
			res.render('sellerinforead', {username:req.session.username, title: '관리자용', rows: rows, admin:req.session.admin, sale:req.session.sale});
			connection.release();		
		});
	});
});
module.exports = router;
