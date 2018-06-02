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

	  	res.render('user', {username:req.session.username, title: '회원정보 조회', rows: rows, admin:req.session.admin});
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

	  	res.render('modify', {username:req.session.username, title: '회원정보 수정', rows: rows, admin:req.session.admin});
	  	connection.release();
	  });
	});
});

router.post('/modify/1', function(req, res, next) {
	var sql="update user set passwd=?, address=?, phone=? where email=?";
	var passwd=req.body.password;
	var passwd2=req.body.password2;
	var address=req.body.address;
	var phone=req.body.phone;
	var data=[passwd, address, phone, req.session.email];

	//console.log(req.body);
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
			connection.query(sql, data, function (err, rows) {
				if(err) console.error(err);
				connection.release();
			});
		});
	}
	res.redirect('/user');
});

router.post('/modify/2', function(req, res, next) {
	var sql="update user set address=? where email=?";
	var address=req.body.address1+" "+req.body.address2;
	var addressSel=req.body.addressSel;
	var data=[address, req.session.email];

	if(addressSel=="기본주소"){
		pool.getConnection(function (err, connection) {
			if (err) throw err;
			connection.query(sql, data, function (err, rows) {
				if(err) console.error(err);
				connection.release();
				sql="update shipaddress set address1=? where email=?";
			});
		});
	}
	else if(addressSel=="추가배송지1")
		sql="update shipaddress set address2=? where email=?";
	else if(addressSel=="추가배송지2")
		sql="update shipaddress set address3=? where email=?";
	pool.getConnection(function (err, connection) {
		if (err) throw err;
		connection.query(sql, data, function (err, rows) {
			if(err) console.error(err);
			connection.release();
		});
	});
	res.redirect('/user');
});

router.post('/modify/3', function(req, res, next) {
	var sql="update user set address=? where email=?";
	var addressSel=req.body.addressSel;
	var data=[null, req.session.email];

	if(addressSel=="기본주소"){
		pool.getConnection(function (err, connection) {
			if (err) throw err;
			connection.query(sql, data, function (err, rows) {
				if(err) console.error(err);
				connection.release();
			});
			sql="update shipaddress set address1=? where email=?";
		});
	}
	else if(addressSel=="추가배송지1")
		sql="update shipaddress set address2=? where email=?";
	else if(addressSel=="추가배송지2")
		sql="update shipaddress set address3=? where email=?";
	pool.getConnection(function (err, connection) {
		if (err) throw err;
		connection.query(sql, data, function (err, rows) {
			if(err) console.error(err);
			connection.release();
		});
	});
	res.redirect('/user');
});

router.get('/saleauthreq', function(req, res, next) {
	var sql="Select * from user where email=?"

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	res.render('saleauthreq', {username:req.session.username, title: '판매자등록요청', rows: rows, admin:req.session.admin});
	  	connection.release();
	  	
	  });
	});
});

router.post('/saleauthreq', function(req, res, next) {
	var sql="insert into SaleAuthReq(email, company, address, category, manager, phone1, phone2, content) Values(?,?,?,?,?,?,?,?)";
	var email=req.session.email;
	var company=req.body.company;
	var address=req.body.address1+" "+req.body.address2;
	var category=req.body.category;
	var manager=req.body.manager;
	var phone1=req.body.phone1;
	var phone2=req.body.phone2;
	var content=req.body.contents;
	var data=[email, company, address, category, manager, phone1, phone2, content];

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, data, function (err, rows) {
	  	if(err) console.error(err);

	  	console.log("rows : " + JSON.stringify(rows));

	  	connection.release();
	  });
	});
	res.redirect('/user');
});

router.get('/saleauthdel', function(req, res, next) {
	var sql="Select * from SaleAuthReq where email=?"

	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  connection.query(sql, [req.session.email], function (err, rows) {
	  	if(err) console.error(err);

	  	res.render('saleauthdel', {username:req.session.username, title: '판매자등록삭제', rows: rows, admin:req.session.admin});
	  	connection.release();
	  	
	  });
	});
});

router.post('/saleauthdel', function(req, res, next) {
	var sql="update user set sale=? where email=?";

	pool.getConnection(function (err, connection) {
		if (err) throw err;

		connection.query(sql,[0, req.session.email], function (err, rows) {
			if(err) console.error(err);

			connection.release();
		});
	});
	pool.getConnection(function (err, connection) {
		if (err) throw err;
		sql="delete from SaleAuthReq where email=?"
		connection.query(sql,[req.session.email], function (err, rows) {
			if(err) console.error(err);

			connection.release();
		});
	});
	res.redirect('/user');
});
module.exports = router;
