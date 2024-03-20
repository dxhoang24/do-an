var express = require("express");
const products = require("../models/products");
const comments = require("../models/comment");
var cates = require("../models/Cate.js");
var colors = require("../models/colorProduct.js");
var sizes = require("../models/sizeProduct.js");
var providers = require("../models/provider.js");

var detail_product = express.Router();

detail_product.get("/user/detail-product/:id", (req, res) => {
  if (req.session.loggin) {
    Promise.all([cates.find(), colors.find(), sizes.find(), providers.find()])
      .then(function (results) {
        // results là một mảng chứa kết quả của cả bốn truy vấn
        const [catesData, colorsData, sizesData, providersData] = results;
        const dataCates = catesData;
        const dataColors = colorsData;
        const dataSizes = sizesData;
        const dataProviders = providersData;

        // Tiếp tục xử lý sau khi lấy dữ liệu từ các truy vấn
        products.findById(req.params.id, function (err, data) {
          if (err) {
            // Xử lý lỗi nếu có
            console.error("Error:", err);
            res.status(500).send("Internal Server Error");
          } else {
            const danhsach = data; // Dữ liệu sản phẩm

            const idsp = danhsach._id;
            comments.find({ idsp }).then(function (cmtData) {
              // Lấy dữ liệu comment
              console.log(cmtData);
              res.render("user/Detailproducts", {
                danhsach: danhsach, // Dữ liệu sản phẩm
                cmt: cmtData,       // Dữ liệu comment
                cates: dataCates,   // Dữ liệu danh mục
                colors: dataColors, // Dữ liệu màu sắc
                sizes: dataSizes,   // Dữ liệu size
                providers: dataProviders, // Dữ liệu nhà cung cấp
                user: req.user,
              });
            }).catch(function (error) {
              console.error("Error:", error);
              res.status(500).send("Internal Server Error");
            });
          }
        });
      })
      .catch(function (error) {
        console.error("Error:", error);
        // Xử lý lỗi nếu có
        res.status(500).send("Internal Server Error");
      });
  } else {
    res.redirect("/login");
  }
});

detail_product.post("/comment", (req, res) => {
  if (req.session.loggin) {
    user = req.user;

    var comment = comments({
      uname: user.name,
      idsp: req.body.idsp,
      note: req.body.note,
      ngaygui: Date.now(),
    });
    comment.save(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/product");
      }
    });
  }
});

detail_product.get("/delete-comment/:id", (req, res) => {
  comments.deleteOne({ _id: req.params.id }, function (err) {
    if (err) {
      res.redirect("/product");
    } else {
      res.redirect("/product");
    }
  });
});

//giỏ hàngrouter.get('/cart',async function (req, res){

module.exports = detail_product;
