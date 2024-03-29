var express = require("express");
var about = express.Router();

var config = require('config');
// var dateFormat = require('dateformat');
about.get("/about", checklogin, (req, res) => {
  res.render("user/about");
});
function checklogin(req, res) {
  if (req.session.login) {
    user = req.user;
    res.render("user/about");
  } else {
    user == null;
    res.render("user/about");
  }
}
about.post('/create_payment_url', function (req, res, next) {
  var ipAddr = req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress;


  
  var tmnCode = 'W1E9DZYR';
  var secretKey = 'BXCOKFNKSLKQWGYXPMSZZVVORMMKBQES';
  var vnpUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
  var returnUrl = 'http://localhost:5000/home';

  var date = new Date();

  var createDate = moment(date, 'yyyymmddHHmmss').format('yyyymmddHHmmss');
  var orderId = moment(date, 'HHmmss').format('HHmmss');
  // var amount = req.body.amount;
  var amount = 10000
  var bankCode = 'NCB'
  
  var orderInfo = "billpayment";
  var orderType = "VNP001";
  var locale = req.body.language;
  if(locale === null || locale === ''){
      locale = 'vn';
  }
  var currCode = 'VND';
  var vnp_Params = {};
  vnp_Params['vnp_Version'] = '2.1.0';
  vnp_Params['vnp_Command'] = 'pay';
  vnp_Params['vnp_TmnCode'] = tmnCode;
  // vnp_Params['vnp_Merchant'] = ''
  vnp_Params['vnp_Locale'] = locale;
  vnp_Params['vnp_CurrCode'] = currCode;
  vnp_Params['vnp_TxnRef'] = orderId;
  vnp_Params['vnp_OrderInfo'] = orderInfo;
  vnp_Params['vnp_OrderType'] = orderType;
  vnp_Params['vnp_Amount'] = amount * 100;
  vnp_Params['vnp_ReturnUrl'] = returnUrl;
  vnp_Params['vnp_IpAddr'] = ipAddr;
  vnp_Params['vnp_CreateDate'] = createDate;
  if(bankCode !== null && bankCode !== ''){
      vnp_Params['vnp_BankCode'] = bankCode;
  }

  console.log(JSON.stringify(vnp_Params));
  vnp_Params = sortObject(vnp_Params);

  var querystring = require('qs');
  var signData = querystring.stringify(vnp_Params, { encode: false });
  var crypto = require("crypto");     
  var hmac = crypto.createHmac("sha512", secretKey);
  var signed = hmac.update(new Buffer(signData, 'utf-8')).digest("hex"); 
  vnp_Params['vnp_SecureHash'] = signed;
  vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

  res.redirect(vnpUrl)
});

function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
		if (obj.hasOwnProperty(key)) {
		str.push(encodeURIComponent(key));
		}
	}
	str.sort();
    for (key = 0; key < str.length; key++) {
        sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
    }
    return sorted;
}

module.exports = about;
