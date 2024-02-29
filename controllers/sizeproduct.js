const e = require("express");
var express = require("express");
var size = express.Router();
var sizes = require("../models/sizeProduct.js");
var products = require("../models/products.js");
size.get("/isize", (req, res) => {
  res.render("admin/insert_size");
});
size.get("/listsize", (req, res) => {
  sizes.find().then(function (data) {
    console.log(data);
    res.render("user/list_size", { item: data });
  });
});
size.get("/admin/listsize", checkadmin, (req, res) => {
  var message = req.flash("error");
  sizes.find().then(function (data) {
    res.render("admin/list_size", { item: data, message: message });
  });
});
size.get("/admin/insertsize", checkadmin, (req, res) => {
  res.render("admin/insert_size");
});

size.post("/insertsize", (req, res) => {
  var size = sizes({
    size: req.body.size,
  });
  size.save(function (err, data) {
    if (err) {
      res.redirect("/isize", {
        message: "Thêm mới không thành công",
      });
    } else {
      sizes.find().then(function (data) {
        res.render("admin/list_size", {
          item: data,
          message: "Thêm mới thành công",
        });
      });
    }
  });
});
size.get("/admin/edit_size/:id", (req, res) => {
  sizes.findById(req.params.id, function (err, data) {
    if (!err) {
      res.render("admin/edit_size", {
        item: data,
      });
    }
  });
});
size.post("/updatesize/:id", (req, res) => {
  sizes.updateOne(
    {_id:req.params.id},
    {
      $set:{size: req.body.size,}
    },
    function (err) {
      if (err) {
        res.redirect("/admin/edit_size", {
          message: "Cập nhật không thành công",
        });
      } else {
        sizes.find().then(function (data) {
          res.render("admin/list_size", {
            item: data,
            message: "Cập nhật thành công",
          });
        });
      }
    }
  );
});
size.get("/size/:id", (req, res) => {
  let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
  let page = req.params.page || 1;

  products
    .find({ sizeID: req.params.id }) // find tất cả các data
    .sort({ date: "descending" })
    .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, data) => {
      products.countDocuments((err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        res.render("user/view_size", {
          danhsach: data,
          message: "Xóa thành công",
          current: page, // page hiện tại
          pages: Math.ceil(count / perPage),
        }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
});
size.get("/delete_size/:id", (req, res) => {
  if (req.session.loggin) {
    sizes.deleteOne({ _id: req.params.id }, function (err) {
      if (err) {
        res.redirect("/admin/listsize");
      } else {
        sizes.find().then(function (data) {
          res.render("admin/list_size", {
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
module.exports = size;
