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

const cart = [];

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(session({
	secret: '1q2w3e4r',
	resave: false,
	saveUninitialized: true
}));

/* GET main page. */
router.get('/', function(req, res, next) {
	
	pool.getConnection(function (err, connection)
	{
		var sql = "SELECT * FROM product ORDER BY sales desc LIMIT 6";
		connection.query(sql, function(err, result){
			if(err) console.error(err);
			
			res.render('main', { title: 'main', username:req.session.username, admin:req.session.admin, row:result, sale:req.session.sale});
			connection.release();
		});
	});

});

/* GET login page. */
router.get('/login', function(req, res, next) {
	res.render('login', { title: 'login', username:req.session.username , sale:req.session.sale});
});

// 로그인 DB 확인
router.post('/login', function(req,res,next){
	
	var email = req.body.email;
	var passwd = req.body.password;
	
	pool.getConnection(function (err, connection)
	{
		var sql = "SELECT * FROM user WHERE email=?";
		connection.query(sql, [email], function(err, result){
			if(err) console.error(err);
			
			console.log(result);
			if(result != ""){	// 이메일이 존재하는 경우

				var DB_PW = result[0].passwd;
				  if(DB_PW == passwd){	// 입력한 passwd가 일치하는 경우
					  req.session.username = result[0].username;	// 세션에 정보 저장
					  req.session.email= result[0].email;
					  req.session.admin=result[0].admin;
					  req.session.sale=result[0].sale;
					  res.redirect('/');
					  connection.release();
					}
					else{
						res.send("<script>alert('패스워드가 일치하지 않습니다.');history.back();</script>");
						connection.release();
					}
				}
				else{
					res.send("<script>alert('아이디가 존재하지 않습니다.');history.back();</script>");
					connection.release();
				}

			});
	});
	
});
router.get('/userauth', function(req,res,next){
	res.render('userauth', {username: req.session.username, admin:req.session.admin, sale:req.session.sale});
});
router.post('/userauth', function(req,res,next){
	
	pool.getConnection(function (err, connection)
	{
		var sql = "SELECT passwd FROM user WHERE email=?";
		connection.query(sql, [req.session.email], function(err, result){
			if(err) console.error(err);
			
			console.log(result, req.body.password);
			if(result[0].passwd == req.body.password){	// 입력한 passwd가 일치하는 경우
				res.redirect('/user');
				connection.release();
			}
			else{
				res.send("<script>alert('패스워드가 일치하지 않습니다.');history.back();</script>");
				connection.release();
			}			
		});
	});
});
// logout 처리
router.get('/logout', function(req,res,next){
	delete req.session.username;
	delete req.session.email;
	delete req.session.admin;
	delete req.session.sale;
	res.redirect('/');
});

router.get('/cart', function(req,res,next){
	req.session.cart = cart;
	res.render('cart', { title: '장바구니', username:req.session.username, cart:req.session.cart, admin:req.session.admin, sale:req.session.sale});
});

router.post('/cart_add', function(req,res,next){
	var index;
	var data = {code:req.body.code, product_name:req.body.product_name, amount:req.body.amount, sum:req.body.sum};
	
	if(cart.find( v => (v.code === req.body.code))){	// 장바구니에 있는 동일 상품 검색
		index = cart.findIndex( v => (v.code === req.body.code));
		cart.splice(index,1, data);	// 정보 갱신
	}
	else{
		cart.push({code:req.body.code, product_name:req.body.product_name, amount:req.body.amount, sum:req.body.sum});
	}

	
	console.log(cart);
	req.session.cart = cart;
	
	res.send("<script>history.back();</script>");
});

router.post('/cart', function(req,res,next){
	var index;
	var data = {code:req.body.code, product_name:req.body.product_name, amount:req.body.amount, sum:req.body.sum};
	if(cart.find( v => (v.code === req.body.code))){	// 장바구니에 있는 동일 상품 검색
		index = cart.findIndex( v => (v.code === req.body.code));
		cart.splice(index,1, data);	// 정보 갱신
	}
	else{
		cart.push({code:req.body.code, product_name:req.body.product_name, amount:req.body.amount, sum:req.body.sum});
	}
	
	console.log(cart);
	req.session.cart = cart;
	
	res.render('cart', { title: '장바구니', username:req.session.username, cart:req.session.cart, admin:req.session.admin, sale:req.session.sale});
});

router.post('/cart_delete', function(req,res,next){
	
	console.log(req.body);
	var index = req.body.delete_index;
	cart.splice(index, 1);
	req.session.cart = cart;
	
	res.render('cart', { title: '장바구니', username:req.session.username, cart:req.session.cart, admin:req.session.admin, sale:req.session.sale});
});

module.exports = router;
