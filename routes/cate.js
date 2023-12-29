const e = require("express");
var express = require("express");
var cate = express.Router();
var cates = require("../models/Cate.js");
var products = require("../models/products.js");
cate.get("/icate", (req, res) => {
  res.render("admin/insert_cate");
});
cate.get("/listcate", (req, res) => {
  cates.find().then(function (data) {
    console.log(data);
    res.render("user/list_cate", { item: data });
  });
});
cate.get("/admin/listcate", checkadmin, (req, res) => {
  var message = req.flash("error");
  cates.find().then(function (data) {
    res.render("admin/list_cate", { item: data, message: message });
  });
});
cate.get("/admin/insertcate", checkadmin, (req, res) => {
  res.render("admin/insert_cate");
});

cate.post("/insertcate", (req, res) => {
  var cate = cates({
    namecate: req.body.namecate,
  });
  cate.save(function (err, data) {
    if (err) {
      res.redirect("/icate", {
        message: "Thêm mới không thành công",
      });
    } else {
      cates.find().then(function (data) {
        res.render("admin/list_cate", {
          item: data,
          message: "Thêm mới thành công",
        });
      });
    }
  });
});
cate.get("/admin/edit_cate/:id", (req, res) => {
  cates.findById(req.params.id, function (err, data) {
    if (!err) {
      res.render("admin/edit_cate", {
        item: data,
      });
    }
  });
});
cate.post("/updatecate", (req, res) => {
  cates.updateOne(
    {
      namecate: req.body.namecate,
    },
    function (err) {
      if (err) {
        res.redirect("/admin/edit_cate", {
          message: "Cập nhật không thành công",
        });
      } else {
        cates.find().then(function (data) {
          res.render("admin/list_cate", {
            item: data,
            message: "Cập nhật thành công",
          });
        });
      }
    }
  );
});
cate.get("/cate/:id", (req, res) => {
    let perPage = 12; // số lượng sản phẩm xuất hiện trên 1 page
    let page = req.params.page || 1;

    products
        .find({ cateID: req.params.id }) // find tất cả các data
        .sort({ date: "descending" })
        .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
        .limit(perPage)
        .exec((err, data) => {
        products.countDocuments((err, count) => {
            console.log("dataaaa",data);
            // đếm để tính có bao nhiêu trang
            if (err) return next(err);
            res.render("user/view_cate", {
            danhsach: data,
            message : "Xóa thành công",
            current: page, // page hiện tại
            pages: Math.ceil(count / perPage),
            }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
        });
        });

});
cate.get("/delete_cate/:id", (req, res) => {
  if (req.session.loggin) {
    cates.deleteOne({ _id: req.params.id }, function (err) {
      if (err) {
        res.redirect("/admin/listcate");
      } else {
        cates.find().then(function (data) {
          res.render("admin/list_cate", {
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
module.exports = cate;
