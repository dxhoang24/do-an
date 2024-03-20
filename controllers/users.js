var express = require("express");
const moment = require('moment')

var router = express.Router();
const { check, validationResult } = require("express-validator");
var passport = require("passport");
const userModel = require("../models/user");
const products = require("../models/products");
var Cart = require("../models/Cart.js");
const exportExcel = require("../libs/export.js");


/* GET home page. */
router.get("/home",async function (req, res, next) {
  if (req.session.loggin) {
    user = req.user;
    if (user.role == "admin") {
      let query = {}
      let time= new Date()
      let start = req.query.startTime && req.query.startTime !="" ? moment(req.query.startTime, 'YYYY-MM-DD').startOf('day').toISOString() : moment().startOf('day').toISOString();
      let end = req.query.endTime && req.query.endTime !=""  ? moment(req.query.endTime, 'YYYY-MM-DD').endOf('day').toISOString() : moment().endOf('day').toISOString();

      query.date = {
        $gte: moment(start).toDate(),
        $lt: moment(end).toDate(),
      }
      let agg = [
        { $match: {st:1,...query}},
        { $unwind: '$cart' },
        {
          $group: {
            _id: {
              productId: '$cart.item._id',
            },
            nameProduct: { $first: '$cart.item.name' },
            price: { $sum: { $multiply: ['$cart.price', '$cart.qty'] } }, // Tính tổng giá bằng giá nhân số lượng
            quantity: { $sum: '$cart.qty' } // Tính tổng số lượng
          }
        },
        { $sort: {quantity:-1}}
      ];
      console.log(JSON.stringify(Cart.aggregate(agg)));
      // Thực hiện truy vấn MongoDB
      Cart.aggregate(agg)
        .exec()
        .then(data => {          
        })
        .catch(error => {
          console.error(error);
        });
        userModel.find({ role: "user" }).then(function (data2) {
          listuser = data2;
          products.find().then(function (data3) {
            res.render("admin/index-admin", {
              danhsach: data3,
            });
          });
        });
      // let arrCart = await Cart.find()

      // userModel.find({ role: "user" }).then(function (data) {
      //   listuser = data;
      //   listCart= arrCart
      //   products.find().then(function (data) {
      //     res.render("admin/index-admin", {
      //       danhsach: data,
      //     });
      //   });
        
      // });
    } else {
      products
        .find()
        .sort({ ngaynhap: "descending" })
        .limit(12)
        .exec(function (err, data) {
          if (err) {
            res.json({ kq: 0, errMsg: err });
          } else {
            res.render("user/index", { danhsach: data });
          }
        });
    }
  } else {
    user = null;
    products
      .find()
      .sort({ ngaynhap: "descending" })
      .limit(12)
      .exec(function (err, data) {
        if (err) {
          res.json({ kq: 0, errMsg: err });
        } else {
          res.render("user/index", { danhsach: data });
        }
      });
  }
});

/* GET sign-in page. */
router.get("/login", function (req, res, next) {
  user = null;
  // Hiển thị trang và truyển lại những tin nhắn từ phía server nếu có
  var message = req.flash("error");
  res.render("login", {
    message: message,
    hasErrors: message.length > 0,
  });
});
router.get("/register", function (req, res, next) {
  // Hiển thị trang và truyển lại những tin nhắn từ phía server nếu có
  var message = req.flash("error");
  res.render("register", {
    message: message,
    hasErrors: message.length > 0,
  });
});
router.get("/lock/:id", (req, res) => {
  userModel.findOne({ _id: req.params.id }, function (err, data) {
    data.lock = 1;
    data.save();
    res.redirect("/view_user");
  });
});
router.get("/unlock/:id", (req, res) => {
  userModel.findOne({ _id: req.params.id }, function (err, data) {
    data.lock = 0;
    data.save();
    res.redirect("/view_user");
  });
});
/* Post sign-up page. */
// Xử lý thông tin khi có người đăng nhập
router.post(
  "/signin",
  passport.authenticate("local.signin", {
    successRedirect: "/home",
    failureRedirect: "/login",
    failureFlash: true,
  })
);

/*---------------Xoá tài khoản ------------------------*/

router.get("/delete-user/:id", (req, res) => {
  if (req.session.loggin) {
    userModel.deleteOne({ _id: req.params.id }, function (err, data) {
      req.session.destroy(function (err) {
        if (err) {
          return next(err);
        } else {
          return res.redirect("/");
        }
      });
    });
  }
});

