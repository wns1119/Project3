var express = require('express');
var router = express.Router();
var async = require('async');

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'malid.cgvtbxiixr2x.ap-northeast-2.rds.amazonaws.com',
	user: 'MALID',
	database: 'SE',
	password: '1234qwer'
});
var length = 0;

function check_stock(res, code, amount, function1) {
	var i=0;
	pool.getConnection(function (err, connection) {
		if (err) throw err;
		// Use the connection
		var sql = "SELECT name, stock FROM product WHERE code=?";
		connection.query(sql, [code],function (err, rows) {
			if(err) console.error(err);
			i++;
			console.log("-------------------------");
			console.log(rows);
			if(rows[0].stock < amount){
				res.send("<script>alert('"+'"'+rows[0].name+'"'+" 상품의 재고가 부족합니다.');history.back();</script>"); 
				connection.release(); 
				function1(0);
			}
			else{
				connection.release();  
				function1(1);
			}
				
		});
	});
}

function recursive_func(res,req,i,count,product){
	index = req.body.checkRow[i];
	console.log("-------------------------");
	console.log(req.body.code[index]);
	console.log(req.body.amount[index]);
	console.log("-------------------------");

	if(length == 1) {
		var code = req.body.code;
		var amount = req.body.amount;
		var name = req.body.product_name;
		var sum = req.body.sum;
	}
	else{
		var code = req.body.code[index];
		var amount = req.body.amount[index];
		var name = req.body.product_name[index];
		var sum = req.body.sum[index];
	}
	
	check_stock(res,code,amount, function callbackfunction(result){
		i++;
		if(result == 1 && i==count)
		{
			product.push({code:code,name:name,amount:amount,sum:sum});
			pool.getConnection(function (err, connection) {
				if (err) throw err;
				// Use the connection
				var sql = "SELECT * FROM user WHERE email=?";
				connection.query(sql, [req.session.email],function (err, rows) {
					if(err) console.error(err);
					
					res.render('order',{title: 'notice',product:product,username:req.session.username,admin:req.session.admin,user:rows});	
					connection.release();  
				});
			});
			
		}
		else if(result == 1){
			product.push({code:code,name:name,amount:amount,sum:sum});
			recursive_func(res,req,i,count,product);	
		}
	});
}

function order_func(req,res,i,count){

			
	if(i==count){
		res.send("<script>alert('주문이 완료되었습니다.');location.href='/';</script>");
	}
	else{
		pool.getConnection(function (err, connection) {
			if (err) throw err;
			// Use the connection
			var sql = "INSERT INTO order_(product_code,purchaser,email,payment,price,amount,address,phone,date) VALUE(?,?,?,?,?,?,?,?,CURRENT_TIMESTAMP)";
			var code = req.body.code[i];
			if(count == 1) code = req.body.code;
			var name = req.body.r_name;
			var payment = req.body.payment;
			var sum = req.body.sum[i];
			if(count == 1) sum = req.body.sum;
			var amount = req.body.amount[i];
			if(count == 1) amount = req.body.amount;
			var address = req.body.r_address;
			var phone = req.body.r_phone;

			
			connection.query(sql, [code,name,req.session.email,payment,sum,amount,address,phone],function (err, rows) {
				if(err) console.error(err);
				i++;
				connection.release(); 
				var sql = "UPDATE product set stock=stock-?, sales=sales+? WHERE code=?";
				connection.query(sql, [amount,amount,code],function (err, rows) {
					if(err) console.error(err);
					
					order_func(req,res,i,count);	
				});
				
			});
		});
	}
}

router.post('/', function(req, res, next) {
	
	var product = [];
	
	if(req.session.username == null){
		res.send("<script>alert('로그인을 해주세요.');location.href='/login';</script>");
	}
	else{
			if(req.body.checkRow != undefined){		// 장바구니를 통한 구매
				var count = Object.keys(req.body.checkRow).length;	// 인덱스 카운트
				length = req.body.length;	// 장바구니 전체 개수(체크유무 상관없음)
				var i=0;
				var index = req.body.checkRow[i];
				
				recursive_func(res,req,0,count,product);
			}	
			else{	// 상품화면을 통한 구매
				console.log(req.body);
				check_stock(res,req.body.code,req.body.amount, function callbackfunction(result){
					if(result == 1){
						product.push({code:req.body.code,name:req.body.product_name,amount:req.body.amount,sum:req.body.sum});
						pool.getConnection(function (err, connection) {
							if (err) throw err;
							// Use the connection
							var sql = "SELECT * FROM user WHERE email=?";
							connection.query(sql, [req.session.email],function (err, rows) {
								if(err) console.error(err);
								// console.log(rows);
								res.render('order',{title: 'notice',product:product,username:req.session.username,admin:req.session.admin,user:rows});	
								connection.release();  
							});
						});
					}
				});
				
			}
		
		
	}
	
});

router.post('/payment', function(req, res, next) {

	var count = 1;
	var i=0;
	count=req.body.length;
	console.log("-------------");
	console.log(count);
	console.log("-------------");
	
	order_func(req,res,i,count);
	
});

module.exports = router;
