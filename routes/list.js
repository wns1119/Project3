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

/* 전체상품조회 */
/*
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
});*/

function listcall(req, res, maxnum_page, sort, render_page, titleinfo, username) {
	var CurrPage  = Number(req.query.page);   // 현재 페이지 인덱스
  if(!CurrPage)CurrPage = 1;
	var TotalPage;  // 총 페이지 수
	var articles = "";     // 게시판 내용
  var pageArticleNum = maxnum_page; // 한 페이지에 표시될 게시글의 개수
  var pageListNum = 5;  // 한 화면에 표시될 페이지 인덱스의 수
  var startPage;  // 현재 화면 시작 인덱스
  var endPage;    // 현재 화면 끝 인덱스
  var Articles;
  var total_count;
  async.waterfall([
   function(callback){

    pool.getConnection(function (err, connection) {
      if(sort >= 0 && sort<=3) var sql = "SELECT COUNT(*) AS count FROM product";
	  else if(sort>=4 && sort<=7) var sql = "SELECT COUNT(*) AS count FROM product WHERE name LIKE '%"+req.query.Search+"%'";
	  else if(sort>=8 && sort<=11) var sql = "SELECT COUNT(*) AS count FROM product WHERE category=1";
	  else if(sort>=12 && sort<=15) var sql = "SELECT COUNT(*) AS count FROM product WHERE category=2";
	  else if(sort>=16 && sort<=19) var sql = "SELECT COUNT(*) AS count FROM product WHERE category=3";
	  else if(sort>=20 && sort<=23) var sql = "SELECT COUNT(*) AS count FROM product WHERE category=4";
	  
      connection.query(sql, function(err, result){
        if(err) console.error(err);
		total_count = result[0].count;
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
		if(sort == 0) var sql = "SELECT * FROM product ORDER BY name asc LIMIT ?, ?";		// 이름순
        else if(sort == 1) var sql = "SELECT * FROM product ORDER BY price asc LIMIT ?, ?";		// 낮은가격순
		else if(sort == 2) var sql = "SELECT * FROM product ORDER BY price desc LIMIT ?, ?";	// 높은가격순
		else if(sort == 3) var sql = "SELECT * FROM product ORDER BY sales desc LIMIT ?, ?";	// 판매순
		else if(sort == 4) var sql = "SELECT * FROM product WHERE name LIKE '%"+req.query.Search+"%' ORDER BY name asc LIMIT ?, ?";	// 검색(이름순) 
		else if(sort == 5) var sql = "SELECT * FROM product WHERE name LIKE '%"+req.query.Search+"%' ORDER BY price asc LIMIT ?, ?";	// 검색(낮은가격순)
		else if(sort == 6) var sql = "SELECT * FROM product WHERE name LIKE '%"+req.query.Search+"%' ORDER BY price desc LIMIT ?, ?";	// 검색(높은가격순)
		else if(sort == 7) var sql = "SELECT * FROM product WHERE name LIKE '%"+req.query.Search+"%' ORDER BY sales desc LIMIT ?, ?";	// 검색(판매순)
		else if(sort == 8) var sql = "SELECT * FROM product WHERE category=1 ORDER BY name asc LIMIT ?, ?";	// 이름순
		else if(sort == 9) var sql = "SELECT * FROM product WHERE category=1 ORDER BY price asc LIMIT ?, ?";	// 낮은가격순
		else if(sort == 10) var sql = "SELECT * FROM product WHERE category=1 ORDER BY price desc LIMIT ?, ?";	// 높은가격순
		else if(sort == 11) var sql = "SELECT * FROM product WHERE category=1 ORDER BY sales desc LIMIT ?, ?";	// 판매순
		else if(sort == 12) var sql = "SELECT * FROM product WHERE category=2 ORDER BY name asc LIMIT ?, ?";	// 이름순
		else if(sort == 13) var sql = "SELECT * FROM product WHERE category=2 ORDER BY price asc LIMIT ?, ?";	// 낮은가격순
		else if(sort == 14) var sql = "SELECT * FROM product WHERE category=2 ORDER BY price desc LIMIT ?, ?";	// 높은가격순
		else if(sort == 15) var sql = "SELECT * FROM product WHERE category=2 ORDER BY sales desc LIMIT ?, ?";	// 판매순
		else if(sort == 16) var sql = "SELECT * FROM product WHERE category=3 ORDER BY name asc LIMIT ?, ?";	// 이름순
		else if(sort == 17) var sql = "SELECT * FROM product WHERE category=3 ORDER BY price asc LIMIT ?, ?";	// 낮은가격순
		else if(sort == 18) var sql = "SELECT * FROM product WHERE category=3 ORDER BY price desc LIMIT ?, ?";	// 높은가격순
		else if(sort == 19) var sql = "SELECT * FROM product WHERE category=3 ORDER BY sales desc LIMIT ?, ?";	// 판매순
		else if(sort == 20) var sql = "SELECT * FROM product WHERE category=4 ORDER BY name asc LIMIT ?, ?";	// 이름순
		else if(sort == 21) var sql = "SELECT * FROM product WHERE category=4 ORDER BY price asc LIMIT ?, ?";	// 낮은가격순
		else if(sort == 22) var sql = "SELECT * FROM product WHERE category=4 ORDER BY price desc LIMIT ?, ?";	// 높은가격순
		else if(sort == 23) var sql = "SELECT * FROM product WHERE category=4 ORDER BY sales desc LIMIT ?, ?";	// 판매순
			
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
   console.log(data.Curr);
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
          console.log(Articles.Start);
          console.log(Articles.End);
          res.render(render_page,{
            title: titleinfo,
            articles: Articles,
            username:req.session.username,
            search:req.query.Search, 
            admin:req.session.admin,
			total_count:total_count
          });
        }
      }
      );
}


/* 이름순 정렬 (기본) */
router.get('/', function(req, res) {
	listcall(req, res, 12, 0, "list_all", "전체상품");
});

/* 낮은가격순 정렬 */
router.get('/low_price', function(req, res) {
	listcall(req, res, 12, 1, "list_all", "전체상품");
});

/* 높은가격순 정렬 */
router.get('/high_price', function(req, res) {
	listcall(req, res, 12, 2, "list_all", "전체상품");
});

/* 판매순 정렬 */
router.get('/sales', function(req, res) {
	listcall(req, res, 12, 3, "list_all", "전체상품");
});

/* 검색(이름순 정렬) */
router.get('/search', function(req, res) {
	console.log(req.query);
	listcall(req, res, 12, 4, "search", "검색결과");
});

/* 검색(낮은가격순 정렬) */
router.get('/search/low_price', function(req, res) {
	console.log(req.query);
	listcall(req, res, 12, 5, "search", "검색결과");
});

/* 검색(높은가격순 정렬) */
router.get('/search/high_price', function(req, res) {
	console.log(req.query);
	listcall(req, res, 12, 6, "search", "검색결과");
});

/* 검색(판매순 정렬) */
router.get('/search/sales', function(req, res) {
	console.log(req.query);
	listcall(req, res, 12, 7, "search", "검색결과");
});

/* 런닝머신(이름순 정렬) */
router.get('/no-1', function(req, res) {
	listcall(req, res, 12, 8, "list_all", "전체상품");
});

/* 런닝머신(낮은가격순 정렬) */
router.get('/no-1/low_price', function(req, res) {
	listcall(req, res, 12, 9, "list_all", "전체상품");
});

/* 런닝머신(높은가격순 정렬) */
router.get('/no-1/high_price', function(req, res) {
	listcall(req, res, 12, 10, "list_all", "전체상품");
});

/* 런닝머신(판매순 정렬) */
router.get('/no-1/sales', function(req, res) {
	listcall(req, res, 12, 11, "list_all", "전체상품");
});

/* 싸이클(이름순 정렬) */
router.get('/no-2', function(req, res) {
	listcall(req, res, 12, 12, "list_all", "전체상품");
});

/* 싸이클(낮은가격순 정렬) */
router.get('/no-2/low_price', function(req, res) {
	listcall(req, res, 12, 13, "list_all", "전체상품");
});

/* 싸이클(높은가격순 정렬) */
router.get('/no-2/high_price', function(req, res) {
	listcall(req, res, 12, 14, "list_all", "전체상품");
});

/* 싸이클(판매순 정렬) */
router.get('/no-2/sales', function(req, res) {
	listcall(req, res, 12, 15, "list_all", "전체상품");
});

/* 보충제(이름순 정렬) */
router.get('/no-3', function(req, res) {
	listcall(req, res, 12, 16, "list_all", "전체상품");
});

/* 보충제(낮은가격순 정렬) */
router.get('/no-3/low_price', function(req, res) {
	listcall(req, res, 12, 17, "list_all", "전체상품");
});

/* 보충제(높은가격순 정렬) */
router.get('/no-3/high_price', function(req, res) {
	listcall(req, res, 12, 18, "list_all", "전체상품");
});

/* 보충제(판매순 정렬) */
router.get('/no-3/sales', function(req, res) {
	listcall(req, res, 12, 19, "list_all", "전체상품");
});

/* 보호대(이름순 정렬) */
router.get('/no-4', function(req, res) {
	listcall(req, res, 12, 20, "list_all", "전체상품");
});

/* 보호대(낮은가격순 정렬) */
router.get('/no-4/low_price', function(req, res) {
	listcall(req, res, 12, 21, "list_all", "전체상품");
});

/* 보호대(높은가격순 정렬) */
router.get('/no-4/high_price', function(req, res) {
	listcall(req, res, 12, 22, "list_all", "전체상품");
});

/* 보호대(판매순 정렬) */
router.get('/no-4/sales', function(req, res) {
	listcall(req, res, 12, 23, "list_all", "전체상품");
});

/* 개별 상품 조회 (코드번호 이용) */
router.get('/read/:code', function(req, res, next) {
	
	var code = req.params.code;
	var product;
	pool.getConnection(function (err, connection) {
		if (err) throw err;
		// Use the connection

		var sql = "SELECT * FROM product WHERE code=?";
		connection.query(sql,[code], function (err, row) {
			if(err) console.error(err);
			console.log("1개 글 조회 결과 확인 : ", row);
			product = row[0];
			connection.release();
			
			pool.getConnection(function (err, connection) {
				if (err) throw err;
				
				var sql = "SELECT name,content,score,date_format(date, '%Y/%m/%d %H:%i') as date FROM review WHERE code=?";
				connection.query(sql,[code], function (err, result) {
					if (err) console.error(err);
					
					console.log("리뷰조회 : ", result);
					connection.release();
					res.render('read', {username:req.session.username, title:"상품정보", row:product, review:result, admin:req.session.admin});
					
				});
			});
		});
	});
});

/* 리뷰조회 */
router.post('/review', function(req, res) {
	
	console.log(req.body);
	
	pool.getConnection(function (err, connection) {
		var sql = "INSERT INTO review(code,name,content,score,date) VALUE(?,?,?,?,CURRENT_TIMESTAMP)";
		connection.query(sql,[req.body.code,req.body.r_name,req.body.r_content,req.body.score], function (err, row) {
			if(err) console.error(err);
			var URL = "/list/read/"+req.body.code;
			res.redirect(URL);
			connection.release();
		});
		
	});
});

module.exports = router;
