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

router.get('/', function(req, res) {
  if(req.session.admin)res.redirect('/inquiry/admin')
  if(!req.session.username)res.redirect('/login')
  var CurrPage  = Number(req.query.page);   // 현재 페이지 인덱스
  if(!CurrPage)CurrPage = 1;
	var TotalPage;  // 총 페이지 수
	var articles = "";     // 게시판 내용
  var pageArticleNum = 10; // 한 페이지에 표시될 게시글의 개수
  var pageListNum = 5;  // 한 화면에 표시될 페이지 인덱스의 수
  var startPage;  // 현재 화면 시작 인덱스
  var endPage;    // 현재 화면 끝 인덱스
  var Articles;
	async.waterfall([
	  function(callback){

      pool.getConnection(function (err, connection) {
        var sql = "SELECT COUNT(*) AS count FROM inquiry WHERE creator=(select email from user where username=?)";
        connection.query(sql, [req.session.username], function(err, result){
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
        var sql = "SELECT idx, title, content, answer, date_format(date, '%m-%d') as date FROM inquiry WHERE creator=(select email from user where username=?) ORDER BY idx desc LIMIT ?, ?";
        connection.query(sql, [req.session.username, (totalpage.Curr-1)*pageArticleNum, pageArticleNum], function(err, result){
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
        res.render('inquiry',{
          title: 'inquiry',
          articles: Articles,
          username:req.session.username,
          admin:req.session.admin
        });
      }
    }
  );
});

router.get('/read', function(req, res){
  var idx=req.query.idx;
  pool.getConnection(function(err, connection){
    var sql = "update board1 set hit=hit+1 where idx=?"
    connection.query(sql, idx, function(err, result){
      if(err) console.error(err);
    });
    sql = "SELECT idx, title, date, content, hit FROM board1 WHERE idx = ?";
    connection.query(sql, idx, function(err, result){
      if(err) console.error(err);
      res.render('noticeRead', {username:req.session.username, row:result[0], admin:req.session.admin});
      connection.release();
    });
  });
});

router.get('/write', function(req, res){
  res.render('inquiryWrite', {username:req.session.username, admin:req.session.admin});
});

router.post('/write', function(req, res){
  pool.getConnection(function(err, connection){
    var data=[req.body.title, req.body.content, req.session.username];
    var sql = "INSERT INTO inquiry(title, content, date, creator) VALUES(?, ?, CURRENT_TIMESTAMP, (select email from user where username=?))";
    connection.query(sql, data, function(err, result){
          if(err) console.error(err);
          res.redirect('/inquiry');
          connection.release();
        });
  });
})

router.get('/delete', function(req, res){
  var idx=req.query.idx;
  pool.getConnection(function(err, connection){
    var sql = "delete from board1 WHERE idx = ?";
    connection.query(sql, idx, function(err, result){
      if(err) console.error(err);
      res.redirect('/inquiry');
      connection.release();
    });
  });
});

router.get('/admin', function(req, res) {
  if(!req.session.admin)res.redirect('/inquiry')
  var CurrPage  = Number(req.query.page);   // 현재 페이지 인덱스
  if(!CurrPage)CurrPage = 1;
	var TotalPage;  // 총 페이지 수
	var articles = "";     // 게시판 내용
  var pageArticleNum = 10; // 한 페이지에 표시될 게시글의 개수
  var pageListNum = 5;  // 한 화면에 표시될 페이지 인덱스의 수
  var startPage;  // 현재 화면 시작 인덱스
  var endPage;    // 현재 화면 끝 인덱스
  var Articles;
	async.waterfall([
	  function(callback){

      pool.getConnection(function (err, connection) {
        var sql = "SELECT COUNT(*) AS count FROM inquiry";
        connection.query(sql, [req.session.username], function(err, result){
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
        var sql = "SELECT idx, title, content, creator, answer, date_format(date, '%m-%d') as date FROM inquiry ORDER BY idx desc LIMIT ?, ?";
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
        res.render('inquiryAdmin',{
          title: 'inquiry',
          articles: Articles,
          username:req.session.username,
          admin:req.session.admin
          , sale:req.session.sale
        });
      }
    }
  );
});
router.get('/answer', function(req, res){
  if(!req.session.admin)res.redirect('/main')
  var idx=req.query.idx;
  pool.getConnection(function(err, connection){
    var sql = "SELECT idx, title, date, content FROM inquiry WHERE idx = ?";
    connection.query(sql, idx, function(err, result){
      if(err) console.error(err);
      console.log(result[0])
      res.render('inquiryAnswer', {username:req.session.username, row:result[0], admin:req.session.admin, sale:req.session.sale});
      connection.release();
    });
  });
});
router.post('/answer', function(req, res){
  if(!req.session.admin)res.redirect('/main')
  var idx=req.query.idx;
  pool.getConnection(function(err, connection){
    var sql = "UPDATE inquiry set answer=? WHERE idx = ?";
    connection.query(sql, [req.body.answer,idx], function(err, result){
      if(err) console.error(err);
      console.log(result[0])
      res.redirect('/inquiry');
      connection.release();
    });
  });
});

router.get('/update', function(req, res){
  if(!req.session.admin)res.redirect('/main')
  var idx=req.query.idx;
  pool.getConnection(function(err, connection){
    var sql = "SELECT idx, title, date, content, answer FROM inquiry WHERE idx = ?";
    connection.query(sql, idx, function(err, result){
      if(err) console.error(err);
      console.log(result[0])
      res.render('inquiryUpdate', {username:req.session.username, row:result[0], admin:req.session.admin, sale:req.session.sale});
      connection.release();
    });
  });
});
router.post('/update', function(req, res){
  if(!req.session.admin)res.redirect('/main')
  var idx=req.query.idx;
  pool.getConnection(function(err, connection){
    var sql = "UPDATE inquiry set answer=? WHERE idx = ?";
    connection.query(sql, [req.body.answer,idx], function(err, result){
      if(err) console.error(err);
      console.log(result[0])
      res.redirect('/inquiry');
      connection.release();
    });
  });
});
module.exports = router;