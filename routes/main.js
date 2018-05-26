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

  res.render('main', { title: 'main', username:req.session.username});
});

/* GET login page. */
router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Express' });
});

// 로그인 DB 확인
router.post('/login', function(req,res,next){
	
	var email = req.body.email;
	var passwd = req.body.password;
	
	pool.getConnection(function (err, connection)
	{
		var sql = "SELECT * FROM login WHERE email=?";
		connection.query(sql, [email], function(err, result){
			if(err) console.error(err);
			
			console.log(result);
			if(result != ""){	// 이메일이 존재하는 경우
			
				  var DB_PW = result[0].passwd;
				  if(DB_PW == passwd){	// 입력한 passwd가 일치하는 경우
					  req.session.username = result[0].username;	// 세션에 정보 저장
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

// logout 처리
router.get('/logout', function(req,res,next){
	delete req.session.username;
    res.redirect('/');
});


module.exports = router;
