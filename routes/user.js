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
	var sql="Select user.*, shipaddress.* from user, shipaddress where user.email=? and shipaddress.email=?";

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email, req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	console.log("rows : " + JSON.stringify(rows));

	  	res.render('user', {username:req.session.username, title: '회원정보 조회', rows: rows});
	  	connection.release();
	  });
	});
});

router.get('/modify', function(req, res, next) {
	var sql="Select * from user where email=?"

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	console.log("rows : " + JSON.stringify(rows));

	  	res.render('modify', {username:req.session.username, title: '회원정보 수정', rows: rows});
	  	connection.release();
	  });
	});
});

router.post('/modify', function(req, res, next) {
	var sql="update user set passwd=?, address=?, phone=? where email=?";
	var passwd=req.body.password;
	var passwd2=req.body.password2;
	var address=req.body.address;
	var phone=req.body.phone;
	var data=[passwd, address, phone, req.session.email];

	console.log(req.body);
	if(passwd==''){
		sql="update user set address=?, phone=? where email=?";
		data=[address, phone, req.session.email];
	}
	if(passwd!=passwd2){
		res.send("<script>alert('비밀번호가 일치하지 않습니다.');history.back();</script>");
		res.redirect('/user/modify');
	}
	else{
		pool.getConnection(function (err, connection) {
			if (err) throw err;
	  // Use the connection
	  connection.query(sql, [passwd, address, phone, req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	connection.release();
	  });
	});
	res.redirect('/user');
	}
});
module.exports = router;
