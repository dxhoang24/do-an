const e = require("express");
var express = require("express");
var provider = express.Router();
var providers = require("../models/provider.js");
var products = require("../models/products.js");
provider.get("/iprovider", (req, res) => {
  res.render("admin/insert_provider");
});
provider.get("/listprovider", (req, res) => {
  providers.find().then(function (data) {
    console.log(data);
    res.render("user/list_provider", { item: data });
  });
});
provider.get("/admin/listprovider", checkadmin, (req, res) => {
  var message = req.flash("error");
  providers.find().then(function (data) {
    res.render("admin/list_provider", { item: data, message: message });
  });
});
provider.get("/admin/insertprovider", checkadmin, (req, res) => {
  res.render("admin/insert_provider");
});

provider.post("/insertprovider", (req, res) => {
  var provider = providers({
    nameprovider: req.body.nameprovider,
    phone: req.body.phone,
    email: req.body.email,
    address: req.body.address,
  });
  provider.save(function (err, data) {
    if (err) {
      res.redirect("/iprovider", {
        message: "Thêm mới không thành công",
      });
    } else {
      providers.find().then(function (data) {
        res.render("admin/list_provider", {
          item: data,
          message: "Thêm mới thành công",
        });
      });
    }
  });
});
provider.get("/admin/edit_provider/:id", (req, res) => {
  providers.findById(req.params.id, function (err, data) {
    if (!err) {
      res.render("admin/edit_provider", {
        item: data,
      });
    }
  });
});
provider.post("/updateprovider/:id", (req, res) => {
  providers.updateOne(
    {_id:req.params.id},
    {
      $set:{
        nameprovider: req.body.nameprovider,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        }
    },
    function (err) {
      if (err) {
        res.redirect("/admin/edit_provider", {
          message: "Cập nhật không thành công",
        });
      } else {
        providers.find().then(function (data) {
          res.render("admin/list_provider", {
            item: data,
            message: "Cập nhật thành công",
          });
        });
      }
    }
  );
});
provider.get("/provider/:id", (req, res) => {
  let perPage = 8; // số lượng sản phẩm xuất hiện trên 1 page
  let page = req.params.page || 1;

  products
    .find({ providerID: req.params.id }) // find tất cả các data
    .sort({ date: "descending" })
    .skip(perPage * page - perPage) // Trong page đầu tiên sẽ bỏ qua giá trị là 0
    .limit(perPage)
    .exec((err, data) => {
      products.countDocuments((err, count) => {
        // đếm để tính có bao nhiêu trang
        if (err) return next(err);
        res.render("user/view_provider", {
          danhsach: data,
          message: "Xóa thành công",
          current: page, // page hiện tại
          pages: Math.ceil(count / perPage),
        }); // Trả về dữ liệu các sản phẩm theo định dạng như JSON, XML,...
      });
    });
});
provider.get("/delete_provider/:id", (req, res) => {
  if (req.session.loggin) {
    providers.deleteOne({ _id: req.params.id }, function (err) {
      if (err) {
        res.redirect("/admin/listprovider");
      } else {
        providers.find().then(function (data) {
          res.render("admin/list_provider", {
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
module.exports = provider;
