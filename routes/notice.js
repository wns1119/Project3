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
        var sql = "SELECT COUNT(*) AS count FROM board1";
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
        var sql = "SELECT idx, title, date, creator, hit FROM board1 ORDER BY idx desc LIMIT ?, ?";
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
        res.render('notice',{
          title: 'notice',
          articles: Articles,
          username:req.session.username
        });
      }
    }
  );
});

router.get('/read', function(req, res){
  var idx=req.query.idx;
  pool.getConnection(function(err, connection){
    var sql = "SELECT idx, title, date, content, creator, hit FROM board1 WHERE idx = ?";
    connection.query(sql, idx, function(err, result){
          if(err) console.error(err);
          res.render('noticeRead', {username:req.session.username, row:result[0]});
          connection.release();
        });
  });
});
module.exports = router;