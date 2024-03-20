var express = require("express");
var detail_notifi = express.Router();
var nodemailer = require('nodemailer');
const contacts = require("../models/contact");

detail_notifi.get("/detail-notification/:id", (req, res) => {
  contacts.findById(req.params.id, function (err, data) {
    res.render("admin/detail-notifi", {
      list: data,
    });
  });
});
detail_notifi.post("/sendmail", (req, res) => {
  console.log("req",req.body);
  let sub = req.body.type=='lienhe' ? 'Phản hồi liên hệ' :'Thông tin đơn hàng'
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'daohoang240620@gmail.com',
      pass: 'fzot ftdy sxsz qsjy'
    }
  });
  
  var mailOptions = {
    from: 'daohoang240620@gmail.com',
    to: req.body.email,
    subject: sub,
    text: req.body.noidung
  };
  
  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent success');
    }
  });  
});
module.exports = detail_notifi;
