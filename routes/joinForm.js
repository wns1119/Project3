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

function leadingZeros(n, digits) {
  var zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (i = 0; i < digits - n.length; i++)
      zero += '0';
  }
  return zero + n;
}


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('joinForm', { title: 'joinForm' });
});

router.post('/', function(req,res,next){
	console.log(req.body);
	var d = new Date();
	var email = req.body.email;
	var passwd = req.body.passwd;
	var username = req.body.username;
	var date =
		leadingZeros(d.getFullYear(), 4) + '-' +
		leadingZeros(d.getMonth() + 1, 2) + '-' +
		leadingZeros(d.getDate(), 2) + ' ' +

		leadingZeros(d.getHours(), 2) + ':' +
		leadingZeros(d.getMinutes(), 2) + ':' +
		leadingZeros(d.getSeconds(), 2);
	var address = req.body.address;
	var phone = req.body.phone
	var gender = req.body.gender
	
	pool.getConnection(function (err, connection)
	{
		var sql = "SELECT * FROM login WHERE email=?";
		connection.query(sql, [email], function(err, result){
			if(err) console.error(err);
			
			if(result != ""){	// 이메일이 이미 존재하는 경우
				res.send("<script>alert('이메일이 이미 존재합니다.');history.back();</script>");
				connection.release();
			}
			else{
				pool.getConnection(function (err, connection)
				{
					var sql = "INSERT INTO login(email, passwd, date, username, address, phone, gender) values(?,?,?,?,?,?,?)";
					connection.query(sql, [email, passwd, date, username, address, phone, gender], function(err, result){
						if(err) console.error(err);
						
						res.send("<script>alert('회원가입 되었습니다.');window.location.href='/'</script>");
						connection.release();
					});
				});
			}
		});
		
	});
	
	
});

module.exports = router;
