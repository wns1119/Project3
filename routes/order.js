var express = require('express');
var router = express.Router();


router.post('/', function(req, res, next) {
	
	var product = [];
	
	if(req.session.username == null){
		res.send("<script>alert('로그인을 해주세요.');location.href='/login';</script>");
	}
	else{
		if(req.body.checkRow != undefined){		// 장바구니를 통한 구매
			var count = Object.keys(req.body.checkRow).length;
			for(var i=0; i<count; i++){
				var index = req.body.checkRow[i];
				product.push({code:req.body.code[index],name:req.body.product_name[index],amount:req.body.amount[index],sum:req.body.sum[index]});
			}
		}
		else{	// 상품화면을 통한 구매
			console.log(req.body);
			product.push({code:req.body.code,name:req.body.product_name,amout:req.body.amount,sum:req.body.sum});
		}

		console.log(product);
		res.render('order', { title: '주문' , username:req.session.username, product:product, admin:req.session.admin});
	}
	
});

module.exports = router;
