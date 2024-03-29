var express = require("express");
var contacts = require("../models/contact");
const userModel = require("../models/user");
var client = express.Router();

client.get("/client", (req, res) => {
  if (req.session.loggin) {
    res.render("client", {
      user: req.user,
    });
  } else {
    var message = req.flash("error");

    res.render("login", {
      message: message,
      hasErrors: message.length > 0,
    });
  }
});
client.post("/edit-user", (req, res) => {
  console.log("req",req.body);
  userModel.updateOne(
    {_id:req.body.id},
    {
      $set: req.body
    },
    function (err) {
      if (err) {
        res.redirect("/client", 500);
      } else {
        res.redirect("/client", 301);
      }
    }
  );
});
client.get("/admin/clientadmin", (req, res) => {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      contacts
        .find()
        .sort({ ngaygui: "descending" })
        .exec(function (err, data) {
          if (err) {
            res.json({ kq: 0, errMsg: err });
          } else {
            res.render("admin/index-admin", { danhsach: data });
          }
        });
    } else {
      res.render("client");
    }
  } else {
    res.render("login");
  }
});
module.exports = client;
