const e = require("express");
var express = require("express");
var color = express.Router();
var colors = require("../models/colorProduct.js");
var products = require("../models/products.js");
color.get("/icolor", (req, res) => {
  res.render("admin/insert_color");
});
color.get("/listcolor", (req, res) => {
  colors.find().then(function (data) {
    console.log(data);
    res.render("user/list_color", { item: data });
  });
});
color.get("/admin/listcolor", checkadmin, (req, res) => {
  var message = req.flash("error");
  colors.find().then(function (data) {
    res.render("admin/list_color", { item: data, message: message });
  });
});
color.get("/admin/insertcolor", checkadmin, (req, res) => {
  res.render("admin/insert_color");
});

color.post("/insertcolor", (req, res) => {
  var color = colors({
    namecolor: req.body.namecolor,
  });
  color.save(function (err, data) {
    if (err) {
      res.redirect("/icolor", {
        message: "Thêm mới không thành công",
      });
    } else {
      colors.find().then(function (data) {
        res.render("admin/list_color", {
          item: data,
          message: "Thêm mới thành công",
        });
      });
    }
  });
});
color.get("/admin/edit_color/:id", (req, res) => {
  colors.findById(req.params.id, function (err, data) {
    if (!err) {
      res.render("admin/edit_color", {
        item: data,
      });
    }
  });
});
color.post("/updatecolor/:id", (req, res) => {
  colors.updateOne(
    {_id:req.params.id},
    {
      $set:{namecolor: req.body.namecolor,}
    },
    function (err) {
      if (err) {
        res.redirect("/admin/edit_color", {
          message: "Cập nhật không thành công",
        });
      } else {
        colors.find().then(function (data) {
          res.render("admin/list_color", {
            item: data,
            message: "Cập nhật thành công",
          });
        });
      }
    }
  );
});
color.get("/color/:id", (req, res) => {
  let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
  let page = req.params.page || 1;

  products
    .find({ colorID: req.params.id }) // find tất cả các data
    .sort({ date: "descending" })
    .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, data) => {
      products.countDocuments((err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        res.render("user/view_color", {
          danhsach: data,
          message: "Xóa thành công",
          current: page, // page hiện tại
          pages: Math.ceil(count / perPage),
        }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
});
color.get("/delete_color/:id", (req, res) => {
  if (req.session.loggin) {
    colors.deleteOne({ _id: req.params.id }, function (err) {
      if (err) {
        res.redirect("/admin/listcolor");
      } else {
        colors.find().then(function (data) {
          res.render("admin/list_color", {
            item: data,
            message: "Xóa thành công",
          });
        });
      }
    });
  } else {
    res.redirect("/home");
  }
});
function checkadmin(req, res, next) {
  if (!req.session.loggin) {
    res.redirect("/");
  } else {
    next();
  }
}
module.exports = color;