/* Post sign-up page. */
// Xử lý thông tin khi có người đăng ký
router.post(
  "/signup",
  [
    check("email", "Email không được để trống").isEmail(),
    check("password", "Mật khẩu phải có ít nhất 5 ký tự").isLength({ min: 5 }),
  ],
  function (req, res, next) {
    var message = req.flash("error");
    const result = validationResult(req);
    var errors = result.errors;
    if (!result.isEmpty()) {
      var message = [];
      errors.forEach(function (error) {
        message.push(error.msg);
      });
      res.render("login", {
        message: message,
        hasErrors: message.length > 0,
      });
    } else {
      next();
    }
  },
  passport.authenticate("local.signup", {
    successRedirect: "/login",
    failureRedirect: "login",
    failureFlash: true,
  })
);

// =------------------ Đăng xuất ----------------------------//
router.get("/logout", function (req, res, next) {
  req.logout();
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        user = null;
        return res.redirect("/login");
      }
    });
  }
});

// serch
router.get("/timkiem",async function (req, res, next) {
      let query = {}
      let time= new Date()
      let start = req.query.startTime && req.query.startTime !="" ? moment(req.query.startTime, 'YYYY-MM-DD').startOf('day').toISOString() : moment().startOf('day').toISOString();
      let end = req.query.endTime && req.query.endTime !=""  ? moment(req.query.endTime, 'YYYY-MM-DD').endOf('day').toISOString() : moment().endOf('day').toISOString();

      query.date = {
        $gte: moment(start).toDate(),
        $lt: moment(end).toDate(),
      }
      let agg = [
        { $match: {st:1,...query}},
        { $unwind: '$cart' },
        {
          $group: {
            _id: {
              productId: '$cart.item._id',
            },
            image: {$first: '$cart.item.image'},
            nameProduct: { $first: '$cart.item.name' },
            price: { $sum: { $multiply: ['$cart.price', '$cart.qty'] } }, // Tính tổng giá bằng giá nhân số lượng
            quantity: { $sum: '$cart.qty' } // Tính tổng số lượng
          }
        },
      ];
      // Thực hiện truy vấn MongoDB
      Cart.aggregate(agg)
        .exec()
        .then(data => {
          res.json({data:data, status:200})
        })
        .catch(error => {
          console.error(error);
        });
})
router.get("/downloadCart", async (req, res) => {
  try {
    let query = {}
      let time= new Date()
      let startDate = req.query.startTime && req.query.startTime !="" ? moment(req.query.startTime, 'YYYY-MM-DD').startOf('day') : moment().startOf('day');
      let endDate = req.query.endTime && req.query.endTime !=""  ? moment(req.query.endTime, 'YYYY-MM-DD').endOf('day') : moment().endOf('day');
      let start = req.query.startTime && req.query.startTime !="" ? moment(req.query.startTime, 'YYYY-MM-DD').startOf('day').toISOString() : moment().startOf('day').toISOString();
      let end = req.query.endTime && req.query.endTime !=""  ? moment(req.query.endTime, 'YYYY-MM-DD').endOf('day').toISOString() : moment().endOf('day').toISOString();

      query.date = {
        $gte: moment(start).toDate(),
        $lt: moment(end).toDate(),
      }
      let agg = [
        { $match: {st:1,...query}},
        { $unwind: '$cart' },
        {
          $group: {
            _id: {
              productId: '$cart.item._id',
            },
            image: {$first: '$cart.item.image'},
            nameProduct: { $first: '$cart.item.name' },
            price: { $sum: { $multiply: ['$cart.price', '$cart.qty'] } }, // Tính tổng giá bằng giá nhân số lượng
            quantity: { $sum: '$cart.qty' } // Tính tổng số lượng
          }
        },
      ];
      // Thực hiện truy vấn MongoDB
      return new Promise((resolve, reject) => {
        Cart.aggregate(agg).then(data => {
          let excel = {
            fileName: `Thongke_tu_${req.query.startTime}_den_${req.query.endTime}`,
            title: `THốNG KÊ DOANH SỐ BÁN HÀNG`,
            titleHeadTable: [
              { key: "nameProduct", value: "Tên sản phẩm" },
              { key: "quantity", value: "Số lượng" },
              { key: "price", value: "Thành tiền" },
            ],
            valueWidthColumn: [50,50,50],
          };
          exportExcel.exportExcel(data, excel, res, req);
        })
      })
    
  } catch (error) {
    console.error("Error:", error);
    // Xử lý lỗi nếu có
  }
});
module.exports = router;
