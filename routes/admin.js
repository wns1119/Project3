var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
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
	
	console.log(req.body);
	
	var month = 01;
	var day = 01;
	var month_after = 12;
	var day_after = 31;
	var date = {month,day,month_after,day_after};
	
	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT * FROM product";
	  connection.query(sqlForSelectList, function (err, rows) {
	  	if(err) console.error(err);
	  	//console.log("rows : " + JSON.stringify(rows));


	  sqlForSelectList = "SELECT product_code, amount FROM order_";
	  connection.query(sqlForSelectList, function (err, rows2) {
		  if(err) console.error(err);
		  console.log("rows2 : " + JSON.stringify(rows2));
		  connection.release();
		  res.render('admin', {username:req.session.username, title: '관리자용', rows: rows, rows2: rows2, admin:req.session.admin, sale:req.session.sale, date:date});		  
	  });
	  
	});
	});
	
});

router.post('/statistics', function(req, res, next) {
	if(req.session.admin==undefined || req.session.admin!=1)
		res.redirect('/');
	
	var month = 1*req.body.month;
	var day=1*req.body.day;
	var month_after=1*req.body.month_after;
	var day_after=1*req.body.day_after;
	
	console.log(req.body);
	if(req.body.month == 0) var month = 01;
	if(req.body.day == 0) var day = 01;
	if(req.body.month_after == 0) var month_after = 12;
	if(req.body.day_after == 0) var day_after = 31;
	var date = {month,day,month_after,day_after};
	
	pool.getConnection(function (err, connection) {
		if (err) throw err;
	  // Use the connection
	  var sqlForSelectList = "SELECT * FROM product";
	  connection.query(sqlForSelectList, function (err, rows) {
	  	if(err) console.error(err);
		//console.log("rows : " + JSON.stringify(rows));
		
		sqlForSelectList = "SELECT product_code, amount FROM order_ WHERE DATE(date) BETWEEN '2018-?-?' AND '2018-?-?'";
		connection.query(sqlForSelectList, [month,day,month_after,day_after],function (err, rows2) {
		  if(err) console.error(err);
		  console.log("rows2 : " + JSON.stringify(rows2));
		  connection.release();
		  res.render('admin', {username:req.session.username, title: '관리자용', rows: rows, rows2: rows2, admin:req.session.admin, sale:req.session.sale, date:date});		  
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

function page(req, res, maximumpage, render, sql1, sql2){
	var CurrPage  = Number(req.query.page);   // 현재 페이지 인덱스
	if(!CurrPage)CurrPage = 1;
	var TotalPage;  // 총 페이지 수
	var articles = "";     // 게시판 내용
 	var pageArticleNum = maximumpage; // 한 페이지에 표시될 게시글의 개수
  	var pageListNum = 5;  // 한 화면에 표시될 페이지 인덱스의 수
  	var startPage;  // 현재 화면 시작 인덱스
  	var endPage;    // 현재 화면 끝 인덱스
  	var Articles;
  	async.waterfall([
  		function(callback){

  			pool.getConnection(function (err, connection) {
  				var sql = sql1;
  				connection.query(sql, function(err, result){
  					if(err) console.error(err);
  					TotalPage = Math.ceil(result[0].count / pageArticleNum);
  					if(CurrPage>TotalPage)CurrPage=TotalPage;
  					connection.release();
  					totalpage = {
  						total:TotalPage,
  						Curr:CurrPage
  					}
  					callback(null, totalpage);
  				});
  			});
  		},
  		function(totalpage, callback){
  			pool.getConnection(function (err, connection) {
  				var sql = sql2;
  				connection.query(sql, [(totalpage.Curr-1)*pageArticleNum, pageArticleNum], function(err, result){
  					if(err) console.error(err);
            articles = result;
            var temp = {
              articles: articles,
              total: totalpage.total,
              Curr: totalpage.Curr
            }
            connection.release();
            callback(null, temp);
          });
  			});
  		},
  		function(data, callback){
      // 현재 페이지의 페이지네이션 시작 번호
      startPage = ((Math.ceil(data.Curr/pageListNum)-1) * pageListNum) + 1;
      // 현재 페이지의 페이지네이션 끝 번호
      endPage = (startPage + pageListNum) - 1;
        // 만약 현재 페이지네이션 끝 번호가 페이지네이션 전체 카운트보다 높을 경우
        if(endPage > TotalPage){
        	endPage = TotalPage;
        }
        Articles = {
        	contents: data.articles,
        	Current: data.Curr,
        	Start: startPage,
        	End: endPage,
        	Total: data.total,
        	ListCount: pageListNum
        };
        callback(null, Articles);
      }
      ],function(err, Articles){
       if (err) {
        throw err;
      } else {
        var len=0;
        if(Articles.contents!=undefined && Articles.contents.length<maximumpage)
          len=Articles.contents.length;
        else if(Articles.contents!=undefined && Articles.contents.length>=maximumpage)
          len=maximumpage;
        res.render(render,{
         title: render,
         articles: Articles,
         username:req.session.username, 
         admin:req.session.admin,
         sale:req.session.sale,
         len:len,
         search:req.query.Search
       });
      }
    });
  }

  router.get('/sellerinfo', function(req, res, next) {
  	if(req.session.admin==undefined || req.session.admin!=1)
  		res.redirect('/');
  	var sql1 = "SELECT COUNT(*) AS count FROM SaleAuthReq where permitted=1";
  	var sql2 = "SELECT idx, email, company, manager, phone1 FROM SaleAuthReq where permitted=1 LIMIT ?, ?";
  	page(req, res, 10, 'sellerinfo', sql1, sql2);
  });

  router.get('/userinfo', function(req, res) {
  	if(req.session.admin==undefined || req.session.admin!=1)
  		res.redirect('/');
    console.log(req.query);
    var sql1 = "SELECT COUNT(*) AS count FROM user";
    var sql2 = "SELECT email, username, address, phone, date_format(date, '%y-%m-%d') as date, gender, sale, admin FROM user LIMIT ?, ?";
    page(req, res, 10, 'userinfo2', sql1, sql2);
  });

  router.get('/userinfo/Search', function(req, res) {
    if(req.session.admin==undefined || req.session.admin!=1)
      res.redirect('/');
    console.log(req.query);
    var col;
    if(req.query.SearchOption=="이름")
      col="username";
    else if(req.query.SearchOption=="이메일")
      col="email";
    var sql1 = "SELECT COUNT(*) AS count FROM user";
    var sql2 = "SELECT email, username, address, phone, date_format(date, '%y-%m-%d') as date, gender, sale, admin FROM user where "+col+" LIKE'%"+req.query.Search+"%' LIMIT ?, ?";
    page(req, res, 10, 'userinfo2', sql1, sql2);
  });

  router.get('/withdrawmanage', function(req, res) {
  	if(req.session.admin==undefined || req.session.admin!=1)
  		res.redirect('/');
  	var sql1 = "SELECT COUNT(*) AS count FROM WithdrawReq";
  	var sql2 = "SELECT user.email, user.username, user.address, user.phone, date_format(user.date, '%y-%m-%d') as date, user.sale, user.admin, WithdrawReq.idx FROM user, WithdrawReq where user.email=WithdrawReq.email LIMIT ?, ?";
  	page(req, res, 10, 'withdrawmanage', sql1, sql2);
  });

  router.get('/withdrawmanage/:idx', function(req, res, next){
  	if(req.session.admin==undefined || req.session.admin!=1)
  		res.redirect('/');
  	pool.getConnection(function(err, connection){
  		var sql="select user.*, WithdrawReq.* from user, WithdrawReq where user.email=WithdrawReq.email and WithdrawReq.idx=?";
  		connection.query(sql,[req.params.idx], function(err, rows){
  			if(err) console.error(err);
			//console.log("1개 글 조회 결과 확인 : ", row);
			res.render('withdrawmanageread', {username:req.session.username, title: '관리자용', rows: rows, admin:req.session.admin, sale:req.session.sale});
			connection.release();		
		});
  	});
  });

  router.post('/withdrawpermit/:idx', function(req, res, next) {

  	var sql="select email from WithdrawReq where idx=?";
  	var email;
  	console.log(req.body);
  	pool.getConnection(function (err, connection) {
  		if (err) throw err;
  		
  		connection.query(sql,[req.params.idx], function (err, rows) {
  			if(err) console.error(err);
  			email=rows[0].email;
  			sql="delete from WithdrawReq where idx=?"
  			connection.query(sql,[req.params.idx], function (err, rows) {
  				if(err) console.error(err);
  				sql="delete from user where email=?";
  				connection.query(sql,[email], function (err, rows) {
  					if(err) console.error(err);
  					connection.release();
  				});
  			});
  		});
  	});
  	res.redirect('/admin/withdrawmanage');
  });
  module.exports = router;
