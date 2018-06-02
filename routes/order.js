var express = require('express');
var router = express.Router();


router.post('/', function(req, res, next) {
	
	var count = Object.keys(req.body.checkRow).length;
	var product = [];

	if(req.session.username == null){
		res.send("<script>alert('로그인을 해주세요.');location.href='/login';</script>");
	}
	else{
		for(var i=0; i<count; i++){
			var index = req.body.checkRow[i];
			product.push({code:req.body.code[index],name:req.body.product_name[index],amount:req.body.amount[index],sum:req.body.sum[index]});
		}
		console.log(product);
		res.render('order', { title: '주문' , username:req.session.username, product:product, admin:req.session.admin});
	}
	
});

module.exports = router;
